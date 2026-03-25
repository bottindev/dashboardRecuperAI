# Requirements: RecuperAI Dashboard

**Defined:** 2026-03-24
**Core Value:** Em 10 segundos ao abrir, Bernardo sabe: quanto dinheiro entrou, como cada cliente esta, e onde estao os leads.

## v1 Requirements

### Foundation

- [ ] **FIX-01**: Views Supabase `ceo_client_performance` e `salon_funnel` executam sem erro (remover colunas inexistentes)
- [ ] **FIX-02**: Soul Bela inserida em `recuperai_contratos` com status ativo — MRR retorna valor > 0
- [ ] **FIX-03**: Kanban exibe todas as stages do pipeline (incluindo proposta, onboarding, ativo)
- [ ] **FIX-04**: TanStack Query instalado com hooks separados por dominio (overview, client detail, pipeline)

### Auth

- [ ] **AUTH-01**: CEO pode fazer login com email e senha via Supabase Auth
- [ ] **AUTH-02**: Rotas protegidas redirecionam para /login se nao autenticado

### Security

- [ ] **SEC-01**: RLS migrada de `TO anon USING (true)` para `TO authenticated USING (true)` em todas as tabelas
- [ ] **SEC-02**: Security headers configurados no Vercel (X-Frame-Options, X-Content-Type-Options)
- [ ] **SEC-03**: Biblioteca `xlsx` substituida por `exceljs` (vulnerabilidade sem fix)

### CEO Command Center

- [ ] **CEO-01**: KPI cards com sparklines dos ultimos 6 meses (dados de `ceo_monthly_trend`)
- [ ] **CEO-02**: Area chart de receita + lucro ultimos 6 meses com dados reais
- [ ] **CEO-03**: Client cards com health badge (verde/amarelo/vermelho) e tooltip explicativo
- [ ] **CEO-04**: Contract status badge por cliente (ativo/trial/inadimplente)
- [ ] **CEO-05**: Alert counter no Topbar alimentado por `n8n_error_logs`
- [ ] **CEO-06**: Timestamp relativo "Atualizado X minutos atras" no header
- [ ] **CEO-07**: Recency indicator "Ultima conversa: Xh atras" nos client cards

### Client Detail

- [ ] **DETAIL-01**: ClientDetailPage reestruturada com 4 tabs (Visao Geral, Conversas, Metricas, Configuracao)
- [ ] **DETAIL-02**: KPIs com dados reais de `recuperai_monthly_metrics` (Receita Bot, ROI%, Taxa Conversao, Ticket Medio)
- [ ] **DETAIL-03**: Charts com dados reais (RevenueArea, RevenueBar, ConversionPie, ConversionFunnel)
- [ ] **DETAIL-04**: Timeline de conversas reais das ultimas 20 de `conversations` com status badges

### CRM

- [ ] **CRM-02**: Kanban cards com BANT score visual (barra segmentada) e lead tier badge (Hot/Warm/Cold)
- [ ] **CRM-03**: Lead Detail Panel como slide-over (Sheet) com info completa, BANT breakdown, timeline interacoes
- [ ] **CRM-04**: Scroll-shadow indicators no Kanban para navegacao entre 7 colunas

### UX Polish

- [ ] **UX-02**: EmptyState component com mensagens especificas por contexto
- [ ] **UX-03**: Loading skeletons em todos os componentes + error states com retry
- [ ] **UX-04**: Tipografia consistente (4 niveis) e cor semantica (verde=positivo, vermelho=atencao, cinza=neutro)

## v2 Requirements

### Performance

- **PERF-01**: Lazy chart rendering com IntersectionObserver
- **PERF-02**: Disable `isAnimationActive` em charts full-size

### Structure

- **STRUCT-01**: Rename `components/home/` → `components/overview/`, `components/dashboard/` → `components/client-detail/`
- **STRUCT-02**: Sticky headers nas tabelas

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-user auth | CEO-only v1, nao precisa de roles |
| Mobile app | Dashboard e desktop-first |
| Notificacoes push | Sem necessidade v1, CEO olha quando quer |
| Export CSV | PDF e Excel cobrem, CSV seria redundante |
| Edicao de leads via dashboard | CRM write e via agente IA, nao manual |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FIX-01 | Phase 1 | Pending |
| FIX-02 | Phase 1 | Pending |
| FIX-03 | Phase 1 | Pending |
| FIX-04 | Phase 3 | Pending |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| SEC-01 | Phase 2 | Pending |
| SEC-02 | Phase 2 | Pending |
| SEC-03 | Phase 2 | Pending |
| CEO-01 | Phase 4 | Pending |
| CEO-02 | Phase 4 | Pending |
| CEO-03 | Phase 4 | Pending |
| CEO-04 | Phase 4 | Pending |
| CEO-05 | Phase 4 | Pending |
| CEO-06 | Phase 4 | Pending |
| CEO-07 | Phase 4 | Pending |
| DETAIL-01 | Phase 5 | Pending |
| DETAIL-02 | Phase 5 | Pending |
| DETAIL-03 | Phase 5 | Pending |
| DETAIL-04 | Phase 5 | Pending |
| CRM-02 | Phase 6 | Pending |
| CRM-03 | Phase 6 | Pending |
| CRM-04 | Phase 6 | Pending |
| UX-02 | Phase 7 | Pending |
| UX-03 | Phase 7 | Pending |
| UX-04 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0

---
*Requirements defined: 2026-03-24*
*Last updated: 2026-03-24 after GSD initialization*
