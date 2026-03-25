# Phase 1: Fix Foundation - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Corrigir bloqueios criticos que impedem qualquer feature de funcionar — views Supabase quebradas, dados ausentes, kanban incompleto. Nao adiciona features novas. Apenas garante que a base de dados e o pipeline de dados funcionam corretamente.

</domain>

<decisions>
## Implementation Decisions

### Fix Strategy
- Drop + recreate views from scratch (nao patch)
- Create missing tables rather than COALESCE workarounds
- Add indexes on key joins/filters during view recreation
- One migration file per view (separate, rollback-friendly)

### Migration Structure
- Separate .sql migration per view for independent debugging and rollback
- Claude decides: migration location (dashboard/supabase/migrations/ vs root database/)
- Claude decides: whether to keep a schema_v2.sql dump after migrations

### Kanban Pipeline — 5 Stages
- **Lead** → **Call Agendada** → **Proposta** → **Onboarding** → **Ativo**
- Lead: novo lead que chegou (qualquer source)
- Call Agendada: call comercial marcada (com data e hora no card)
- Proposta: proposta enviada apos a call
- Onboarding: call de onboarding para coleta de informacoes do cliente
- Ativo: bot implantado e rodando
- Follow Up: NAO e estagio separado — badge/tag no card com data do proximo contato (lead fica em "Call Agendada")
- Leads perdidos: Claude decides (coluna separada ou saem do kanban)

### Data Gaps
- Metricas sem dados mostram R$ 0,00 (zero e valor, nao esconder)
- Charts com menos de 2 meses: renderizar parcial (mesmo com 1 ponto)
- salon_funnel: ultimos 90 dias (nao all-time)
- Seed data para dev local + dados reais de producao para staging/deploy

### Validation
- SQL test script + dashboard visual check (ambos)
- Full local run (npm run dev + browser) apos todas as views corrigidas
- Claude decides: reusabilidade do test script (CI vs one-time)
- Claude decides: NULL handling por coluna (COALESCE vs allow NULL)
- Claude decides: rollback migrations (yes/no per view based on risk)
- Claude decides: checklist format e data dictionary approach

### Claude's Discretion
- View naming convention (keep current vs prefix with v_)
- Migration file location
- Schema dump versioning
- RLS timing (basic now vs wait for Phase 2)
- NULL handling strategy per column
- Rollback migration strategy
- Data dictionary format (SQL comments vs separate doc)
- PR checklist format
- Lost leads kanban handling

</decisions>

<specifics>
## Specific Ideas

- "DB is the most important" — Bernardo emphasized database foundation as the highest priority in this phase
- Onboarding stage involves a call to collect client information (not just internal setup)
- Follow up leads stay in "Call Agendada" with a badge showing next contact date — keeps pipeline clean at 5 stages
- Pipeline designed to reflect real RecuperAI sales flow: lead capture → commercial call → proposal → onboarding call → bot live

</specifics>

<deferred>
## Deferred Ideas

- Follow Up as separate kanban stage — decided against (badge approach instead), but could revisit if pipeline gets complex
- Lead qualification stage before Call Agendada — skipped for simplicity, could add in future CRM phase

</deferred>

---

*Phase: 01-fix-foundation*
*Context gathered: 2026-03-24*
