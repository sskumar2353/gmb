# Green Miles Leftover Tasks

This checklist captures the remaining work to make the current changes merge-ready and production-safer.

## P0 - Must finish before merge

- [x] Confirm frontend production build passes (`frontend`).
- [x] Confirm backend compile passes (`backend`).
- [x] Confirm no obvious lints on touched admin/auth/service files.
- [x] Fix local runtime DB credential mismatch (using provided DB creds in runtime env vars).
- [x] Validate DB migration path by applying `backend/db/admin_ops_schema.sql` locally.
- [x] Smoke-test admin endpoints end-to-end with authenticated admin token:
  - `GET /api/v1/admin/dashboard`
  - `GET/POST /api/v1/admin/drivers`
  - `GET/POST /api/v1/admin/routes`
  - `POST /api/v1/admin/ride-assignments`
  - `GET /api/v1/admin/payments`
  - `GET /api/v1/admin/audit-logs`
- [ ] Verify frontend admin UI flows against live backend:
  - add driver
  - add route
  - assign ride
  - view payment logs
  - view pending application widgets
- [x] Add repeatable admin smoke guide and verification script (`ADMIN_FRONTEND_SMOKE_GUIDE.md`, `backend/scripts/verify-admin-smoke.ps1`).
- [x] Add or run API-level tests for newly introduced admin service/controller behavior.

## P1 - Should complete next

 - [x] Seed and fixture validation for new admin/auth entities (`route_plans`, `payment_logs`, `driver_profiles`, `refresh_tokens`) with realistic local demo data.
- [x] Harden validation/error messaging for admin forms (surface backend validation errors in UI toasts).
- [x] Return field-level validation details from backend for `@Valid` request failures and show inline field errors in admin forms.
- [x] Confirm role-based access behavior for admin routes (positive + negative path tests).
- [ ] Document admin operations workflow (driver onboarding, route setup, assignment lifecycle).
- [x] Add backend integration tests for admin controller/service flows (create driver, create route, assign ride, list payments, denied audit logs).
- [x] Add auth hardening baseline:
  - hashed password storage + legacy password migration on login
  - user token invalidation support via `/api/v1/auth/logout`
  - auth endpoint rate limiting
  - configurable CORS allowed origins
  - auth failure audit logging (`logs` table)
- [x] Add auth hardening phase 2:
  - refresh token rotation flow (`/api/v1/auth/refresh`)
  - scheduled cleanup of expired sessions/refresh tokens
  - login lockout after repeated failed attempts
  - admin security metrics endpoint (`/api/v1/security/metrics`)
- [x] Frontend auth token lifecycle integration:
  - persist refresh token in client auth state
  - auto-refresh on `401` and retry original request once
  - force logout + user-visible session-expired toast when refresh fails
- [x] Extend inline field-error UX to auth and courier forms for consistency.

## P2 - Nice-to-have improvements

- [x] Address frontend chunk-size warning with route-level code splitting.
- [x] Add basic monitoring logs/metrics around admin operations (assignment created, route created, driver created).
- [x] Add pagination and filtering for payment logs and drivers.
- [ ] Consider replacing `DriverProfile` mapping with explicit `@OneToOne` for stricter intent and clearer JPA semantics.

## Current execution status

- [x] Initial triage complete.
- [x] Build/compile/lint baseline checks complete.
- [x] Admin UI now surfaces backend API messages for failed operations.
- [x] Endpoint smoke tests completed successfully (dashboard/drivers/routes/assignment/payments/audit).
