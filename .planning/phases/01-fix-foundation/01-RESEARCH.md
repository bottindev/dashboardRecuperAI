# Phase 1: Fix Foundation - Research

**Researched:** 2026-03-24
**Domain:** Supabase SQL views, PostgreSQL schema, React/Vite dashboard, dnd-kit Kanban
**Confidence:** HIGH (all findings from direct codebase inspection)

---

## Summary

This phase fixes three concrete breakages: two broken Supabase views, a missing seed row that prevents MRR from showing a value, and a Kanban whose column definitions don't match the intended pipeline stages. No new user-facing features are added — this is purely database and component alignment.

All findings come from reading the actual code. The root causes are precisely identified: the `ceo_client_performance` view references `conv.response_time_ms` which exists in the schema, but the view was written before the seed migration ran, so it returns 0 rows for the join to `recuperai_contratos`. The `salon_funnel` view references `etapa_funil` which was added by Motor 2 migration but may not be in production. The Kanban `COLUMNS` array has 7 stages (`novo`, `em_qualificacao`, `qualificado_hot`, `nurturing_warm`, `call_agendada`, `fechado`, `desqualificado`) instead of the 5 required stages (`lead`, `call_agendada`, `proposta`, `onboarding`, `ativo`).

**Primary recommendation:** Write three separate migration files (one per view) + one seed file, then align `COLUMNS` in `CrmKanban.jsx` to the 5 decided stages. Run `npm run dev` and visually confirm before marking phase done.

---

## Current State of Each Broken View

### View: `ceo_overview`

**File:** `../.claude/database/migrations/20260321_kpi_views.sql` lines 11-29

**What it references:**
- `public.recuperai_contratos` (table created by Motor 1 migration — exists if migration ran)
- `public.recuperai_pipeline` (table created by Motor 1 migration — exists if migration ran)
- `public.n8n_error_logs` (table created by `20260320_global_error_catcher.sql` — exists)

**Problem:** The view itself is syntactically valid. It will execute without error IF `recuperai_contratos` exists. The symptom — MRR returns 0 — is a data problem, not a view bug. `recuperai_contratos` exists (Motor 1 migration) but has no rows because the seed (`20260321_seed_soul_bela.sql`) was never applied.

**Diagnosis:** `FIX-02` is a seed data problem, not a view rewrite. The view `ceo_overview` is correct SQL. The seed inserts Soul Bela into `recuperai_contratos` with `valor_mensalidade = 500.00, status = 'ativo'`.

**Seed problem:** The seed references columns that only exist after Motor 3 migration:
```sql
-- In seed file — these columns don't exist in Motor 1's recuperai_leads:
source, nome_negocio, segmento, porte,
bant_budget_score, bant_authority_score, bant_need_score,
bant_timeline_score, bant_total_score, lead_tier
```
The seed will fail with "column does not exist" unless Motor 3 ran first. **Migration order matters.**

---

### View: `ceo_client_performance`

**File:** `../.claude/database/migrations/20260321_kpi_views.sql` lines 34-55

**What it references:**
```sql
FROM public.config_clientes cc
LEFT JOIN public.recuperai_contratos rc ON rc.config_cliente_id = cc.id
LEFT JOIN public.conversations conv ON conv.config_cliente_id = cc.id
LEFT JOIN public.appointments a ON a.config_cliente_id = cc.id AND a.conversation_id = conv.conversation_id
```

**Column that likely causes the error:**
```sql
COALESCE(AVG(conv.response_time_ms) FILTER (...), 0)::integer AS avg_response_ms
```

`response_time_ms` was added to `conversations` by migration `20260320_etapa2_new_tracking.sql`. If that migration ran, column exists. The view should be fine.

**Real problem:** The `GROUP BY` includes `rc.valor_mensalidade, rc.status, rc.data_inicio` — if a `config_clientes` row has NO corresponding `recuperai_contratos` row (LEFT JOIN produces NULLs), the group by still works because NULLs group together. So the view itself is valid SQL.

**Actual blocker:** The view returns an empty dataset because `recuperai_contratos` has zero rows. With zero rows, `ceo_client_performance` returns one row per `config_clientes` entry but with all contract fields as NULL and all aggregates as 0. The dashboard code `throw`s on error — not on empty data. So the view probably executes but the data is all zeros/nulls.

