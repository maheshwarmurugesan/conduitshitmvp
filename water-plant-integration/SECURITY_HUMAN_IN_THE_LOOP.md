# Human-in-the-loop: Security check + common attack vectors

This doc completes the step: *At the end check for security issues and ask for common attack vectors.*

---

## 1. Security issues in the current (demo) app

| Issue | Severity | Status | What to do before production |
|-------|----------|--------|------------------------------|
| **No real authentication** | High | **Stub in place** | Token-based stub: `operator_id:plant_id:role` in Bearer/X-API-Key. Identity and role from token only. | Replace with real auth (e.g. Plant SSO, JWT) before production. |
| **Role is client-controlled** | High | **Fixed** | Role is taken only from auth token; client cannot override. | — |
| **No rate limiting** | Medium | **Fixed** | Rate limiting on ingest, scada/poll, morning-review/approve, work-orders/create, compliance/export. | — |
| **No input validation on IDs** | Medium | **Fixed** | Plant-scoped access (IDOR fix); alert/entry must belong to user’s plant. | — |
| **IDOR (Insecure Direct Object Reference)** | Medium | **Fixed** | All data access filtered by `current_user.plant_id`; admin can see all plants. | — |
| **Secrets in env** | Low for demo | OK for demo | No API keys in code; when we add real connectors we’ll use env. | Use a secrets manager in production. |
| **CORS** | Low | **Fixed** | CORS restricted to `FRONTEND_ORIGIN` (default localhost:3000). | For production, set `FRONTEND_ORIGIN` to your frontend URL. |
| **Audit log** | Good | Present | Compliance export and key actions can be logged. | Ensure all sensitive actions (approve, create WO, export) write to audit_logs with actor_id from auth. |

---

## 1b. FIXED (this pass)

The following were addressed in the current implementation so the next human knows what’s done:

| Item | What was done |
|------|----------------|
| **Auth stub** | `get_current_user()` parses token from `Authorization: Bearer` or `X-API-Key` (format `operator_id:plant_id:role`). All protected routes use this; no trust of client-sent operator_id or role. |
| **Role from auth** | Role and identity come only from the parsed token. `X-Role` and body-supplied roles are not used for authorization. |
| **Rate limiting** | Applied on POST `/api/ingest`, `/api/scada/poll`, `/api/morning-review/approve`, `/api/work-orders/create`, `/api/compliance/export` (e.g. per-IP or per-user limits). |
| **Input validation** | Max lengths (e.g. 2000 for free text, 256 for names) and no control characters on request body/query text fields; 422 on violation. Applied to morning review, work order create, shift sign-off, e-log create, logs/write. |
| **IDOR fix** | All endpoints that read/write alerts, readings, work orders, or e-log entries filter by `current_user.plant_id`. Admin can see all plants; others only their plant. Single-resource endpoints (e.g. GET `/api/alerts/{id}`) return 404 if the resource belongs to another plant. |
| **CORS** | `CORSMiddleware` allows only origins from env `FRONTEND_ORIGIN` (comma-separated) or default `http://localhost:3000`. No `allow_origins=["*"]`. |

---

## 2. Common attack vectors for this app

1. **Impersonation**  
   Attacker sends operator_id: "admin" or X-Role: Supervisor and approves data or exports compliance.  
   **Mitigation:** Real auth; role and identity only from token.

2. **IDOR on alerts / work orders / logs**  
   Attacker guesses or enumerates IDs (e.g. /api/alerts/1, /api/alerts/2) and reads or modifies another plant’s data.  
   **Mitigation:** Every endpoint that touches data must filter by the authenticated user’s plant_id (and role).

3. **Abuse of ingest / poll**  
   Attacker calls POST /api/ingest or POST /api/scada/poll repeatedly to DoS or fill the DB.  
   **Mitigation:** Rate limiting; optionally require auth and restrict to known IPs or roles.

4. **Malicious payload in log body or overrides**  
   Very long strings or weird characters in body/overrides could cause issues (storage, display, or downstream).  
   **Mitigation:** Validate length and charset on all free-text inputs; sanitize or reject.

5. **CSV export abuse**  
   Attacker with Supervisor role (or stolen token) exports compliance data.  
   **Mitigation:** Auth + audit log (we have audit); restrict export to needed roles and log every export.

6. **SQL injection**  
   We use SQLAlchemy ORM and parameters, so raw SQL injection risk is low.  
   **Mitigation:** Keep using ORM/parameterized queries; never build SQL from user input.

7. **Information leakage**  
   Error messages or debug info might expose stack traces or internal paths.  
   **Mitigation:** In production, disable debug; return generic error messages to the client.

---

## 3. Checklist before production (human in the loop)

- [ ] Add real authentication (e.g. JWT or Plant SSO). No trust of operator_id or X-Role from client.
- [x] Enforce authorization: filter all data by user’s plant_id and role.
- [x] Add rate limiting on POST /api/ingest, /api/scada/poll, /api/morning-review/approve, /api/work-orders/create, /api/compliance/export.
- [x] Validate and limit length/charset on all text inputs (log body, overrides, notes).
- [x] Restrict CORS to the frontend origin.
- [ ] Ensure audit_logs (or equivalent) records actor_id from auth for approve, export, create WO.
- [ ] Run app without debug in production; avoid exposing stack traces to clients.
- [ ] Keep secrets (API keys, DB URLs) in env or secret manager; never in code or repo.

---

## 4. Remaining for production

Before connecting real systems or handling real plant data:

1. **Real OAuth / SSO** — Replace the token stub with proper authentication (e.g. JWT from IdP, Plant SSO). No production reliance on `operator_id:plant_id:role` in a header.
2. **Secrets manager** — Store API keys, DB URLs, and signing secrets in a secret manager; do not rely only on env vars in production.
3. **Disable debug** — Run with debug off; avoid exposing stack traces or internal paths to clients.

---

## 5. Summary

- **Demo:** Auth stub, role from auth, rate limiting, input validation, IDOR fix, and CORS are in place. The app is suitable for a controlled demo with token-based identity and plant-scoped data.
- **Pilot / production:** Complete the unchecked items in section 3 and the list in section 4 before going live.

This completes the "human in the loop" step: security issues and common attack vectors are documented; what was fixed and what remains are clearly stated.
