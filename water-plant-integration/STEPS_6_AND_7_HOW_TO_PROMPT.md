# Steps 6–7: What I Need + How to Prompt Me

## What I need to build it out

| Need | Who provides it | When |
|------|------------------|------|
| **Your choice** | You | Now: Option A (keep mocks) or Option B (connect one real system, e.g. Fiix/Maintenance Connection). |
| **SCADA details** | Aaron or vendor | When you have them: OPC UA endpoint URL + list of tags (flow, chlorine, pH, pumps, etc.). Until then we keep mock SCADA. |
| **CMMS details** | Aaron or vendor | When you have them: Maintenance Connection (or Fiix) API endpoint, auth, and “create work order” payload. Until then we keep stub. |
| **WIMS / compliance** | Aaron or vendor | When you have them: CSV column names and format for upload. Until then we use a generic CSV. |
| **One prompt per component** | You | You run **Step 6** (tech flow) then **Step 7** (prompt that includes that flow). See below. |

So: **I don’t need anything else from you right now except:**  
(1) you pick Option A or B, and  
(2) you follow Step 6 → Step 7 **per component** and paste me the prompt (or use the examples below).

---

## Step 6: Plan API / tech flow (what you do)

For **each** component you want to build, write a short **tech flow** (1 short paragraph or bullet list). It should say:

- **Input:** Where does the data come from? (e.g. “OPC UA server at url X”, “operator approves in UI”)
- **Process:** What does the backend do? (e.g. “connect to OPC UA, read tags, normalize to ScadaReading, store in DB”)
- **Output:** What’s the result? (e.g. “POST /api/scada/poll returns count; readings in DB”)

You don’t have to be technical. Something like: “When we call SCADA poll, we connect to their server, read the list of tags we agreed on, turn them into our standard format, and save them. The API returns how many we saved.” That’s enough.

Do this **once per component**, e.g.:

1. Real SCADA (OPC UA)
2. Real CMMS (Maintenance Connection or Fiix)
3. Compliance CSV (WIMS format)
4. (Optional) Roles from real login (e.g. Plant SSO)

---

## Step 7: Generate the vibe-code prompt (what you send me)

Turn **each** tech flow into **one prompt** you can paste to me (or another AI). The prompt should:

1. **Say what to build** (one component).
2. **Include the tech flow** (from Step 6).
3. **Say where to build it** (“in this repo”, “backend/connectors/…”, “use existing FastAPI app”).
4. **Say what “done” looks like** (e.g. “when I call POST /api/scada/poll with a real endpoint, I get readings in the DB”).

Then you **paste that prompt** and we vibe-code until that component is done. One component at a time.

---

## Exact prompts you can use (copy-paste for Steps 6–7)

Use these as-is, or replace the [BRACKETED] parts with your details once you have them.

---

### Prompt 1: Real SCADA (OPC UA) – use when you have endpoint + tags

```
Step 6 tech flow:
- Input: OPC UA endpoint URL and list of tag names (strings).
- Process: Connect with Python OPC UA client (e.g. asyncua). Read each tag; get value, timestamp, quality. Normalize to our ScadaReading schema (timestamp, tag_name, value, unit, quality, alarm_state). Store in ScadaReading table and in Reading table for dashboard. Support polling (no subscription yet).
- Output: POST /api/scada/poll can accept optional endpoint and tag list (or use env/config). Returns count of readings stored.

Step 7 – build it:
Implement the real OPC UA SCADA connector in this repo. Use backend/connectors/scada.py. Keep the same interface: test_connection(), fetch_data(plant_id=..., endpoint_url=..., tag_list=...), normalize(). Use asyncua or opcua library. Read from config or env: OPC_UA_ENDPOINT, OPC_UA_TAG_LIST (comma-separated). If not set, keep current mock behavior. Add any new dependencies to requirements.txt. When I call POST /api/scada/poll with the env set, I should get real readings in the DB.
```

---

### Prompt 2: Real CMMS (Maintenance Connection or Fiix) – use when you have API details

```
Step 6 tech flow:
- Input: Alert from our DB (asset_name, description, priority). Optional: assignee_id, asset_id from mapping table.
- Process: Build work order payload (asset_id, asset_name, description, priority, source_alarm_id, created_by_system). Call CMMS REST API to create work order. Retry on 5xx or network error (e.g. 2 retries, exponential backoff). Log failure in our DB if still failing. Store external_wo_id in work_order_records.
- Output: POST /api/work-orders/create (existing) actually creates a work order in the CMMS and returns the real WO number.

Step 7 – build it:
Implement the real CMMS connector in backend/connectors/cmms.py for [Maintenance Connection OR Fiix]. Use the existing create_work_order() signature. Add config/env: CMMS_BASE_URL, CMMS_API_KEY (or auth as per vendor). Implement retry (2 retries, exponential backoff) and on failure log to a table or log entry. When I call POST /api/work-orders/create with a valid alert_id, a real work order should appear in the CMMS and the response should include the real work order ID.
```

---

### Prompt 3: Compliance CSV (WIMS schema) – use when you have column format

```
Step 6 tech flow:
- Input: Latest approved readings from our DB (source=scada). Optional: plant_id, date range. Operator has already approved; only Supervisor can export (already enforced).
- Process: Build rows from readings. Map our tag names to WIMS column names using a config (dict or file). Generate CSV with header row and one row per reading (or per row format WIMS expects). Audit log already written on export.
- Output: POST /api/compliance/export returns CSV file with columns matching WIMS. Filename or header configurable.

Step 7 – build it:
Make compliance export configurable in this repo. Backend: add a config (e.g. COMPLIANCE_CSV_COLUMNS or a small JSON file) that maps our tag names to CSV column names and order. POST /api/compliance/export should use this config to build the CSV. If no config, keep current behavior (tag, value, unit, timestamp). When I have the config set, the exported CSV should match the WIMS upload format.
```

---

### Prompt 4: (Optional) Supervisor-only approval for morning review

```
Step 6 tech flow:
- Input: Operator requests “Approve & Sync” for morning data. We already have X-Role (or will get from auth).
- Process: If role is not Supervisor or Admin, return 403. Otherwise proceed: sync to WIMS stub, write e-log, return success.
- Output: POST /api/morning-review/approve requires Supervisor or Admin (same as compliance/export). Operators get 403.

Step 7 – build it:
In this repo, enforce Supervisor/Admin for morning review approval. Reuse the same role check as POST /api/compliance/export (header X-Role: Supervisor or Admin). Apply it to POST /api/morning-review/approve. If role is Operator, return 403 with a clear message. No other behavior change.
```

---

## What you do next (checklist)

1. **Choose** Option A (keep mocks) or Option B (connect one system). Tell me.
2. **Pick one component** to do first (e.g. “real SCADA” or “real CMMS”).
3. **Step 6:** Copy the tech flow from the prompt above for that component (or write your own 3–5 lines).
4. **Step 7:** Copy the full prompt for that component and paste it to me (or another AI). We build that one piece.
5. **Test** that component (e.g. call the API, check DB or CMMS).
6. Repeat for the next component.

You don’t have to write the tech flow yourself if you use the prompts above; they already include Step 6. So **to follow steps 6–7 you literally:** pick a prompt → paste it here → we build → you test → next prompt.

---

## What I need from you right now (one sentence)

**I need you to choose Option A or B and then paste me one of the prompts above (or a variant) for the component you want to build first.** After that I’ll follow the tech flow in the prompt and implement it in the repo.
