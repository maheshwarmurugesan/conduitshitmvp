# Water Plant Integration Platform

Middleware that connects **SCADA, WIMS, CMMS, and E-Logs** so operators get one dashboard, one-tap approve & sync, and auto work orders from alerts. Matches the [Mermaid user flow](MVP_AND_WHAT_I_NEED.md) from shift start → morning review → monitoring → alerts → work order / log-only → shift handoff.

## What’s in this repo

- **Backend** (Python, FastAPI): E-Log API, dashboard (systems status + latest readings), ingestion (pull SCADA → normalize → store), pipeline (threshold alerts), morning-review approve & sync, alerts CRUD, work order creation (CMMS stub), shift summary & sign-off.
- **Frontend** (Next.js): Dashboard (pull latest, Approve & Sync), Alerts list & detail (Create WO / Log only / Dismiss), E-Log, Shift handoff.
- **Docs**: `MVP_AND_WHAT_I_NEED.md` (is MVP possible, what you need, steps 6–9), `BUILD_SPEC_WHAT_YOU_NEED.md` (phases, what to ask Aaron).

## Demo in 3 steps

1. **Terminal 1 — backend:** `cd backend` → `pip install -r ../requirements.txt` → `uvicorn main:app --reload --port 8000`. Leave it running.
2. **Terminal 2 — frontend:** `cd frontend` → `npm install` → `npm run dev`. Leave it running.
3. **Browser:** Open **http://localhost:3000**. If you see a white screen or “Loading…” forever, the backend isn’t running — start step 1 first, then refresh.

DB is SQLite (`backend/elog.db`). Next.js rewrites `/api/*` to `http://localhost:8000`.

---

## Run locally (same thing, longer)

### Backend

```bash
cd backend
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Quick test

1. **Dashboard**: Click “Pull latest from SCADA” → then “Approve & Sync All”.
2. **Alerts**: After ingest, if pump3_vibration &gt; 0.8 an alert appears; open it → “Create Work Order” or “Log only”.
3. **E-Log**: View entries from approvals and WO/log-only.
4. **Shift**: View summary and “Sign off”.

## MVP scope vs Mermaid

| Mermaid block           | Status in this scaffold                          |
|------------------------|---------------------------------------------------|
| Shift start & auth     | Stub (operator_id in body); no real SSO           |
| Integration dashboard  | ✅ Systems status + latest readings + Approve     |
| Data sources           | SCADA mock; LIMS/WIMS/CMMS stubs                  |
| Processing pipeline   | ✅ Normalize (tag map) + threshold alerts        |
| Morning data review   | ✅ Approve → WIMS stub + E-Log                   |
| Alerts & WO / Log only | ✅ List, detail, create WO, log-only, dismiss    |
| Shift handoff          | ✅ Summary counts + sign-off → E-Log             |
| Inspect pipeline       | Not built (click into norm/correlation/ai)        |
| Trends / Reports       | Not built (table/chart + export)                 |

## Next steps (your steps 6–9)

1. **Step 6**: For each component (e.g. real SCADA connector, real Fiix WO), write a short **tech flow** (inputs → backend → API → UI).
2. **Step 7**: Turn each into a **vibe-code prompt** (tech flow + stack + “implement in this repo”).
3. **Step 8**: Implement one component at a time; test.
4. **Step 9**: Security pass (auth, validation, audit) and “common attack vectors” per feature.

See **MVP_AND_WHAT_I_NEED.md** for what we need from you (Fiix API key, SCADA tag list, etc.) and what to ask Aaron.
