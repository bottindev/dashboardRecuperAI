-- Migration: Migrate RLS policies from anon to authenticated
-- Date: 2026-03-28
-- Plan: 02-04 (CEO User + RLS Migration)
--
-- PURPOSE:
-- 1. Drop all anon_* policies on dashboard tables
-- 2. Create auth_* policies for authenticated role
-- 3. Enable RLS on tables that currently lack it
--
-- EXCLUDED (already have authenticated policies):
--   recuperai_contratos, recuperai_leads, recuperai_pipeline, recuperai_lead_interacoes
--
-- EXCLUDED (n8n uses anon key directly):
--   soulbela_cooldowns
--
-- ROLLBACK: Run 20260328000001_rls_auth_security_rollback.sql

BEGIN;

-- ============================================================
-- Step 1: Drop existing anon policies on dashboard tables
-- ============================================================

DROP POLICY IF EXISTS "anon_read_config" ON config_clientes;
DROP POLICY IF EXISTS "anon_read_conv" ON conversations;
DROP POLICY IF EXISTS "anon_read_errors" ON n8n_error_logs;
DROP POLICY IF EXISTS "anon_select_roi_metrics" ON roi_monthly_metrics;
DROP POLICY IF EXISTS "anon_read_appt" ON appointments;
DROP POLICY IF EXISTS "anon_read_fechadas" ON datas_fechadas;
DROP POLICY IF EXISTS "anon_read_horarios" ON horarios_funcionamento;
DROP POLICY IF EXISTS "anon_read_reminders" ON reminders_sent;
DROP POLICY IF EXISTS "anon_read_servicos" ON servicos;

-- ============================================================
-- Step 2: Create authenticated policies
-- ============================================================

-- config_clientes: CEO needs full access (read + write)
CREATE POLICY "auth_read_config" ON config_clientes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_all_config" ON config_clientes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- conversations: read-only for dashboard
CREATE POLICY "auth_read_conv" ON conversations
  FOR SELECT TO authenticated USING (true);

-- n8n_error_logs: read-only for dashboard
CREATE POLICY "auth_read_errors" ON n8n_error_logs
  FOR SELECT TO authenticated USING (true);

-- roi_monthly_metrics: read-only for dashboard
CREATE POLICY "auth_select_roi_metrics" ON roi_monthly_metrics
  FOR SELECT TO authenticated USING (true);

-- appointments: read-only for dashboard
CREATE POLICY "auth_read_appt" ON appointments
  FOR SELECT TO authenticated USING (true);

-- datas_fechadas: read-only for dashboard
CREATE POLICY "auth_read_fechadas" ON datas_fechadas
  FOR SELECT TO authenticated USING (true);

-- horarios_funcionamento: read-only for dashboard
CREATE POLICY "auth_read_horarios" ON horarios_funcionamento
  FOR SELECT TO authenticated USING (true);

-- reminders_sent: read-only for dashboard
CREATE POLICY "auth_read_reminders" ON reminders_sent
  FOR SELECT TO authenticated USING (true);

-- servicos: read-only for dashboard
CREATE POLICY "auth_read_servicos" ON servicos
  FOR SELECT TO authenticated USING (true);

-- ============================================================
-- Step 3: Enable RLS on tables that currently lack it
-- ============================================================

ALTER TABLE n8n_chat_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE recuperai_nurturing_conteudo ENABLE ROW LEVEL SECURITY;
ALTER TABLE recuperai_nurturing_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- NOTE: soulbela_cooldowns is NOT touched here.
-- The n8n "Ativar Takeover" node uses anon key directly to INSERT.
-- Tightening to authenticated would break Soul Bela workflow.
-- Fix separately: create activate_takeover() SECURITY DEFINER function first.
-- ============================================================

COMMIT;
