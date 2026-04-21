# Green Miles Live Deployment Guide (Railway + Render)

This guide makes the app live end-to-end using:
- Railway MySQL (managed cloud DB)
- Render Web Service (Spring Boot backend)
- Render Static Site (React frontend)

## 1) Create Railway MySQL and collect credentials

1. In Railway, create a new project and add a **MySQL** service.
2. Open MySQL service -> **Variables** and copy:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
3. Build JDBC URL in this format:

`jdbc:mysql://<MYSQLHOST>:<MYSQLPORT>/<MYSQLDATABASE>?useSSL=true&requireSSL=true&serverTimezone=UTC`

4. Keep these for Render env setup:
   - `DB_URL` = JDBC URL above
   - `DB_USERNAME` = `MYSQLUSER`
   - `DB_PASSWORD` = `MYSQLPASSWORD`

## 2) Apply schema and seed into Railway DB

Use any MySQL client (MySQL Workbench/TablePlus/DBeaver) and execute in order:

1. `backend/db/admin_ops_schema.sql`
2. `backend/db/auth_security_schema.sql`
3. `backend/db/greenmiles_seed.sql`

Run with the Railway MySQL connection details from step 1.

## 3) Deploy backend on Render

Create a Render **Web Service** from this repo:

- Root directory: `backend`
- Environment: `Java`
- Build command: `./gradlew clean bootJar`
- Start command: `java -jar build/libs/backend-0.0.1-SNAPSHOT.jar`
- Health check path: `/actuator/health`

Set env vars:

- `DB_URL` = Railway JDBC URL
- `DB_USERNAME` = Railway MySQL user
- `DB_PASSWORD` = Railway MySQL password
- `JWT_SECRET` = long random secret (at least 32 chars)
- `JWT_EXP_MINUTES` = `120`
- `JWT_REFRESH_EXP_MINUTES` = `10080`
- `ADMIN_USERNAME` = admin login username
- `ADMIN_PASSWORD` = strong admin password
- `CORS_ALLOWED_ORIGINS` = your frontend URL (exact origin, comma-separated if many)
- `AUTH_RATE_LIMIT_MAX_REQUESTS` = `30`
- `AUTH_RATE_LIMIT_WINDOW_SECONDS` = `60`
- `AUTH_LOCKOUT_MAX_ATTEMPTS` = `5`
- `AUTH_LOCKOUT_DURATION_MINUTES` = `15`
- `AUTH_CLEANUP_FIXED_DELAY_MS` = `300000`

After deploy, verify:
- `https://<backend-domain>/actuator/health`

Expected: status `UP`.

## 4) Deploy frontend on Render

Create a Render **Static Site** from this repo:

- Root directory: `frontend`
- Build command: `npm ci && npm run build`
- Publish directory: `dist`

Set env var:
- `VITE_API_BASE_URL` = `https://<backend-domain>`

Redeploy frontend once backend is healthy.

## 5) Post-deploy smoke checklist

1. Open frontend URL.
2. Login with admin credentials.
3. Validate Admin dashboard cards load.
4. Add driver, add route, assign ride.
5. Check payment logs render.
6. Validate auth refresh by waiting token expiry or forcing a 401.

API quick checks:
- `GET https://<backend-domain>/actuator/health`
- `POST https://<backend-domain>/api/v1/auth/admin/login`
- `GET https://<backend-domain>/api/v1/admin/dashboard` (with Bearer token)

## 6) Local smoke against Railway DB (optional)

From repo root (PowerShell):

```powershell
$env:DB_USERNAME="<MYSQLUSER>"
$env:DB_PASSWORD="<MYSQLPASSWORD>"
$env:DB_URL="jdbc:mysql://<MYSQLHOST>:<MYSQLPORT>/<MYSQLDATABASE>?useSSL=true&requireSSL=true&serverTimezone=UTC"
./backend/gradlew.bat bootRun
```

In another terminal:

```powershell
./run-admin-smoke.ps1 -BaseUrl "http://localhost:8080" -SkipDbEnv
```

Use `-SkipDbEnv` because DB env is already set in the backend terminal session.
