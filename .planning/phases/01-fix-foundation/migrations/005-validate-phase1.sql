-- Phase 1 Validation Script
-- All 4 success criteria from ROADMAP.md
-- Execute each SELECT separately against Supabase project: ahxbwzfdtjhfoytfshif

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

-- SUCCESS CRITERIA 4: Pipeline has CHECK constraint for stages
-- NOTE: SC4 also requires visual Kanban verification (human-verify checkpoint in Task 2).
-- This SQL only confirms the DB constraint exists — it does NOT verify frontend rendering.
SELECT 'SC4: pipeline stages (DB constraint only — visual check in Task 2)' AS test,
       string_agg(DISTINCT conname, ', ') AS constraint_name,
       CASE WHEN COUNT(*) > 0 THEN 'PASS (DB) — visual check pending in Task 2'
            ELSE 'FAIL — no CHECK constraint found' END AS result
FROM pg_constraint
WHERE conrelid = 'recuperai_pipeline'::regclass
  AND contype = 'c';

-- DATA DICTIONARY: Verify views have SQL comments
SELECT obj_description('ceo_client_performance'::regclass) AS ceo_client_perf_comment,
       obj_description('salon_funnel'::regclass) AS salon_funnel_comment;
