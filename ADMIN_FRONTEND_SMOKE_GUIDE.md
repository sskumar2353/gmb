# Admin Frontend Smoke Guide

Use this guide to quickly verify the admin page against the live backend with repeatable checks.

## 1) Prerequisites

- Backend DB is reachable.
- Backend is running (default `http://localhost:8080`).
- Frontend is running (`http://localhost:5173`).
- Admin credentials are valid (default: `admin` / `admin@123`).

## 2) Start services

Backend (PowerShell, repo root):

```powershell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="pass123"
$env:DB_URL="jdbc:mysql://localhost:3306/greenmilesbooking?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
./backend/gradlew.bat bootRun
```

Frontend:

```powershell
cd frontend
npm run dev
```

## 3) Manual UI smoke flow (admin page)

1. Open `http://localhost:5173`.
2. Login as admin.
3. Go to **Admin** page.
4. Confirm dashboard cards load (rides, route plans, payments, paid amount).
5. Click **Add Driver**, fill required fields, submit.
6. Confirm success toast appears and new driver is listed in **Registered Drivers**.
7. Click **Add Route**, choose Hyderabad -> Macherla (or any valid two cities), submit.
8. Confirm success toast and route appears in assignment route dropdown.
9. Click **Assign Driver to Route**, select route + driver + car + start time, submit.
10. Confirm success toast and new assignment appears in **Admin Live Ops**.
11. Open **Payment Logs** section and verify it renders without API errors.
12. Trigger one invalid action (e.g., submit incomplete modal) and confirm validation/error toast is readable.

## 4) One-command smoke check (recommended)

Run this from repo root:

```powershell
./run-admin-smoke.ps1 -BaseUrl "http://localhost:8080"
```

This wrapper:

- sets `DB_USERNAME`, `DB_PASSWORD`, and `DB_URL` for the current shell session
- calls the underlying verifier script

Optional overrides:

```powershell
./run-admin-smoke.ps1 -BaseUrl "http://localhost:8081" -DbUsername "root" -DbPassword "pass123" -DbHost "localhost:3306" -DbName "greenmilesbooking"
```

## 5) Automated post-check (direct verifier)

Run this from repo root after the UI flow:

```powershell
./backend/scripts/verify-admin-smoke.ps1 -BaseUrl "http://localhost:8080" -AdminUsername "admin" -AdminPassword "admin@123"
```

The script validates:

- Admin login/token retrieval.
- Baseline reads (`dashboard`, `drivers`, `routes`, `payments`, `audit-logs`).
- Admin create operations (`routes`, `drivers`, `ride-assignments`).
- Count growth and response consistency after creates.

## 6) Expected pass signals

- No 4xx/5xx errors in backend logs for admin endpoints.
- Script ends with `Smoke verification complete.` and prints created IDs.
- Frontend shows success toasts for create/assign operations.

## 7) If something fails

- Check backend logs first (exception stack traces).
- Re-run only script to isolate API issue from UI issue.
- If API passes but UI fails, inspect browser devtools network tab for payload mismatch.
