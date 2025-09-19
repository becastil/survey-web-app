# Executive Overview

## Goals

- Migrate an Excel-based questionnaire to a robust, accessible web application.
- Support conditional logic, real-time collaboration, analytics, and import/export.
- Enforce strong security using Supabase Auth + RLS and audit logging.
- Deliver a maintainable, testable, CI/CD-enabled codebase deployable to Vercel.

## Success Metrics

- Functional parity with Excel (+ UX improvements) within agreed scope.
- P95 page load < 2.5s; P95 API < 300ms; availability ≥ 99.9%.
- 0 critical security issues in SAST/DAST scans and pentest.
- <1% error rate per 10k requests; <1% client-side crash rate.
- User adoption: ≥ 90% teams switch from Excel within 4 weeks of launch.

## Scope (Core)

- Survey rendering (SurveyJS), conditional visibility, validation, and save-as-you-go.
- Collaboration: real-time presence, live updates, and edit locks/reconciliation.
- Analytics: response comparisons, filters, and export to CSV/Excel/PDF.
- RBAC: org admins, editors, viewers with RLS-based isolation.
- Audit trail: immutable actions log for key entities.

## Out of Scope (Initial)

- Offline-first/desktop packaging; complex ML-based insights.
- Full Power BI integration (provide hooks only).
- SSO/SCIM (evaluate in Phase 3+).

## Risks & Mitigations

- Data model complexity: versioned surveys + branching logic.
  - Mitigate: store canonical SurveyJS JSON per version; derive analytics views.
- RLS pitfalls: accidental data leaks or update blocks.
  - Mitigate: design-by-policy; test policies with unit/integration tests & fixtures.
- Real-time conflicts: multiple editors on same response.
  - Mitigate: optimistic UI + server reconciliation; edit locks for critical flows.
- Migration resistance: teams used to Excel workflows.
  - Mitigate: strong import/export, training, staged rollout, change champions.
- Performance: heavy questionnaires.
  - Mitigate: pagination/sections, virtualization, code-splitting, tuned indexes.

## Stakeholders

- Product: defines questionnaire scope and acceptance criteria.
- Engineering: full-stack app + infra + data model.
- Security/Compliance: reviews RLS, audit, and data handling.
- QA: test strategy, automation, and regression.
- Ops: monitoring, incident response, and SLOs.

## Timeline (Indicative)

- Phase 1 (1–2 weeks): Discovery & setup.
- Phase 2 (4–6 weeks): Core development.
- Phase 3 (2–3 weeks): Advanced features.
- Phase 4 (1–2 weeks): Testing & security hardening.
- Phase 5 (1 week): Launch & operations.