**Verification needed:** The REQUIREMENTS.md says `FIX-01` is "remove colunas inexistentes". The actual SQL doesn't reference non-existent columns (assuming all migrations ran). There may be a mismatch between what's in production vs what's in the migration files. Planner must check if `response_time_ms` exists in production by running `SELECT response_time_ms FROM conversations LIMIT 1` as a validation step.

---

### View: `salon_funnel`

**File:** `../.claude/database/migrations/20260321_kpi_views.sql` lines 64-77

**What it references:**
```sql
FROM public.conversations
GROUP BY config_cliente_id
```

**Column that likely causes the error:**
```sql
COUNT(*) FILTER (WHERE etapa_funil = 'lead_recebido') AS lead_recebido
```

`etapa_funil` was added to `conversations` by Motor 2 migration (`20260321_motor2_conversation_refinements.sql`). If Motor 2 hasn't run in production, `etapa_funil` column doesn't exist and this view will fail with `ERROR: column "etapa_funil" does not exist`.

**Fix required:** Recreate the view from scratch (per decision). The new view must also apply the 90-day filter decided in CONTEXT.md:
```sql
WHERE created_at >= NOW() - INTERVAL '90 days'
```

---

## What Tables/Columns Exist vs What Views Reference

### Table inventory (from migration files — what SHOULD exist after all migrations run)

| Table | Migration File | Key Columns |
|-------|---------------|-------------|
| `config_clientes` | schema_v1.sql | id, nome_negocio, status, investimento_mensal |
| `conversations` | schema_v1.sql + etapa2 + motor2 | id, config_cliente_id, outcome, response_time_ms*, etapa_funil* |
| `appointments` | schema_v1.sql | id, config_cliente_id, servico_preco_snapshot, status, conversation_id |
| `roi_monthly_metrics` | schema_v1.sql | id, config_cliente_id, month, receita_recuperada... |
| `n8n_error_logs` | 20260320_global_error_catcher.sql | id, status |
| `recuperai_leads` | 20260321_motor1_crm_tables.sql + motor3 | id, telefone, nome, source*, bant_* columns* |
| `recuperai_pipeline` | 20260321_motor1_crm_tables.sql + motor3 | id, lead_id, etapa (expanded constraint) |
| `recuperai_contratos` | 20260321_motor1_crm_tables.sql | id, config_cliente_id, valor_mensalidade, status |

*Columns added by later migrations — may not exist in production if migrations weren't applied.

### Column dependency matrix for Phase 1 views

| View | Column | Source Migration | Risk if Missing |
|------|--------|-----------------|-----------------|
| `ceo_client_performance` | `conv.response_time_ms` | 20260320_etapa2 | View fails |
| `ceo_client_performance` | `rc.*` all columns | 20260321_motor1 | No data (empty LEFT JOIN) |
| `salon_funnel` | `etapa_funil` | 20260321_motor2 | View fails |
| `ceo_overview` | `recuperai_contratos` table | 20260321_motor1 | View fails |
| `ceo_overview` | `recuperai_pipeline` table | 20260321_motor1 | View fails |

---

## Current Kanban State

**File:** `src/components/crm/CrmKanban.jsx` lines 25-33

### Current COLUMNS (7 stages — WRONG)

```javascript
const COLUMNS = [
  { id: "novo", title: "Novos Leads", color: "bg-slate-800" },
  { id: "em_qualificacao", title: "Qualificando", color: "bg-blue-950" },
  { id: "qualificado_hot", title: "Hot (Call)", color: "bg-orange-950" },
  { id: "nurturing_warm", title: "Warm (Nurturing)", color: "bg-yellow-950" },
  { id: "call_agendada", title: "Call Agendada", color: "bg-emerald-950" },
  { id: "fechado", title: "Fechado (Ganho)", color: "bg-green-950" },
  { id: "desqualificado_cold", title: "Desqualificado", color: "bg-red-950" },
];
```

These IDs map to the OLD pipeline concept (Ahri SDR stages). Several IDs (`em_qualificacao`, `qualificado_hot`, `nurturing_warm`, `desqualificado_cold`) exist in the `recuperai_pipeline` CHECK constraint but don't match the decided pipeline.

### Required COLUMNS (5 stages — DECIDED)

