# Green Miles Feature Tracker

Use this tracker to manage remaining feature work.  
Status values: `todo`, `in_progress`, `blocked`, `done`.

## Snapshot

| Track | Status | Owner | Target Date | Notes |
|---|---|---|---|---|
| P0 Admin UI E2E pass | todo |  |  | Validate add driver/route/assignment/payments/pending widgets |
| Seed + fixture quality | todo |  |  | Cover `route_plans`, `payment_logs`, `driver_profiles`, `refresh_tokens` |
| Admin ops documentation | todo |  |  | Runbook for onboarding, routing, assignment, failure handling |
| Frontend performance (code split) | todo |  |  | Reduce large main bundle warning |
| Admin list scalability | todo |  |  | Pagination/filtering for drivers and payment logs |
| Observability expansion | todo |  |  | Add business metrics for admin actions |
| DriverProfile mapping refinement | todo |  |  | Optional `@OneToOne` cleanup + migration check |

## Detailed Backlog

| ID | Priority | Feature | Status | Owner | ETA | Dependencies | Verification |
|---|---|---|---|---|---|---|---|
| GM-001 | P0 | Admin operations UI E2E verification | todo |  |  | backend live + seeded data | Manual pass in `ADMIN_FRONTEND_SMOKE_GUIDE.md` |
| GM-002 | P1 | Seed + fixture expansion for admin/auth entities | todo |  |  | DB migration scripts | DB row checks + smoke script |
| GM-003 | P1 | Admin operations workflow documentation | todo |  |  | GM-001 | Docs review + onboarding dry-run |
| GM-004 | P2 | Frontend route-level code splitting | todo |  |  | none | `npm run build` bundle reduction |
| GM-005 | P2 | Pagination + filtering (drivers/payments) | todo |  |  | none | UI pagination/filter behavior |
| GM-006 | P2 | Admin action metrics and dashboards | todo |  |  | GM-001 | Metrics endpoint and sample graphs |
| GM-007 | P2 | `DriverProfile` relation cleanup to `@OneToOne` | todo |  |  | GM-002 | compile + migration + smoke tests |

## Change Log

| Date | Change | Updated By |
|---|---|---|
| 2026-04-20 | Initial tracker created |  |
