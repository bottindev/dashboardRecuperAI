---
phase: 01-fix-foundation
plan: 02
type: execute
wave: 2
depends_on: ["01-fix-foundation/01"]
files_modified:
  - src/components/crm/CrmKanban.jsx
autonomous: true

must_haves:
  truths:
    - "Kanban displays exactly 5 columns: Lead, Call Agendada, Proposta, Onboarding, Ativo"
    - "Drag-and-drop between all 5 columns works without error"
    - "Lost leads (cancelado) are hidden from the Kanban board"
    - "Stage IDs match the recuperai_pipeline CHECK constraint"
  artifacts:
    - path: "src/components/crm/CrmKanban.jsx"
      provides: "5-stage Kanban with correct pipeline stages"
      contains: "novo.*call_agendada.*proposta.*onboarding.*ativo"
  key_links:
    - from: "COLUMNS array in CrmKanban.jsx"
      to: "recuperai_pipeline.etapa CHECK constraint"
      via: "Stage IDs must be valid CHECK values"
      pattern: "novo|call_agendada|proposta|onboarding|ativo"
    - from: "fetchPipeline query"
      to: "recuperai_pipeline table"
      via: "supabase.from('recuperai_pipeline').select()"
      pattern: "recuperai_pipeline"
---

<objective>
Fix the Kanban board to show the 5 decided pipeline stages instead of the old 7 Ahri SDR stages. Filter out lost leads.

Purpose: FIX-03 — Kanban exibe todas as stages do pipeline (including proposta, onboarding, ativo). The Kanban is the primary CRM interface for Bernardo to track leads through the sales pipeline.

Output: Updated `CrmKanban.jsx` with correct COLUMNS array and filtered pipeline query.
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
@src/components/crm/CrmKanban.jsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update COLUMNS array to 5 pipeline stages</name>
  <files>src/components/crm/CrmKanban.jsx</files>
  <action>
Read `src/components/crm/CrmKanban.jsx` fully before editing.

**Replace the COLUMNS array** (lines ~25-33) from:

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

To:

```javascript
const COLUMNS = [
  { id: "novo", title: "Lead", color: "bg-slate-800" },
  { id: "call_agendada", title: "Call Agendada", color: "bg-blue-950" },
  { id: "proposta", title: "Proposta", color: "bg-amber-950" },
  { id: "onboarding", title: "Onboarding", color: "bg-emerald-950" },
  { id: "ativo", title: "Ativo", color: "bg-green-950" },
];
```

Key decisions from CONTEXT.md:
- Use `novo` as stage ID for "Lead" (already in CHECK constraint — avoids migration to rename)
- Title is "Lead" in the UI even though ID is `novo`
- 5 stages exactly: Lead -> Call Agendada -> Proposta -> Onboarding -> Ativo
- Lost leads (`cancelado`, `desqualificado_cold`) hidden from Kanban, not shown as columns

**Update the icon imports** if needed. Remove unused icons (`Coffee`, `UserX` etc.) that mapped to old stages. Add any needed icons for new stages. Keep it minimal — icons are optional on columns.
  </action>
  <verify>
Read the modified COLUMNS array and confirm it has exactly 5 entries with IDs: `novo`, `call_agendada`, `proposta`, `onboarding`, `ativo`.
  </verify>
  <done>COLUMNS array has exactly 5 stages matching the decided pipeline. Stage IDs are all valid values in the recuperai_pipeline CHECK constraint.</done>
</task>

<task type="auto">
  <name>Task 2: Filter pipeline query to active stages only</name>
  <files>src/components/crm/CrmKanban.jsx</files>
  <action>
In the same file, find the `fetchPipeline` function (around lines 161-197 per research).

**Add a filter** to the Supabase query to only fetch leads in the 5 active stages. This hides lost/cancelled leads from the Kanban board.

Find the query:
```javascript
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

Add `.in('etapa', ['novo', 'call_agendada', 'proposta', 'onboarding', 'ativo'])` before `.order(...)`:

```javascript
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
  .in('etapa', ['novo', 'call_agendada', 'proposta', 'onboarding', 'ativo'])
  .order('atualizado_em', { ascending: false });
```

**Also check the lead formatting logic** (around line where leads are mapped after fetch). Ensure the default fallback for etapa is `'novo'` (not an old stage):

```javascript
etapa: row.etapa || 'novo'
```

**Check for any hardcoded references** to old stage IDs (`em_qualificacao`, `qualificado_hot`, `nurturing_warm`, `fechado`, `desqualificado_cold`) elsewhere in the file. Remove or replace with appropriate new stage IDs.

**Follow Up badge/tag check (locked decision):** Search CrmKanban.jsx for any "Follow Up" UI element (badge, tag, column, or filter). Per locked decision, Follow Up is a badge/tag on lead cards, NOT a separate Kanban stage. If a Follow Up column exists, remove it. If no Follow Up UI exists yet, that is expected — it will be added in a later phase. Add a comment `// TODO Phase 2+: Follow Up badge/tag on lead cards (not a column)` near the COLUMNS array.

**Do NOT change** the drag-and-drop handler (`handleDragEnd`) — it already uses `targetColumnId` dynamically from the COLUMNS array. Just verify it works with the new column IDs.
  </action>
  <verify>
1. Read the modified `fetchPipeline` function and confirm `.in('etapa', ...)` filter is present.
2. Search the entire file for old stage IDs (`em_qualificacao`, `qualificado_hot`, `nurturing_warm`, `desqualificado_cold`) — none should remain.
3. Run `npm run build` to verify no syntax errors.
  </verify>
  <done>
Pipeline query filters to 5 active stages only. No references to old stage IDs remain in the file. `npm run build` passes without errors.
  </done>
</task>

</tasks>

<verification>
1. `npm run build` passes without errors
2. COLUMNS array has exactly 5 entries with correct IDs
3. No old stage IDs (`em_qualificacao`, `qualificado_hot`, `nurturing_warm`, `desqualificado_cold`) appear anywhere in `CrmKanban.jsx`
4. Pipeline query includes `.in('etapa', ['novo', 'call_agendada', 'proposta', 'onboarding', 'ativo'])`
</verification>

<success_criteria>
1. Kanban shows exactly 5 columns: Lead, Call Agendada, Proposta, Onboarding, Ativo
2. Lost leads are filtered out of the pipeline query
3. Stage IDs match the CHECK constraint values in recuperai_pipeline
4. Build succeeds with no errors
</success_criteria>

<output>
After completion, create `.planning/phases/01-fix-foundation/01-02-SUMMARY.md`
</output>
