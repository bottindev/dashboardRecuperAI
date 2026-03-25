---
phase: 01-fix-foundation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/phases/01-fix-foundation/migrations/001-verify-prerequisites.sql
  - .planning/phases/01-fix-foundation/migrations/002-recreate-ceo-client-performance.sql
  - .planning/phases/01-fix-foundation/migrations/003-recreate-salon-funnel.sql
  - .planning/phases/01-fix-foundation/migrations/004-seed-soul-bela.sql
  - .planning/phases/01-fix-foundation/migrations/002-rollback-ceo-client-performance.sql
  - .planning/phases/01-fix-foundation/migrations/003-rollback-salon-funnel.sql
  - .planning/phases/01-fix-foundation/migrations/006-create-indexes.sql
autonomous: true

must_haves:
  truths:
    - "SELECT * FROM ceo_client_performance executes without error"
    - "SELECT * FROM salon_funnel executes without error and respects 90-day window"
    - "SELECT mrr FROM ceo_overview returns value > 0"
    - "Views preserve exact column names used by useDashboardData.js"
  artifacts:
    - path: ".planning/phases/01-fix-foundation/migrations/002-recreate-ceo-client-performance.sql"
      provides: "Recreated ceo_client_performance view (drop+recreate, NULL-safe aggregates)"
    - path: ".planning/phases/01-fix-foundation/migrations/003-recreate-salon-funnel.sql"
      provides: "Recreated salon_funnel view with 90-day filter"
    - path: ".planning/phases/01-fix-foundation/migrations/004-seed-soul-bela.sql"
      provides: "Idempotent seed for Soul Bela contract data"
  key_links:
    - from: "ceo_client_performance view"
      to: "src/hooks/useDashboardData.js"
      via: "supabase.from('ceo_client_performance').select('*')"
      pattern: "ceo_client_performance"
    - from: "salon_funnel view"
      to: "src/hooks/useDashboardData.js"
      via: "supabase.from('salon_funnel')"
      pattern: "salon_funnel"
    - from: "ceo_overview view"
      to: "src/hooks/useDashboardData.js"
      via: "supabase.from('ceo_overview').select('*').limit(1).single()"
      pattern: "ceo_overview"
---

<objective>
Fix broken Supabase views and seed missing data so the dashboard can query without errors and MRR shows a real value.

Purpose: FIX-01 (views execute without error) and FIX-02 (Soul Bela seed, MRR > 0). These are the database-level blockers that prevent any dashboard feature from working.

Output: 4 migration SQL files + 2 rollback files, all applied to Supabase via MCP execute_sql tool.
</objective>

<execution_context>
@C:\Users\berna\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\berna\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-fix-foundation/01-RESEARCH.md
@.planning/phases/01-fix-foundation/01-CONTEXT.md
@src/hooks/useDashboardData.js
</context>

<tasks>

<task type="auto">
  <name>Task 1: Verify prerequisite migrations and recreate views</name>
  <files>
    .planning/phases/01-fix-foundation/migrations/001-verify-prerequisites.sql
    .planning/phases/01-fix-foundation/migrations/002-recreate-ceo-client-performance.sql
    .planning/phases/01-fix-foundation/migrations/002-rollback-ceo-client-performance.sql
    .planning/phases/01-fix-foundation/migrations/003-recreate-salon-funnel.sql
    .planning/phases/01-fix-foundation/migrations/003-rollback-salon-funnel.sql
  </files>
  <action>
**Step 1: Verify production state.**

Use the Supabase MCP `execute_sql` tool to run these diagnostic queries against the production database (project `ahxbwzfdtjhfoytfshif`):

```sql
-- Check if Motor 1 tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('recuperai_contratos', 'recuperai_pipeline', 'recuperai_leads');

-- Check if Motor 2 column exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'conversations' AND column_name = 'etapa_funil';

-- Check if Motor 3 BANT columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'recuperai_leads' AND column_name IN ('source', 'bant_total_score', 'lead_tier');

-- Check if response_time_ms exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'conversations' AND column_name = 'response_time_ms';
```

