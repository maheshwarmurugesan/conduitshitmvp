# Water Plant Integration Platform — What You Need to Build This

This document translates the [User Flow: Water Plant Integration Platform](#) into concrete requirements: **clarifications you need**, **technical components**, **data/access**, and a **phased build plan**.

---

## 1. Clarifications You Must Get (Before Building)

These determine whether you can integrate at all and how.

### 1.1 SCADA

| Question | Why it matters |
|----------|----------------|
| **Which SCADA vendor/product?** (e.g., Ignition, Wonderware, GE iFix, Siemens, custom) | Determines connector type: OPC-UA, Modbus, direct SQL, vendor API. |
| **How do you get real-time data?** (OPC server, SQL replica, REST API, historian?) | Your doc assumes "SCADA SQL database" — need to confirm table/schema and refresh rate. |
| **Exact data source for:** flow, chlorine, pH, turbidity, pump RPM, tank level, vibration. | You need tag/point names or column names and units. |
| **Where do alarms come from?** (Same DB, separate alarm server, email?) | Needed for "Pump 3 vibration spike" detection and push. |
| **Read-only access OK?** | You should only read from SCADA, never write control. |

**Deliverable you need:**  
- Connection method (e.g., "SQL Server, read-only user") or "OPC-UA endpoint".  
- Schema or tag list: **source system → your internal name → units**.

---

### 1.2 WIMS (Water Information Management System)

| Question | Why it matters |
|----------|----------------|
| **Which WIMS product?** (State/city custom, MuniWater, etc.) | Determines if you have an API or must use DB (with their permission). |
| **How is data submitted today?** (UI form, file upload, API?) | You’re replacing manual entry — need the same target (API or DB table). |
| **Exact fields and formats** for compliance submission (plant ID, date, flow, chlorine, pH, etc.). | Your normalization layer must output exactly what WIMS expects. |
| **Units and rounding rules** (e.g., flow in MGD vs m³/day). | Your doc mentions conversion — need their spec. |

**Deliverable you need:**  
- API docs (if API) **or** DB schema + permission for your app to INSERT (if DB).  
- Field mapping: **your normalized reading → WIMS field**.

---

### 1.3 Electronic Logging System

| Question | Why it matters |
|----------|----------------|
| **Product name and version.** | Determines if there’s an API or only UI. |
| **How to create/log an entry programmatically?** (REST API, database, file?) | You need a stable, supported method. |
| **Required fields per log entry** (operator, timestamp, type, body, attachments?). | Your "Approve & Sync" and "Log Only" flows must match. |

**Deliverable you need:**  
- API specification or approved way to create log entries (with auth).

---

### 1.4 CMMS

| Question | Why it matters |
|----------|----------------|
| **Which CMMS?** (Maximo, SAP PM, Maintenance Connection, Infor, custom?) | Each has different APIs and data models. |
| **How to create a work order?** (REST/SOAP API, import file, DB?) | You need the exact endpoint and payload. |
| **Fields for WO:** asset ID, location, issue type, priority, description, assignee, due date, parts. | Your "auto-filled" screen must map to their model. |
| **How to resolve "Pump 3" to their asset ID?** | You need a plant asset register or mapping table (SCADA asset name → CMMS asset ID). |
| **How to notify the technician?** (CMMS notification, email, separate system?) | Affects whether you only create the WO or also trigger alert. |

**Deliverable you need:**  
- API docs for creating work orders (and optionally fetching tech availability).  
- Asset mapping: **SCADA/plant name (e.g. "Pump 3") ↔ CMMS asset ID**.

---

### 1.5 Plant / Organization

| Question | Why it matters |
|----------|----------------|
| **Pilot plant:** name, size (operators, assets). | Scopes MVP (one plant, one shift). |
| **User roles:** Operator, Supervisor, Maintenance — who can approve sync, create WO, assign? | Drives auth and UI permissions. |
| **Identity:** Existing IdP (AD, Okta, etc.) or local accounts? | Auth and "Remember this device". |
| **Where will the app run?** (On-prem server, cloud, tablet-only?) | Affects network access to SCADA/WIMS/CMMS (often locked down). |
| **Compliance/audit:** Any specific rules (e.g., 21 CFR Part 11, state regs)? | Logging, non-repudiation, retention. |

**Deliverable you need:**  
- One-page "Pilot scope" (plant, systems, roles) and "Deployment environment" (network, hosting).

---

## 2. Technical Components to Build

### 2.1 High-Level Architecture

```
[Tablet / Browser]  ←→  [Your Backend API]
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   [SCADA Connector]   [WIMS Connector]   [E-Log Connector]   [CMMS Connector]
        │                     │                     │                     │
        ▼                     ▼                     ▼                     ▼
   SCADA (SQL/OPC)      WIMS (API/DB)      E-Log (API)        CMMS (API)
```

### 2.2 Backend (Your Middleware)

| Component | Purpose |
|-----------|--------|
| **API server** | Auth, sessions, all UI-facing endpoints (e.g. approve sync, create WO, get alerts). |
| **SCADA connector** | Poll or subscribe to SCADA (SQL or OPC); normalize tags to your internal model; expose "latest readings" and "alarms". |
| **WIMS connector** | Submit approved readings in WIMS format (API or DB). |
| **E-Log connector** | Create log entries (e.g. "Morning readings recorded", "WO created for Pump 3"). |
| **CMMS connector** | Create work order with asset, description, priority, assignee; optionally fetch techs/assets. |
| **Data normalization** | Units, rounding, required fields for each target system. |
| **Rules / intelligence** | Thresholds (e.g. vibration &gt; 0.8 → alert); optional: "similar past incident" (query your DB or CMMS history). |
| **Scheduler** | e.g. "Pull SCADA every 5 min", "Morning batch at 7:00". |
| **Notification** | Push or in-app alerts when SCADA alarm fires; optional email/SMS. |

**Suggested stack (flexible):**  
- API: Node.js (Express/Fastify) or Python (FastAPI) — good for many integrations.  
- DB: PostgreSQL (readings cache, audit log, user/session, mapping tables).  
- Queue (optional): Redis or Bull for scheduled pull and alert jobs.  
- Hosting: Depends on plant network (often on-prem VM or container).

### 2.3 Frontend (Operator Experience)

| Screen | Purpose |
|--------|--------|
| **Login** | Auth; load plant and role; optional "Remember this device". |
| **Home** | Show last SCADA pull; "Approve & Sync All" to WIMS + E-Log; "Edit values" if needed. |
| **Success (sync)** | Confirm data sent to WIMS + E-Logs; timestamp + operator. |
| **Alert list** | List of active SCADA alerts (e.g. Pump 3 high vibration). |
| **Alert detail** | Live SCADA snippet, threshold, optional history/suggestion; actions: "Auto-Create Work Order" or "Log Only". |
| **Work order (pre-filled)** | Form with locked fields from SCADA + suggestion; assignee, due date, parts; "Create & Send". |
| **WO confirmation** | WO number; synced to CMMS + E-Log + tech notified. |

**Suggested stack:**  
- React or Next.js (or Vue/Svelte) for a responsive, tablet-friendly SPA.  
- Optional PWA for "tap notification → open app" on tablets.

### 2.4 Data You Store (Your DB)

| Data | Use |
|------|-----|
| **Users, roles, plant** | Auth and "logged by", plant-specific config. |
| **SCADA → your schema** | Tag/point mapping, units, which readings go to WIMS. |
| **Approved readings** | Cache of what was sent to WIMS/E-Log (audit, replay). |
| **Alerts** | Alert config (thresholds, which tag); history of fired alerts. |
| **Asset mapping** | SCADA asset name ↔ CMMS asset ID (and location, etc.). |
| **Audit log** | Who approved what, when; WO created from which alert. |
| **Optional: historical incidents** | For "similar to Jan 12" (from CMMS or your own records). |

---

## 3. Data and Access You Need

- **SCADA:** Read-only connection (DB user or OPC client) + list of tags/columns and units.  
- **WIMS:** API credentials or DB write permission + field/spec.  
- **E-Log:** API credentials + spec for creating entries.  
- **CMMS:** API credentials + work order create API + asset list or mapping.  
- **Plant:** Asset list (name, id, location) and, if possible, past WO/incident data for "similar incident".

---

## 4. Phased Build Plan

### Phase 1 — Proof of concept (single plant, one path)

- **Goal:** One-way flow: SCADA → your app → WIMS (and optionally E-Log) for morning-type readings.
- **Build:**  
  - Backend API + SCADA connector (poll) + normalization.  
  - WIMS connector (submit one batch of readings).  
  - Simple UI: login, "latest readings", "Approve & Sync" → WIMS.  
- **Success:** Operator can approve one screen of readings and have them show up in WIMS with no manual typing.

### Phase 2 — Alerts and CMMS

- **Goal:** SCADA threshold → alert in your app → operator can create CMMS work order from pre-filled form.
- **Build:**  
  - Alert rules (e.g. vibration &gt; X); scheduler + notification.  
  - CMMS connector (create WO); asset mapping.  
  - UI: alert list, alert detail, pre-filled WO form, confirmation.  
  - E-Log: log "readings approved" and "WO created".
- **Success:** One real alarm (or simulated) creates an alert; operator creates a real WO in CMMS with one tap.

### Phase 3 — Intelligence and polish

- **Goal:** Historical context ("similar to Jan 12"), suggested assignee/parts, and production hardening.
- **Build:**  
  - Historical incident lookup (from CMMS or your DB); suggest fix/parts.  
  - Suggest assignee (e.g. by availability or past job).  
  - Validation warnings (e.g. "chlorine unusually high").  
  - Audit, retention, role-based permissions, and deployment for plant network.
- **Success:** Operators and supervisors trust the app for daily use and compliance.

---

## 5. What You Have vs What You Need — Checklist

| Item | Status |
|------|--------|
| User flow and value prop | ✅ (from your doc) |
| Screen-level UX (login, home, alert, WO, confirm) | ✅ |
| List of systems (SCADA, WIMS, E-Log, CMMS) | ✅ |
| **Exact SCADA access and schema** | ❌ Need |
| **Exact WIMS submission method and format** | ❌ Need |
| **E-Log API or equivalent** | ❌ Need |
| **CMMS API and asset mapping** | ❌ Need |
| **Pilot plant and roles** | ❌ Need |
| **Deployment environment (network, hosting)** | ❌ Need |
| Backend + connectors + UI (to be built) | ❌ Build after above |

---

## 6. One-Page "Ask" for Andrew Gilbert (or IT/Operations)

You can send something like this to get the missing pieces:

---

**Subject: What we need to build the integration platform**

We’re building the middleware that connects SCADA, WIMS, Electronic Logs, and CMMS so operators don’t have to re-enter data. To build the first version we need:

1. **SCADA**  
   - How we can read current readings and alarms (e.g. SQL read-only, OPC, or API).  
   - A list of the points we need: flow, chlorine, pH, turbidity, pump RPM/vibration, tank level, and any alarm events.

2. **WIMS**  
   - How compliance data is submitted today (screens or API).  
   - The exact fields and format we must send (plant, date, flow, chlorine, etc.) so we can submit automatically after operator approval.

3. **Electronic Logging**  
   - Whether there’s an API to create log entries. If not, how we could add a small integration (e.g. API or approved DB write).

4. **CMMS**  
   - How to create a work order via API or equivalent.  
   - A way to map our asset names (e.g. "Pump 3") to your asset IDs and to pull basic work history if possible (for “similar past incident”).

5. **Pilot**  
   - One plant and one shift to test with.  
   - Who (role) can approve data sync and create work orders.

Once we have these, we can build a first version that does “approve morning readings → auto-sync to WIMS and E-Log” and “alert from SCADA → one-tap create CMMS work order.”

---

**Bottom line:** You have a clear user flow and value proposition. To build it, you need **concrete integration details** (APIs or DB access + schemas) for all four systems and a **pilot scope**. The rest is standard backend + connectors + tablet-friendly UI, built in phases as above.
