---
phase: 01-fix-foundation
plan: 03
type: execute
wave: 2
depends_on: ["01-fix-foundation/01", "01-fix-foundation/02"]
files_modified:
  - .planning/phases/01-fix-foundation/migrations/005-validate-phase1.sql
autonomous: false

must_haves:
  truths:
    - "All 4 success criteria from Phase 1 pass"
    - "Dashboard loads without console errors"
    - "Kanban renders 5 columns visually"
    - "MRR card shows a non-zero value"
  artifacts:
    - path: ".planning/phases/01-fix-foundation/migrations/005-validate-phase1.sql"
      provides: "Validation script with all 4 success criteria queries"
  key_links:
    - from: "ceo_overview view"
      to: "HomePage CompanyKpiGrid"
      via: "useCompanyData -> useDashboardData -> supabase.from('ceo_overview')"
      pattern: "ceo_overview"
---

<objective>
Validate all Phase 1 fixes end-to-end: SQL views, seed data, and Kanban visual check.

Purpose: Confirm all 4 success criteria pass before marking Phase 1 complete. This is the quality gate — no Phase 2 work starts until this passes.

Output: Validation script + visual confirmation that the dashboard works.
</objective>

<execution_context>
@C:\Users\berna\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\berna\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-fix-foundation/01-01-SUMMARY.md
@.planning/phases/01-fix-foundation/01-02-SUMMARY.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Run SQL validation script</name>
  <files>
    .planning/phases/01-fix-foundation/migrations/005-validate-phase1.sql
  </files>
  <action>
Write `005-validate-phase1.sql` and execute it via `execute_sql` MCP tool:

```sql
-- Phase 1 Validation Script
-- All 4 success criteria from ROADMAP.md

-- SUCCESS CRITERIA 1: ceo_client_performance executes without error
SELECT 'SC1: ceo_client_performance' AS test,
       COUNT(*) AS rows,
       CASE WHEN COUNT(*) > 0 THEN 'PASS'
            ELSE 'WARN — view executes but has 0 rows' END AS result
FROM ceo_client_performance;

-- SUCCESS CRITERIA 2: salon_funnel executes without error
SELECT 'SC2: salon_funnel' AS test,
       COUNT(*) AS rows,
       CASE WHEN COUNT(*) > 0 THEN 'PASS'
            ELSE 'WARN — view executes but has 0 rows' END AS result
FROM salon_funnel;

-- SUCCESS CRITERIA 3: mrr > 0
SELECT 'SC3: mrr > 0' AS test,
       mrr AS value,
       CASE WHEN mrr > 0 THEN 'PASS' ELSE 'FAIL — mrr is 0 or null' END AS result
FROM ceo_overview;

-- SUCCESS CRITERIA 4: Pipeline has proposta, onboarding, ativo in CHECK constraint
-- NOTE: SC4 also requires visual Kanban verification (human-verify checkpoint in Task 2).
-- This SQL only confirms the DB constraint exists — it does NOT verify frontend rendering.
SELECT 'SC4: pipeline stages (DB constraint only — visual check in Task 2)' AS test,
       string_agg(DISTINCT conname, ', ') AS constraint_name,
       CASE WHEN COUNT(*) > 0 THEN 'PASS (DB) — visual check pending in Task 2'
            ELSE 'FAIL — no CHECK constraint found' END AS result
FROM pg_constraint
WHERE conrelid = 'recuperai_pipeline'::regclass
  AND contype = 'c';
```

If any test returns FAIL, diagnose and fix before proceeding. Document any fixes in the summary.

Also run a quick data dictionary verification — confirm views have SQL comments:
```sql
SELECT obj_description('ceo_client_performance'::regclass) AS ceo_client_perf_comment,
       obj_description('salon_funnel'::regclass) AS salon_funnel_comment;
```
  </action>
  <verify>
All 4 success criteria queries return PASS. No SQL errors.
  </verify>
  <done>SC1-SC3 pass in SQL validation script. SC4 verified in human-verify checkpoint (Task 2).</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
Phase 1 database fixes: two recreated views (ceo_client_performance, salon_funnel), Soul Bela seed data, and 5-stage Kanban pipeline.
  </what-built>
  <how-to-verify>
1. Run `npm run dev` in the `recuperai-dashboard` directory
2. Open http://localhost:5173 in browser
3. **Check HomePage:** MRR card should show R$ 500,00 (not R$ 0,00). Other KPIs may show zeros — that's expected (zero is a value, per decision).
4. **Check CRM page:** Kanban should show exactly 5 columns: "Lead", "Call Agendada", "Proposta", "Onboarding", "Ativo". No old columns (Qualificando, Hot, Warm, Desqualificado) should appear.
5. **Check browser console:** No red errors related to view queries. Network tab should show successful Supabase API calls to ceo_overview, ceo_client_performance.
6. If all checks pass, confirm to continue to Phase 2.
  </how-to-verify>
</task>

</tasks>

<verification>
1. SQL validation script passes all 4 success criteria
2. Visual dashboard check confirms MRR > 0 and 5-column Kanban
3. No console errors on HomePage or CRM page
</verification>

<success_criteria>
1. `SELECT * FROM ceo_client_performance` executes without error
2. `SELECT * FROM salon_funnel` executes without error
3. `SELECT mrr FROM ceo_overview` returns value > 0
4. Kanban exibe colunas proposta, onboarding e ativo (visual confirmation)
</success_criteria>

<output>
After completion, create `.planning/phases/01-fix-foundation/01-03-SUMMARY.md`
</output>
