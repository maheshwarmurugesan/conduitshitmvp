# Spec implementation summary

Your technical spec is implemented as follows. Use this as the single reference.

---

## 1. Connector-based architecture

- **Path:** `backend/connectors/`
- **Layout:** `scada/`, `cmms/`, `wims/`, `lims/`, `logs/`
- **Base:** `connectors/base.py` defines `BaseConnector` with:
  - `test_connection()` → `(bool, error_message)`
  - `fetch_data(**kwargs)` → list of raw records
  - `normalize(raw)` → normalized list
  - `push_data(payload, **kwargs)` → `(bool, error_message)` where applicable
- All vendor logic is in the connector classes; each connector implements the above.

---

## 2. SCADA (OPC UA–style)

- **Models:** `ScadaReading` (timestamp, tag_name, value, unit, quality, alarm_state), `AlarmEvent` (timestamp, tag_name, alarm_state, message, value).
- **Connector:** `connectors/scada.py` – `test_connection()`, `fetch_data()`, `normalize()` returning the spec schema. **TODO:** Real OPC UA client when endpoint + tag list are available.
- **Endpoints:** `POST /api/scada/test`, `POST /api/scada/poll` (fetch → normalize → store `ScadaReading` + legacy `Reading` cache).

---

## 3. CMMS (Maintenance Connection primary, SAP stub)

- **Interface:** Generic CMMS in `connectors/cmms.py`: `create_work_order(asset_name, description, priority, asset_id, source_alarm_id, created_by_system, ...)` with retry/failure logging left for real API.
- **Normalized WO schema:** asset_id, asset_name, description, priority, source_alarm_id, created_by_system (and optional assignee, scada_snapshot).
- **TODO:** Maintenance Connection REST API (endpoint, auth) when available; SAP stub only.

---

## 4. WIMS / compliance (no public API assumed)

- **Behavior:** No direct WIMS API. Compliance = build data + operator approval + **CSV export** for manual upload.
- **Audit:** Every compliance export is logged in `AuditLog` (action `compliance_export`, actor_id, actor_role, payload).
- **Endpoint:** `POST /api/compliance/export` – returns CSV; **only Supervisor or Admin** (via header `X-Role`). **TODO:** Configurable CSV schema when WIMS format is known.

---

## 5. Electronic log

- **Internal system:** `backend/elog/` (existing) – shift logs, auto-entries: "readings_approved", "work_order_created", "alarm_acknowledged".
- **Endpoint:** `POST /api/logs/write` – body: plant_id, operator_id, operator_name, entry_type, body, metadata. Immutable audit trail via existing log_entries table.

---

## 6. API endpoints (spec list)

| Spec endpoint            | Implemented | Notes |
|-------------------------|------------|--------|
| POST /scada/test        | Yes        | `POST /api/scada/test` |
| POST /scada/poll        | Yes        | `POST /api/scada/poll` |
| POST /alerts/process     | Yes        | `POST /api/alerts/process` |
| POST /work-orders/create| Yes        | `POST /api/work-orders/create` (existing) |
| POST /compliance/export  | Yes        | `POST /api/compliance/export` (CSV, Supervisor only) |
| POST /logs/write        | Yes        | `POST /api/logs/write` |

---

## 7. Security and roles

- **Roles:** Operator, Supervisor, Admin (supplied via header **`X-Role`**; in production should come from auth token).
- **Rule:** Only **Supervisor or Admin** can approve data. Enforced on:
  - `POST /api/compliance/export` – returns 403 if `X-Role` is not Supervisor or Admin.
- **Audit:** All actions that change compliance or approvals should be logged; currently `AuditLog` is used for compliance_export.

---

## 8. Database schema (new/updated)

- **ScadaReading** – scada_readings (timestamp, tag_name, value, unit, quality, alarm_state).
- **AlarmEvent** – alarm_events (timestamp, tag_name, alarm_state, message, value).
- **AuditLog** – audit_logs (action, actor_id, actor_role, payload).
- Existing: Reading, Alert, WorkOrderRecord, E-Log (log_entries).

---

## 9. TODOs (vendor-specific or unknown)

- **SCADA:** OPC UA endpoint URL and tag list (Ignition/Wonderware/GE Historian) → implement real client in `connectors/scada.py`.
- **CMMS:** Maintenance Connection API (endpoint, auth, work order payload) → implement in `connectors/cmms.py` with retry and failure logging.
- **WIMS:** CSV column/schema for target system → make `compliance/export` configurable.
- **PostgreSQL / Celery:** Spec mentions PostgreSQL and background workers; current app uses SQLite and synchronous execution. Swap when you’re ready for production.

---

## 10. How to run and test

- Backend: `cd backend && uvicorn main:app --reload --port 8000`
- **Spec endpoints:**
  - `POST /api/scada/test` – test SCADA connection.
  - `POST /api/scada/poll` – poll and store readings.
  - `POST /api/alerts/process` – run alert rules (after poll).
  - `POST /api/compliance/export` – CSV export (send header `X-Role: Supervisor`).
  - `POST /api/logs/write` – create log entry (body as in spec).

Yes, this is the information we needed; the codebase is now aligned to your spec with clear TODOs where vendor details are required.
