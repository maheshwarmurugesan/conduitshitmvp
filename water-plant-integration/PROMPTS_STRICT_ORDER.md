# Prompts in strict order — copy-paste one at a time

Follow the steps exactly: **paste Prompt 1** → I build that only → you test → then **paste Prompt 2** → I build that only → etc. Do not skip; each prompt assumes the previous ones are done.

---

## Prompt 1 — Auth stub + current user

**Paste this first. When it’s built, test: you can call an endpoint with a simple auth header and get a consistent “current user.”**

```
TECH FLOW:
- Input: Request header (e.g. Authorization: Bearer <token> or X-API-Key: <key>). For demo, token can be a simple string that we decode to operator_id, plant_id, role (e.g. "demo:op1:default_plant:operator" or JSON).
- Process: Backend reads the header, parses it (no real OAuth yet), and builds a "current user" object: operator_id, operator_name, plant_id, role (operator | supervisor | admin).
- Output: A FastAPI dependency get_current_user() that returns this object. If header missing or invalid, return 401.

BUILD IT:
In this repo (water-plant-integration/backend):
1. Add auth.py: function get_current_user() that reads Authorization or X-API-Key header. For demo, accept a token like "operator_id:plant_id:role" (e.g. "op1:default_plant:operator") and parse it into a Pydantic model CurrentUser(operator_id, operator_name, plant_id, role). If missing/invalid, raise HTTPException 401.
2. Add the dependency to one route first (e.g. GET /api/dashboard/readings/latest) so it requires auth. Document in a one-line comment that other routes will use this next.
Do not change frontend yet. Do not add real OAuth. Keep it minimal.
DONE WHEN: GET /api/dashboard/readings/latest returns 401 without the auth header, and 200 with a valid header (e.g. Authorization: Bearer op1:default_plant:operator).
```

---

## Prompt 2 — Use auth in all routes (replace body/header identity)

**Paste this after Prompt 1 is done.**

```
TECH FLOW:
- Input: Every route that currently takes operator_id, operator_name, plant_id, or X-Role from the request body or header must instead get identity from the authenticated current user (Prompt 1).
- Process: Inject get_current_user as a dependency. Use current_user.operator_id, current_user.plant_id, current_user.role everywhere. Remove trust of any client-supplied operator_id, plant_id, or X-Role for authorization.
- Output: All platform and spec routes use get_current_user(); approve and compliance/export use current_user.role to enforce Supervisor or Admin only.

BUILD IT:
In this repo (water-plant-integration/backend):
1. In routes_platform.py: Add Depends(get_current_user) to every endpoint that uses operator_id, plant_id, or role. Replace payload.operator_id / payload.plant_id / Query("plant_id") with current_user.operator_id and current_user.plant_id. For morning_review_approve, require current_user.role in ("supervisor", "admin") or return 403.
2. In routes_spec.py: Remove get_role(x_role=Header). Use get_current_user() and require_supervisor(role=current_user.role). Apply require_supervisor to compliance/export and any other approve-style endpoint.
3. In schemas: Remove or make optional operator_id/plant_id from request bodies where they are now derived from current_user. Frontend will need to send the auth header; do not change frontend in this step except ensure it sends one header (e.g. Authorization: Bearer op1:default_plant:operator) for all API calls.
DONE WHEN: No route trusts client-supplied operator_id or role for authorization. Compliance export and morning approve require Supervisor/Admin from auth. Unauthorized requests get 401.
```

---

## Prompt 3 — SCADA config-driven (env for endpoint + tag list)

**Paste this after Prompt 2 is done.**

```
TECH FLOW:
- Input: Env vars OPC_UA_ENDPOINT (URL) and OPC_UA_TAG_LIST (comma-separated tag names). Optional.
- Process: If both are set, SCADA connector attempts to use them (can still be a stub that reads "mock" data but keyed by that tag list). If not set, keep current mock behavior unchanged.
- Output: Connector behavior is driven by config; when we add real OPC UA client later, we only swap the fetch_data implementation.

BUILD IT:
In this repo (water-plant-integration/backend):
1. In connectors/scada.py: Read os.environ.get("OPC_UA_ENDPOINT") and os.environ.get("OPC_UA_TAG_LIST"). If both set, use OPC_UA_TAG_LIST to build the list of tags to "fetch" (for now, still return mock values for those tag names). If not set, keep current MOCK_TAGS behavior.
2. test_connection(): If OPC_UA_ENDPOINT is set, return (True, None) or (False, "connection refused") based on a simple connectivity check (e.g. try to connect to URL with a short timeout). If not set, return (True, None) for demo.
3. Document in a short comment: "TODO: Replace fetch_data with real OPC UA client when endpoint and tags are confirmed."
DONE WHEN: Setting OPC_UA_ENDPOINT and OPC_UA_TAG_LIST changes which tags are returned (and optionally test_connection). Unset env keeps current demo behavior.
```