| Stage | Stage ID | Description |
|-------|----------|-------------|
| Lead | `lead` | New lead arrived from any source |
| Call Agendada | `call_agendada` | Commercial call scheduled (with date/time on card) |
| Proposta | `proposta` | Proposal sent after the call |
| Onboarding | `onboarding` | Onboarding call to collect client info |
| Ativo | `ativo` | Bot deployed and running |

**Lost leads decision (Claude's Discretion):** See recommendation section below.

### Database constraint mismatch

The `recuperai_pipeline` table has this CHECK constraint (from Motor 3 migration):
```sql
CHECK (etapa IN (
  'novo', 'em_qualificacao', 'nurturing_warm', 'desqualificado_cold', 'qualificado_hot',
  'call_agendada', 'proposta', 'fechado', 'onboarding', 'ativo', 'cancelado'
))
```

The new 5-stage IDs `lead`, `call_agendada`, `proposta`, `onboarding`, `ativo` — the first one (`lead`) is NOT in the constraint. The constraint currently has `novo` not `lead`. Either:
1. Use `novo` as the ID for the first stage (instead of `lead`), OR
2. Add a migration to drop and recreate the CHECK constraint to include `lead`

**Recommendation:** Use `novo` as the stage ID for the first column (already in constraint, already used by existing data). Title it "Lead" in the UI. Avoids a constraint migration for a purely cosmetic rename.

---

## Dashboard Codebase Structure

**Framework:** React 19 + Vite 6 (not Next.js)
**Styling:** Tailwind CSS v4 (via `@tailwindcss/vite` plugin — Vite-first, no `tailwind.config.js`)
**Router:** React Router v7
**Database client:** `@supabase/supabase-js` v2.99
**Charts:** Recharts v2.15
**Drag-and-drop:** `@dnd-kit/core` v6 + `@dnd-kit/sortable` v10
**UI components:** shadcn (base-ui variant) + lucide-react icons
**No TypeScript** — pure JSX

### Folder structure

```
recuperai-dashboard/
├── src/
│   ├── App.jsx                    # Router (6 routes)
│   ├── components/
│   │   ├── crm/
│   │   │   └── CrmKanban.jsx      # THE broken kanban (COLUMNS array)
│   │   ├── dashboard/             # Client detail charts (KpiCard, RevenueAreaChart...)
│   │   ├── home/                  # CEO overview (CompanyKpiGrid, CompanyTrendChart...)
│   │   ├── shared/                # ErrorState, LoadingSkeleton, QuickActions...
│   │   └── ui/                    # shadcn primitives (button, badge...)
│   ├── hooks/
│   │   ├── useDashboardData.js    # Queries ceo_overview + ceo_client_performance
│   │   ├── useCompanyData.js      # Wraps useDashboardData, exposes overview
│   │   ├── useClients.js          # Queries config_clientes directly
│   │   └── useAutoRefresh.js      # 5-min interval reload
│   ├── pages/
│   │   ├── HomePage.jsx           # Uses useCompanyData → ceo_overview + ceo_client_performance
│   │   ├── CrmPage.jsx            # Renders CrmKanban
│   │   └── ClientDetailPage.jsx   # Uses useDashboardData (expects clients + metrics — mismatch)
│   ├── services/
│   │   └── supabaseService.js     # callRpc, triggerReport helpers
│   ├── lib/
│   │   ├── supabaseClient.js      # Supabase client singleton
│   │   └── utils.js               # cn() utility
│   └── utils/
│       ├── metricsComputation.js  # filterByPeriod, computeTotals, computeChartData
│       └── formatters.js          # fmt, fmtInt, fmtMonth
├── .planning/                     # GSD planning files
│   └── phases/01-fix-foundation/
├── .env.local                     # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
└── package.json
```

### Secondary bug found: `ClientDetailPage` hook mismatch

`ClientDetailPage.jsx` line 26 calls:
```javascript
const { clients, metrics, loading, error, reload } = useDashboardData();
```

But `useDashboardData` returns `{ overview, clientPerformances, loading, error, reload }` — it does NOT expose `clients` or `metrics`. This page will have undefined variables. **This is a pre-existing bug outside Phase 1 scope** — note for Phase 5 (DETAIL-01).

---

## Migration Location Decision (Claude's Discretion)

**Recommendation:** Place migrations in `recuperai-dashboard/.planning/phases/01-fix-foundation/migrations/` for planning context, with a clear note that they must be applied via Supabase Dashboard SQL editor or CLI.

**Rationale:** The dashboard repo has no `supabase/` directory. The canonical migration location is `../.claude/database/migrations/` (relative to RecuperAI root). But during Phase 1, co-locating migrations next to the plan improves developer experience and visibility. After applying, archive them to the canonical location.

**Alternative:** Write directly to `../.claude/database/migrations/` with Phase 1 date prefix. This keeps all migrations in one place but requires navigating to the parent repo.

**Decision:** Use `recuperai-dashboard/.planning/phases/01-fix-foundation/migrations/` during execution. Document in PLAN that they must be copied to `../.claude/database/migrations/` after application.

---

## Schema Dump Versioning (Claude's Discretion)

**Recommendation:** YES, create `schema_v2.sql` after Phase 1 migrations are applied.

**Rationale:** `schema_v1.sql` predates the Motor 1/2/3 migrations and the KPI views. A `schema_v2.sql` that is the authoritative state after Phase 1 provides a clean rollback point and serves as ground truth for future phases.

**Format:** Single file at `../.claude/database/schema_v2.sql` generated by `pg_dump --schema-only` or reconstructed manually from migrations applied in order.

---

## NULL Handling Strategy (Claude's Discretion)

**Recommendation per column type:**

| Column type | Strategy | Rationale |
|-------------|----------|-----------|
| Numeric KPIs (mrr, receita_gerada_bot, etc.) | `COALESCE(x, 0)` | Decision: "zero is a value, not hidden" |
| Text/name fields (nome_negocio) | Allow NULL, handle in JS | Names are never aggregated |
| Foreign key joins (LEFT JOIN results) | COALESCE at aggregation level only | NULL FK means "no contract yet" — valid state |
| Rate/percentage fields | COALESCE(x, 0) | Zero is a valid rate |
| Count fields | COALESCE(COUNT(*), 0) — COUNT never NULLs anyway | Standard |

---

## Rollback Migration Strategy (Claude's Discretion)

**Recommendation:** Create rollback migrations for the two view recreations. Skip rollback for the seed data.

| Migration | Rollback? | Rationale |
|-----------|-----------|-----------|
| `ceo_client_performance` DROP+CREATE | YES — rollback is `CREATE OR REPLACE` with old definition | Views are stateless — rollback is trivial |
| `salon_funnel` DROP+CREATE | YES — rollback is `CREATE OR REPLACE` with old definition | Same |
| `ceo_overview` (no change needed) | N/A | Not recreating |
| Seed Soul Bela | NO rollback | Seed is idempotent (check before insert); rollback would be DELETE which is destructive |

**Rollback format:** Each rollback is a companion file `XX-rollback-viewname.sql` next to the forward migration.

---

## Lost Leads Kanban Decision (Claude's Discretion)

**Recommendation:** Hidden from Kanban (not a separate column).

**Rationale:**
- 5-stage pipeline decision is locked in CONTEXT.md
- A "Perdido" column adds visual noise to a clean 5-column board
- Lost leads are still in the DB (etapa `cancelado`) — queryable for future reporting
- Consistent with the "Follow Up = badge, not column" decision pattern

**Implementation:** Filter the Kanban query to only show active stages:
```javascript
// In fetchPipeline(), add:
.not('etapa', 'in', '("cancelado")')
// or list the 5 active stages explicitly:
.in('etapa', ['novo', 'call_agendada', 'proposta', 'onboarding', 'ativo'])
```

---

## View Naming Convention (Claude's Discretion)

**Recommendation:** Keep current names (no `v_` prefix).

**Rationale:**
- Names are already referenced in `useDashboardData.js` as string literals
- Renaming requires updating JS code — extra scope for Phase 1 which should touch as little as possible
- The `v_` convention is a preference, not a correctness issue
- Current names are clear (`ceo_overview`, `salon_funnel`, `ceo_client_performance`)

---

## RLS Timing (Claude's Discretion)

**Recommendation:** Defer RLS hardening to Phase 2 (SEC-01).

**Rationale:**
- Phase 1 is about making things work, not security hardening
- Current RLS uses `TO authenticated USING (true)` on Motor 1 tables — adequate for now
- `ceo_overview` view has `WITH (security_invoker = true)` which is correct
- The `salon_funnel` and `ceo_client_performance` views in `20260321_kpi_views.sql` do NOT have `security_invoker` — add this when recreating but don't add anon policies

---

## Data Dictionary Format (Claude's Discretion)

**Recommendation:** SQL comments inline (`COMMENT ON VIEW` / `COMMENT ON COLUMN`).

**Rationale:**
- Already established as the pattern in the codebase (existing views have `COMMENT ON VIEW`)
- No extra file to maintain
- Visible in Supabase Studio table inspector

---

## Validation Test Script (Claude's Discretion)

**Recommendation:** One-time SQL test script, NOT CI.

**Rationale:**
- There is no CI pipeline in this project (no `.github/workflows/`)
- A one-time `validate-phase1.sql` script that runs the 4 success criteria queries is sufficient
- Can be run manually in Supabase SQL editor or `psql`

**Script content (4 assertions matching success criteria):**
```sql
-- FIX-01a: ceo_client_performance runs without error
SELECT COUNT(*) FROM ceo_client_performance;

-- FIX-01b: salon_funnel runs without error
SELECT COUNT(*) FROM salon_funnel;

-- FIX-02: mrr > 0
SELECT mrr FROM ceo_overview WHERE mrr > 0;

-- FIX-03: pipeline has proposta, onboarding, ativo rows (after Kanban fix + data)
SELECT DISTINCT etapa FROM recuperai_pipeline WHERE etapa IN ('proposta','onboarding','ativo');
```

---

## Common Pitfalls

### Pitfall 1: Migration order dependency

**What goes wrong:** Running `seed_soul_bela.sql` before `motor3_ahri_qualification.sql` causes "column does not exist" for `bant_*` fields.

**Prevention:** Apply migrations in this exact order:
1. `20260321_motor1_crm_tables.sql` (creates tables)
2. `20260321_motor2_conversation_refinements.sql` (adds `etapa_funil`)
3. `20260321_motor3_ahri_qualification.sql` (adds BANT columns + expands pipeline constraint)
4. `20260321_kpi_views.sql` (creates views — needs all tables)
5. `20260321_seed_soul_bela.sql` (seeds data — needs BANT columns)

**Warning signs:** Error `column "source" of relation "recuperai_leads" does not exist` means Motor 3 hasn't run yet.

### Pitfall 2: CHECK constraint blocks new etapa value

**What goes wrong:** Moving a lead to a new stage (e.g., `proposta`) via the Kanban UPDATE fails if `proposta` is not in the CHECK constraint.

**Check:** Current constraint (Motor 3) includes `proposta`, `onboarding`, `ativo` — they ARE in the constraint. The `lead` stage ID is NOT (constraint has `novo`). Use `novo` as the stage ID, not `lead`.

### Pitfall 3: Seed is not idempotent

**What goes wrong:** Running `seed_soul_bela.sql` twice inserts duplicate rows in `recuperai_contratos` (no UNIQUE constraint on `config_cliente_id`). The `recuperai_leads` INSERT has `UNIQUE INDEX on telefone` so it will fail on second run.

**Prevention:** Wrap seed in `IF NOT EXISTS` check:
```sql
-- Before inserting contract, check if one already exists:
IF NOT EXISTS (
  SELECT 1 FROM recuperai_contratos WHERE config_cliente_id = v_config_id AND status = 'ativo'
) THEN
  -- insert
END IF;
```

### Pitfall 4: `salon_funnel` 90-day filter needs index

**What goes wrong:** Adding `WHERE created_at >= NOW() - INTERVAL '90 days'` without an index causes full table scan on `conversations` — slow as conversations table grows.

**Check:** `20260320_etapa4_performance_indexes.sql` may already add `created_at` index on conversations. Verify before worrying.

### Pitfall 5: Kanban drag-and-drop uses `etapa` from joined `recuperai_leads`

**What goes wrong:** In `CrmKanban.jsx`, after `fetchPipeline()`, leads are formatted as `{ ...row.recuperai_leads, etapa: row.etapa }`. The drag end handler reads `activeLeadData.etapa` to determine current column. If `etapa` is null/undefined, the lead won't move correctly.

**Prevention:** Ensure the default fallback `etapa: row.etapa || 'novo'` covers the case where `recuperai_pipeline` has a null `etapa`.

---

## Standard Stack (for view migrations)

No new libraries needed. Phase 1 uses existing stack:

| Tool | Version | Purpose |
|------|---------|---------|
| Supabase SQL editor / psql | — | Apply migration files |
| `@supabase/supabase-js` | 2.99.3 | Already installed, unchanged |
| React 19 + Vite 6 | — | Run `npm run dev` for visual check |
| `@dnd-kit/core` + `@dnd-kit/sortable` | 6.3.1 / 10.0.0 | Already installed, Kanban unchanged |

**No new npm installs for Phase 1.**

---

## Code Examples (Verified from Codebase)

### How Kanban fetches pipeline data (current pattern — keep this pattern)

```javascript
// Source: src/components/crm/CrmKanban.jsx lines 161-197
const { data, error } = await supabase
  .from('recuperai_pipeline')
  .select(`
    etapa,
    lead_id,
    recuperai_leads (
      id, nome, telefone, nome_negocio,
      bant_total_score, lead_tier, call_agendada_at
    )
  `)
  .order('atualizado_em', { ascending: false });
```

### How Kanban update works (current pattern — keep exactly)

```javascript
// Source: src/components/crm/CrmKanban.jsx lines 237-243
const { error } = await supabase
  .from('recuperai_pipeline')
  .update({ etapa: targetColumnId, atualizado_em: new Date().toISOString() })
  .eq('lead_id', activeLeadData.id);
```

### How dashboard queries the broken view (current pattern — view fix must preserve this interface)

```javascript
// Source: src/hooks/useDashboardData.js lines 16-18
const [overviewResult, clientResult] = await Promise.all([
  supabase.from("ceo_overview").select("*").limit(1).single(),
  supabase.from("ceo_client_performance").select("*").order("nome_negocio"),
]);
```

The JS code doesn't change — only the SQL views change. The column names in the views must remain stable.

---

## Open Questions

1. **Are Motor 1/2/3 migrations applied in production?**
   - What we know: Migration files exist in `../.claude/database/migrations/`
   - What's unclear: Whether they were applied to the Supabase project `ahxbwzfdtjhfoytfshif`
   - Recommendation: The first task in PLAN.md should be a verification query — `SELECT column_name FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'etapa_funil'` — to confirm state before writing migration files.

2. **Does `ceo_client_performance` actually fail or just return zeros?**
   - What we know: The view SQL is syntactically valid, referencing columns that should exist
   - What's unclear: Whether the error is "column doesn't exist" (migration not applied) or "view returns no data" (seed not applied)
   - Recommendation: Run `SELECT * FROM ceo_client_performance LIMIT 1` in Supabase SQL editor first. If it returns an error, fix the view. If it returns empty rows, it's a seed problem only.

3. **What is the exact error message for `salon_funnel`?**
   - What we know: The view references `etapa_funil` which may not exist in production
   - What's unclear: Whether it fails with "column does not exist" or silently returns 0s
   - Recommendation: Treat it as "column doesn't exist" and proceed with Motor 2 + view recreation. Safest approach.

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)
- `src/components/crm/CrmKanban.jsx` — full Kanban implementation, COLUMNS array, fetch/update logic
- `src/hooks/useDashboardData.js` — exact view names queried, error handling
- `../.claude/database/migrations/20260321_kpi_views.sql` — full view definitions
- `../.claude/database/migrations/20260321_motor1_crm_tables.sql` — table schemas
- `../.claude/database/migrations/20260321_motor2_conversation_refinements.sql` — etapa_funil column
- `../.claude/database/migrations/20260321_motor3_ahri_qualification.sql` — BANT columns, pipeline constraint
- `../.claude/database/migrations/20260321_seed_soul_bela.sql` — seed data + column dependency issue
- `.planning/phases/01-fix-foundation/01-CONTEXT.md` — locked decisions
- `.planning/REQUIREMENTS.md` — FIX-01, FIX-02, FIX-03 definitions

### Secondary (MEDIUM confidence — inferred from code)
- Migration order dependency inferred from column references across files
- CHECK constraint values cross-referenced between Motor 1 and Motor 3 migrations

---

## Metadata

**Confidence breakdown:**
- Current view SQL: HIGH — read directly from files
- Table/column existence: MEDIUM — what files say should be in production; not verified against live DB
- Kanban fix: HIGH — COLUMNS array is explicit, required stages are locked decisions
- Migration order: HIGH — deterministic from column dependency analysis
- NULL handling / rollback strategy: HIGH — straightforward PostgreSQL patterns

**Research date:** 2026-03-24
**Valid until:** Indefinite (codebase is the source of truth; re-read files if code changes)