Save results to `001-verify-prerequisites.sql` as comments documenting what was found.

Based on results, determine which Motor migrations (1, 2, 3) need to be applied. If any are missing, apply them from `../.claude/database/migrations/` in order:
1. `20260321_motor1_crm_tables.sql` (if `recuperai_contratos` missing)
2. `20260321_motor2_conversation_refinements.sql` (if `etapa_funil` missing)
3. `20260321_motor3_ahri_qualification.sql` (if BANT columns missing)

Apply each via `execute_sql` MCP tool. Wait for success before proceeding.

**FAILURE HANDLING:** If `execute_sql` returns an error on any Motor migration, STOP immediately and report the error. Do NOT proceed to view recreation — the views depend on Motor tables/columns existing.

**Step 2: Recreate `ceo_client_performance` view.**

Write `002-recreate-ceo-client-performance.sql`:

```sql
-- Phase 1: FIX-01 — Recreate ceo_client_performance view
-- Drop + recreate (not patch) per decision in CONTEXT.md
-- NOTE: COALESCEs below are for NULL-safe aggregation (e.g. no conversations = 0, not NULL).
-- These are NOT workarounds for missing tables — tables are created by Motor migrations in Step 1.

DROP VIEW IF EXISTS ceo_client_performance;

CREATE VIEW ceo_client_performance WITH (security_invoker = true) AS
SELECT
  cc.id AS config_cliente_id,
  cc.nome_negocio,
  COALESCE(rc.valor_mensalidade, 0) AS valor_mensalidade,
  rc.status AS contract_status,
  rc.data_inicio AS contract_start,
  COALESCE(COUNT(DISTINCT conv.id) FILTER (WHERE conv.created_at >= NOW() - INTERVAL '30 days'), 0) AS conversas_30d,
  COALESCE(COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'booked' AND a.created_at >= NOW() - INTERVAL '30 days'), 0) AS agendamentos_30d,
  COALESCE(AVG(conv.response_time_ms) FILTER (WHERE conv.created_at >= NOW() - INTERVAL '30 days'), 0)::integer AS avg_response_ms,
  COALESCE(
    ROUND(
      COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'booked' AND a.created_at >= NOW() - INTERVAL '30 days')::numeric
      / NULLIF(COUNT(DISTINCT conv.id) FILTER (WHERE conv.created_at >= NOW() - INTERVAL '30 days'), 0)
      * 100, 1
    ), 0
  ) AS taxa_conversao
FROM public.config_clientes cc
LEFT JOIN public.recuperai_contratos rc ON rc.config_cliente_id = cc.id
LEFT JOIN public.conversations conv ON conv.config_cliente_id = cc.id
LEFT JOIN public.appointments a ON a.config_cliente_id = cc.id AND a.conversation_id = conv.conversation_id
GROUP BY cc.id, cc.nome_negocio, rc.valor_mensalidade, rc.status, rc.data_inicio;

COMMENT ON VIEW ceo_client_performance IS 'Per-client KPI summary for CEO dashboard. Aggregates conversations, appointments, response time over 30 days.';
```

IMPORTANT: Before writing this file, first read the ACTUAL current view definition from `../.claude/database/migrations/20260321_kpi_views.sql` lines 34-55 to ensure the column names in the new view match exactly what `useDashboardData.js` expects. The column names MUST be preserved: `config_cliente_id`, `nome_negocio`, `valor_mensalidade`, `contract_status`, `contract_start`, `conversas_30d`, `agendamentos_30d`, `avg_response_ms`, `taxa_conversao`. If the original view has additional columns, include them.

If `response_time_ms` does NOT exist in production (Step 1 check), replace `AVG(conv.response_time_ms)` with `0` as a literal and add a SQL comment explaining why.

Write rollback file `002-rollback-ceo-client-performance.sql` containing `CREATE OR REPLACE VIEW` with the OLD definition (copied from `20260321_kpi_views.sql`).

Apply via `execute_sql` MCP tool.

**Step 3: Recreate `salon_funnel` view.**