---

## Prompt 4 — CMMS retry + failure logging

**Paste this after Prompt 3 is done.**

```
TECH FLOW:
- Input: create_work_order() in connectors/cmms.py is called with asset_name, description, priority, etc.
- Process: When calling external CMMS (currently stub), implement retry: 2 retries with exponential backoff on failure. On final failure, log to our DB (e.g. a new table cmms_failures or a generic audit_logs row) with payload, error message, timestamp.
- Output: Work order creation is production-ready from a resilience standpoint; real API can be dropped in later.

BUILD IT:
In this repo (water-plant-integration/backend):
1. In connectors/cmms.py: Add a helper that calls the stub create (or future API) with retry: max 3 attempts, backoff 1s, 2s. On each failure, log to a new table or to audit_logs (action="cmms_create_failed", payload=..., error=...).
2. create_work_order() uses this helper. Return (False, None, error_message) on final failure and ensure one log entry is written.
DONE WHEN: A forced failure (e.g. stub returns failure) results in retries and a log entry in DB on final failure. Success path unchanged.
```

---

## Prompt 5 — Compliance CSV configurable schema

**Paste this after Prompt 4 is done.**

```
TECH FLOW:
- Input: Latest readings from DB (source=scada). Optional config: mapping from our tag names to WIMS column names and column order.
- Process: Read config from env (e.g. COMPLIANCE_CSV_COLUMNS as JSON) or a small JSON file in backend (e.g. config/compliance_columns.json). Format: {"csv_header": "our_tag_name", ...} or list of column names in order. Build CSV rows using this mapping. If no config, keep current behavior (tag, value, unit, timestamp).
- Output: POST /api/compliance/export returns CSV with headers and column order from config when present.

BUILD IT:
In this repo (water-plant-integration/backend):
1. Add a small config loader: if COMPLIANCE_CSV_COLUMNS env set (JSON) or file config/compliance_columns.json exists, use it to map our readings to CSV columns and order. Otherwise use default ["tag", "value", "unit", "timestamp"].
2. In routes_spec.py compliance_export: Build CSV using this config. Write header row from config keys or order; write rows from readings. Keep audit log as-is.
DONE WHEN: Setting COMPLIANCE_CSV_COLUMNS (or adding the JSON file) changes the CSV header and column order. Unset config keeps current CSV format.
```

---

## Prompt 6 — Rate limiting on sensitive endpoints

**Paste this after Prompt 5 is done.**

```
TECH FLOW:
- Input: All requests to POST /api/ingest, POST /api/scada/poll, POST /api/morning-review/approve, POST /api/work-orders/create, POST /api/compliance/export.
- Process: Apply a simple in-memory rate limit per IP (or per current_user.operator_id if you prefer): e.g. max 60 requests per minute per key. If exceeded, return 429.
- Output: No single client can hammer these endpoints.

BUILD IT:
In this repo (water-plant-integration/backend):
1. Add a simple rate limiter (e.g. dict of key -> list of timestamps, or use slowapi library if you prefer). Dependency that checks request.client.host (or current_user.operator_id), drops old timestamps outside the window, and raises 429 if count > limit.
2. Apply this dependency to POST /api/ingest, POST /api/scada/poll, POST /api/morning-review/approve, POST /api/work-orders/create, POST /api/compliance/export. Use a limit of 60 per minute per IP.
DONE WHEN: Sending more than 60 requests per minute to any of these endpoints from one IP returns 429.
```

---

## Prompt 7 — Input validation (max length, charset)

**Paste this after Prompt 6 is done.**

```
TECH FLOW:
- Input: All request body and query string text fields: log body, overrides, notes, operator_name, final_notes, etc.
- Process: Enforce max length (e.g. 2000 chars for free text, 256 for names) and allow only printable UTF-8 (reject control chars). Use Pydantic validators or Field(max_length=..., pattern=...).
- Output: Long or malicious payloads are rejected with 422.

BUILD IT:
In this repo (water-plant-integration/backend):
1. In schemas_shared.py and any request body schemas: Add Field(max_length=2000) for body/notes fields, max_length=256 for names. Add a validator or pattern to reject control characters (e.g. regex that allows only printable ASCII + common UTF-8).
2. In elog/schemas.py: Same for body and any free-text fields. Apply to routes_spec LogWriteBody, ShiftSignOff, MorningReviewApprove overrides values, etc.
DONE WHEN: Sending a body with length > 2000 or with control characters returns 422 validation error.
```

