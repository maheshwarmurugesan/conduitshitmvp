# Prompt to Give Another AI When You Need Technical Details

When we need very specific technical information (e.g. exact API calls, connection strings, code samples), you can paste the text below to another AI. **Replace the [BRACKETED] part** with the specific topic.

---

## Copy-paste prompt

```
I'm building a water plant integration app (Python FastAPI backend). We need to integrate with external systems. I need you to give me concrete, copy-paste-ready technical details for the following topic. Be specific: exact endpoints, request/response examples, and if possible minimal code in Python.

Topic: [PASTE THE TOPIC HERE]

Examples of topics you might use:
- "Fiix CMMS REST API: create a work order (endpoint, auth, request body, response). Use Python requests."
- "Ignition SCADA: connect via OPC UA from Python, read tags (e.g. flow, chlorine, pump status). Minimal code with opcua or asyncua library."
- "Hach WIMS or Aquatic Informatics: how to submit compliance readings via API (endpoint, auth, payload format) if available."
- "Cityworks CMMS API: create work order (endpoint, auth, payload)."
- "SQL Server read-only connection from Python (SQLAlchemy or pyodbc) to read SCADA historian tables."

Requirements:
- Prefer Python 3.10+ and standard libraries or well-known packages.
- Include how to handle API key / auth (e.g. Bearer token, header name).
- If the vendor has official docs, say so and follow their format.
- If something is not publicly documented, say "not publicly documented" and give best-effort approach (e.g. REST conventions).
```

---

## How to use it

1. Open this file.
2. Copy the whole prompt (from "I'm building" to the end).
3. Replace `[PASTE THE TOPIC HERE]` with one specific topic (e.g. "Fiix CMMS REST API: create a work order...").
4. Paste into ChatGPT, Claude, or another AI.
5. Take the answer (code, endpoints, examples) and share it or paste it where we’re building that feature so we can plug it in.

You can use the same prompt many times with different topics (Fiix, Ignition, WIMS, etc.).