Write `003-recreate-salon-funnel.sql`:

```sql
-- Phase 1: FIX-01 — Recreate salon_funnel view with 90-day filter
-- Decision: 90 days, not all-time (CONTEXT.md)

DROP VIEW IF EXISTS salon_funnel;

CREATE VIEW salon_funnel WITH (security_invoker = true) AS
SELECT
  config_cliente_id,
  COUNT(*) AS total_conversas,
  COUNT(*) FILTER (WHERE etapa_funil = 'lead_recebido') AS lead_recebido,
  COUNT(*) FILTER (WHERE etapa_funil = 'qualificacao') AS qualificacao,
  COUNT(*) FILTER (WHERE etapa_funil = 'agendamento') AS agendamento,
  COUNT(*) FILTER (WHERE etapa_funil = 'confirmacao') AS confirmacao,
  COUNT(*) FILTER (WHERE etapa_funil = 'comparecimento') AS comparecimento
FROM public.conversations
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY config_cliente_id;

COMMENT ON VIEW salon_funnel IS 'Funnel breakdown per client over last 90 days. Groups conversations by etapa_funil stage.';
```

IMPORTANT: Before writing, read the ACTUAL current view definition from `20260321_kpi_views.sql` lines 64-77 to ensure column names match. The column names MUST be preserved as the frontend expects them.

If `etapa_funil` does NOT exist in production (Motor 2 not applied), apply Motor 2 migration first.

Write rollback file `003-rollback-salon-funnel.sql`.

Apply via `execute_sql` MCP tool.

Verify both views work:
```sql
SELECT COUNT(*) FROM ceo_client_performance;
SELECT COUNT(*) FROM salon_funnel;
```
  </action>
  <verify>
Run via `execute_sql` MCP tool:
```sql
SELECT * FROM ceo_client_performance LIMIT 3;
SELECT * FROM salon_funnel LIMIT 3;
```
Both must return without error. Rows may be empty (seed comes next) but the query itself must not fail.
  </verify>
  <done>
`ceo_client_performance` and `salon_funnel` views execute without SQL errors. Both have `security_invoker = true`. Column names match exactly what `useDashboardData.js` expects.
  </done>
</task>

<task type="auto">
  <name>Task 2: Seed Soul Bela contract data (FIX-02)</name>
  <files>
    .planning/phases/01-fix-foundation/migrations/004-seed-soul-bela.sql
  </files>
  <action>
**Goal:** Insert Soul Bela data into `recuperai_contratos` so `ceo_overview.mrr` returns > 0.

First, read the existing seed file at `../.claude/database/migrations/20260321_seed_soul_bela.sql` to understand what data it inserts and its column dependencies.

Write `004-seed-soul-bela.sql` — an IDEMPOTENT seed that:

1. Finds Soul Bela's `config_clientes.id` (name is "Soul Bela Estetica" or similar — check `config_clientes` via `execute_sql` first: `SELECT id, nome_negocio FROM config_clientes LIMIT 10`).

2. Inserts into `recuperai_contratos` ONLY IF no active contract exists for that config_cliente_id:

```sql
DO $$
DECLARE
  v_config_id uuid;
BEGIN
  -- Find Soul Bela config_clientes ID
  SELECT id INTO v_config_id FROM config_clientes
  WHERE nome_negocio ILIKE '%soul bela%' LIMIT 1;

  IF v_config_id IS NULL THEN
    RAISE NOTICE 'Soul Bela not found in config_clientes — skipping seed';
    RETURN;
  END IF;

  -- Insert contract if not exists
  IF NOT EXISTS (
    SELECT 1 FROM recuperai_contratos
    WHERE config_cliente_id = v_config_id AND status = 'ativo'
  ) THEN
    INSERT INTO recuperai_contratos (config_cliente_id, valor_mensalidade, status, data_inicio)
    VALUES (v_config_id, 500.00, 'ativo', '2026-02-01');
  END IF;
END $$;
```