---

## Prompt 8 — IDOR fix: filter by current user’s plant

**Paste this after Prompt 7 is done.**

```
TECH FLOW:
- Input: Every endpoint that takes alert_id, entry_id, plant_id, or returns data from DB must only return or act on data that belongs to the current user’s plant (or allow admin to see all).
- Process: Use current_user.plant_id in all queries. For GET /api/alerts, GET /api/alerts/{id}, GET /api/dashboard/readings/latest, POST /api/alerts/{id}/dismiss, POST /api/alerts/{id}/log-only, POST /api/work-orders/create, GET /api/elog/entries, etc.: add filter where plant_id == current_user.plant_id (or allow if current_user.role == "admin" to see all plants).
- Output: A user cannot read or modify another plant’s alerts, readings, or logs.

BUILD IT:
In this repo (water-plant-integration/backend):
1. In routes_platform.py: For every endpoint that reads or writes alerts, readings, work_order_records, or e-log entries, add a filter: Reading.plant_id == current_user.plant_id (or is None for legacy), Alert.plant_id == current_user.plant_id, etc. For work-orders/create, verify the alert’s plant_id matches current_user.plant_id before creating. If current_user.role == "admin", allow plant_id to be optional or all plants.
2. In routes_spec.py: Same for scada/poll, alerts/process, compliance/export (use current_user.plant_id when filtering readings). In elog routes, filter by plant_id from current_user.
DONE WHEN: Changing plant_id in auth token to another plant yields no data (or 404) for that plant’s resources; users only see their own plant’s data.
```

---

## Prompt 9 — CORS restrict to frontend origin

**Paste this after Prompt 8 is done.**

```
TECH FLOW:
- Input: All API requests from the browser (frontend).
- Process: Backend CORS middleware should allow only the frontend origin (e.g. http://localhost:3000 in dev, or env FRONTEND_ORIGIN in production). Reject other origins.
- Output: Only our frontend can call the API from the browser.

BUILD IT:
In this repo (water-plant-integration/backend):
1. In main.py: Add CORSMiddleware. Set allow_origins from env FRONTEND_ORIGIN (comma-separated list) or default to ["http://localhost:3000"] for dev. Set allow_credentials=True if needed. Do not use allow_origins=["*"] in production.
2. Document: For production, set FRONTEND_ORIGIN to your frontend URL.
DONE WHEN: Request from browser at allowed origin succeeds; request from another origin (e.g. different port or domain) is blocked by CORS.
```

---

## Prompt 10 — Security checklist update

**Paste this last, after Prompts 1–9 are done.**

```
TECH FLOW:
- Input: SECURITY_HUMAN_IN_THE_LOOP.md and the changes we made in Prompts 1–9.
- Process: Update the security doc to reflect what was fixed: auth stub, role from auth, rate limiting, input validation, IDOR fix, CORS. Leave a short "Remaining for production" list (e.g. real OAuth, secrets manager).
- Output: Doc is accurate so the next human knows what’s done and what’s left.

BUILD IT:
In this repo (water-plant-integration): Update SECURITY_HUMAN_IN_THE_LOOP.md: Add a "FIXED" section that lists each item we addressed (auth, authorization, rate limit, input validation, IDOR, CORS). Mark those items as done in the checklist. Add "Remaining for production" with 1–3 items (e.g. real OAuth/SSO, secrets manager, disable debug).
DONE WHEN: The security doc clearly shows what was fixed in this pass and what remains.
```

---

## Order summary

| # | What you paste | What gets built |
|---|----------------|------------------|
| 1 | Prompt 1 | Auth stub + get_current_user |
| 2 | Prompt 2 | All routes use auth; Supervisor-only approve |
| 3 | Prompt 3 | SCADA config-driven (env endpoint + tags) |
| 4 | Prompt 4 | CMMS retry + failure logging |
| 5 | Prompt 5 | Compliance CSV configurable schema |
| 6 | Prompt 6 | Rate limiting on sensitive POSTs |
| 7 | Prompt 7 | Input validation (length, charset) |
| 8 | Prompt 8 | IDOR fix (filter by plant_id) |
| 9 | Prompt 9 | CORS restrict to frontend origin |
| 10 | Prompt 10 | Security doc update |

Use them in order. After each prompt is built and tested, move to the next.
