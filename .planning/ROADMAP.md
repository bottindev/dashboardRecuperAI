# Roadmap: RecuperAI Dashboard

**Created:** 2026-03-24
**Core Value:** Em 10 segundos ao abrir, Bernardo sabe: quanto dinheiro entrou, como cada cliente esta, e onde estao os leads.
**Depth:** Standard (7 phases, 3-5 plans each)

## Milestone: v3.0 Dashboard Rebuild Completo

### Phase 1: Fix Foundation

**Goal:** Corrigir bloqueios criticos que impedem qualquer feature de funcionar — views quebradas, dados ausentes, kanban incompleto.

**Requirements:** FIX-01, FIX-02, FIX-03

**Success Criteria:**
1. `SELECT * FROM ceo_client_performance` executa sem erro
2. `SELECT * FROM salon_funnel` executa sem erro
3. `SELECT mrr FROM ceo_overview` retorna valor > 0
4. Kanban exibe colunas proposta, onboarding e ativo

**Dependencies:** Nenhuma (primeiro)
**Risk:** Views podem ter mais colunas quebradas alem das identificadas

---

### Phase 2: Auth + Security

**Goal:** Proteger dados antes de polir UI — login CEO, RLS real, headers de seguranca, remover vulnerabilidades.

**Requirements:** AUTH-01, AUTH-02, SEC-01, SEC-02, SEC-03

**Success Criteria:**
1. CEO faz login com email + senha e ve o dashboard
2. Acesso sem auth redireciona para /login
3. Request com anon key retorna erro 401 (RLS bloqueando)
4. Response headers incluem X-Frame-Options e X-Content-Type-Options
5. `npm audit` nao mostra vulnerabilidade critica de xlsx

**Dependencies:** Phase 1 (dados precisam existir antes de proteger)
**Risk:** Migration RLS pode quebrar queries existentes que usam anon key

---

### Phase 3: Data Layer Rewrite

**Goal:** Substituir hooks monoliticos por hooks especializados com TanStack Query — cache, stale-while-revalidate, realtime cirurgico.

**Requirements:** FIX-04

**Success Criteria:**
1. TanStack Query DevTools mostra cache hits nas navegacoes
2. `useOverviewData()` retorna dados de 3 views combinadas
3. `useClientDetailData(id)` retorna metricas filtradas por cliente
4. `usePipelineData()` atualiza em realtime quando lead muda de stage
5. Zero `useEffect` fetch patterns restantes no codebase

**Dependencies:** Phase 2 (hooks precisam usar auth token)
**Risk:** Rewrite de data layer pode quebrar componentes que dependem da estrutura antiga

---

### Phase 4: CEO Command Center

**Goal:** Transformar HomePage na tela que Bernardo abre todo dia — KPIs com sparklines, trends reais, health badges, alertas.

**Requirements:** CEO-01, CEO-02, CEO-03, CEO-04, CEO-05, CEO-06, CEO-07

**Success Criteria:**
1. KPI cards mostram sparklines de 6 meses com delta vs mes anterior
2. Area chart renderiza receita + lucro com dados reais de `ceo_monthly_trend`
3. Client cards tem badge verde/amarelo/vermelho com tooltip explicando criterio
4. Topbar mostra contador de alertas de `n8n_error_logs`
5. Header mostra "Atualizado X minutos atras" com refresh automatico

**Dependencies:** Phase 3 (hooks precisam estar prontos)
**Risk:** View `ceo_monthly_trend` pode nao ter dados historicos suficientes

---

### Phase 5: Client Deep Dive

**Goal:** Reestruturar ClientDetailPage com tabs — visao geral, conversas reais, metricas completas, configuracao.

**Requirements:** DETAIL-01, DETAIL-02, DETAIL-03, DETAIL-04

**Success Criteria:**
1. 4 tabs navegaveis sem reload (Visao Geral, Conversas, Metricas, Configuracao)
2. KPIs mostram Receita Bot, ROI%, Taxa Conversao, Ticket Medio com dados reais
3. Charts renderizam dados de `recuperai_monthly_metrics` (nao mock)
4. Timeline mostra ultimas 20 conversas com status badge (booked/abandoned/delegated)
5. Tab "Visao Geral" e a primeira (nao "Configuracao")

**Dependencies:** Phase 4 (componentes compartilhados como sparklines)
**Risk:** Rewrite major do ClientDetailPage pode quebrar navegacao existente

---

### Phase 6: CRM Upgrade

**Goal:** Kanban com informacao visual rica — BANT scores, lead tiers, detail panel, navegacao fluida.

**Requirements:** CRM-02, CRM-03, CRM-04

**Success Criteria:**
1. Kanban cards mostram barra BANT segmentada e badge Hot/Warm/Cold
2. Click no card abre Sheet slide-over com info completa do lead
3. Lead Detail mostra timeline de interacoes de `recuperai_lead_interacoes`
4. Scroll horizontal tem shadow indicators nas bordas

**Dependencies:** Phase 3 (hooks de pipeline)
**Risk:** Sheet component pode conflitar com Kanban drag-and-drop

---

### Phase 7: UX Polish + Deploy

**Goal:** Polish corporativo — empty states, loading skeletons, tipografia consistente, build limpo, deploy.

**Requirements:** UX-02, UX-03, UX-04

**Success Criteria:**
1. Todo componente sem dados mostra EmptyState contextual (nao tela branca)
2. Todo componente carregando mostra skeleton (nao spinner generico)
3. Tipografia usa exatamente 4 niveis (hero, heading, body, caption)
4. `npm run build` passa sem erros
5. Deploy Vercel funciona e RLS bloqueia acesso sem auth

**Dependencies:** Phases 4, 5, 6 (precisa dos componentes finalizados pra polir)
**Risk:** Polish pass pode revelar inconsistencias nao previstas

---

## Phase Summary

| # | Phase | Requirements | Success Criteria | Dependencies |
|---|-------|-------------|-----------------|--------------|
| 1 | Fix Foundation | FIX-01, FIX-02, FIX-03 | 4 | None |
| 2 | Auth + Security | AUTH-01, AUTH-02, SEC-01, SEC-02, SEC-03 | 5 | Phase 1 |
| 3 | Data Layer Rewrite | FIX-04 | 5 | Phase 2 |
| 4 | CEO Command Center | CEO-01..07 | 5 | Phase 3 |
| 5 | Client Deep Dive | DETAIL-01..04 | 5 | Phase 4 |
| 6 | CRM Upgrade | CRM-02, CRM-03, CRM-04 | 4 | Phase 3 |
| 7 | UX Polish + Deploy | UX-02, UX-03, UX-04 | 5 | Phases 4,5,6 |

**Total:** 7 phases | 26 requirements | 33 success criteria
**Parallelizable:** Phases 4+6 (ambas dependem de Phase 3, sao independentes entre si)

---
*Roadmap created: 2026-03-24*
*Last updated: 2026-03-24 after GSD initialization*