IMPORTANT: Do NOT insert into `recuperai_leads` with BANT columns in this migration — that depends on Motor 3. If the original seed file has lead inserts, only include them if Motor 3 columns were confirmed to exist in Task 1 Step 1.

If the original seed has additional data beyond the contract (e.g., pipeline entries), include those too, wrapped in idempotent checks.

Apply via `execute_sql` MCP tool.

Verify MRR:
```sql
SELECT mrr FROM ceo_overview;
```
Must return 500 (or whatever the correct value is based on active contracts).
  </action>
  <verify>
Run via `execute_sql` MCP tool:
```sql
SELECT mrr FROM ceo_overview;
```
Result must show `mrr > 0`. Expected value: 500 (one active contract at R$ 500/month).
  </verify>
  <done>
`ceo_overview.mrr` returns a value > 0. Soul Bela has an active contract in `recuperai_contratos`. Seed is idempotent (safe to re-run).
  </done>
</task>

<task type="auto">
  <name>Task 3: Create indexes on key joins/filters</name>
  <files>
    .planning/phases/01-fix-foundation/migrations/006-create-indexes.sql
  </files>
  <action>
**Per locked decision:** Add indexes on key joins/filters during view recreation.

Write `006-create-indexes.sql`:

```sql
-- Phase 1: Indexes for view performance
-- Locked decision: "Add indexes on key joins/filters during view recreation"

-- Indexes for ceo_client_performance view joins
CREATE INDEX IF NOT EXISTS idx_recuperai_contratos_config_cliente_id
  ON public.recuperai_contratos (config_cliente_id);

CREATE INDEX IF NOT EXISTS idx_conversations_config_cliente_id
  ON public.conversations (config_cliente_id);

CREATE INDEX IF NOT EXISTS idx_conversations_created_at
  ON public.conversations (created_at);

CREATE INDEX IF NOT EXISTS idx_appointments_config_cliente_id
  ON public.appointments (config_cliente_id);

-- Indexes for salon_funnel view filters
CREATE INDEX IF NOT EXISTS idx_conversations_etapa_funil
  ON public.conversations (etapa_funil);

-- Composite index for salon_funnel (config_cliente_id + created_at filter)
CREATE INDEX IF NOT EXISTS idx_conversations_config_cliente_created
  ON public.conversations (config_cliente_id, created_at);

-- Index for pipeline Kanban queries
CREATE INDEX IF NOT EXISTS idx_recuperai_pipeline_etapa
  ON public.recuperai_pipeline (etapa);
```

Apply via `execute_sql` MCP tool. If any index already exists, `IF NOT EXISTS` ensures idempotency.
  </action>
  <verify>
Run via `execute_sql`:
```sql
SELECT indexname FROM pg_indexes
WHERE tablename IN ('recuperai_contratos', 'conversations', 'appointments', 'recuperai_pipeline')
  AND indexname LIKE 'idx_%';
```
Confirm indexes were created.
  </verify>
  <done>Indexes created on config_cliente_id, created_at, etapa_funil, and etapa columns for view and Kanban query performance.</done>
</task>

</tasks>

<verification>
Run all three checks in a single `execute_sql` call:
```sql
-- FIX-01a
SELECT 'ceo_client_performance' AS view_name, COUNT(*) AS row_count FROM ceo_client_performance
UNION ALL
-- FIX-01b
SELECT 'salon_funnel', COUNT(*) FROM salon_funnel;

-- FIX-02
SELECT mrr FROM ceo_overview WHERE mrr > 0;
```
All three queries must execute without error. MRR must be > 0.
</verification>

<success_criteria>
1. `SELECT * FROM ceo_client_performance` executes without error
2. `SELECT * FROM salon_funnel` executes without error
3. `SELECT mrr FROM ceo_overview` returns value > 0
4. All migration files saved in `.planning/phases/01-fix-foundation/migrations/`
5. Rollback files exist for view recreations
6. Indexes exist on config_cliente_id, created_at, etapa_funil, etapa columns
</success_criteria>

<output>
After completion, create `.planning/phases/01-fix-foundation/01-01-SUMMARY.md`
</output>
