# Security Audit Report

**Note:** The CSV export endpoint (`/api/export-partiful`) and admin CSV download have been removed. This audit document is kept for historical reference; export-related mitigations (EXPORT_SECRET, CSV escaping) no longer apply.

## 1. ANALYSIS PHASE

### Critical areas reviewed

| Area | Files | Findings |
|------|--------|----------|
| API endpoints | `app/api/submit/route.ts`, `app/api/export-partiful/route.ts` | Export unauthenticated; no rate limiting |
| Data handling | `lib/validation.ts`, `lib/google-sheets.ts` | No max lengths; CSV formula injection possible |
| Environment variables | All | `.env*` gitignored; only `NEXT_PUBLIC_*` exposed to client |
| Auth | N/A | No auth; export exposes all CRM data to anyone |

### Documented issues (priority)

1. **HIGH – Export endpoint unauthenticated**  
   - **Where:** `app/api/export-partiful/route.ts` (GET).  
   - **Risk:** Anyone who knows or guesses `/api/export-partiful` can download all names, emails, and phone numbers.  
   - **Evidence:** No check for auth or secret; GET returns full CSV.

2. **MEDIUM – No rate limiting**  
   - **Where:** `app/api/submit/route.ts`, `app/api/export-partiful/route.ts`.  
   - **Risk:** Submit can be spammed (DoS, quota abuse, spam data). Export can be scraped repeatedly.  
   - **Evidence:** No rate-limit logic.

3. **MEDIUM – Input validation missing max lengths**  
   - **Where:** `lib/validation.ts`.  
   - **Risk:** Very large payloads (e.g. multi‑MB `intro` or `whatBuilding`) can cause high memory/CPU and bloat the sheet.  
   - **Evidence:** Only `.min()` used; no `.max()` on strings.

4. **LOW – CSV formula injection**  
   - **Where:** `app/api/export-partiful/route.ts` (CSV row building).  
   - **Risk:** If sheet data starts with `=`, `+`, `-`, `@`, Excel/Sheets can execute formulas (data exfil or corruption).  
   - **Evidence:** Values written as-is; no escaping of leading formula characters.

5. **LOW – Error logging**  
   - **Where:** `app/api/submit/route.ts` – `console.error("Submit error:", err)`.  
   - **Risk:** Stack traces or error messages in logs may contain internal details; avoid logging request body (PII).  
   - **Evidence:** Generic response to client is correct; logging could be tightened.

---

## 2. PLANNING PHASE

### 1) Export endpoint (HIGH)

- **Remediation:** If `EXPORT_SECRET` is set in env, require header `x-export-secret` to match; otherwise return 401. Admin page: optional “Export secret” input; when user clicks Download, send that value in `x-export-secret`.
- **Implications:** Export is only available to clients that know the secret (e.g. admin). No secret in client bundle; user types or stores secret locally.

### 2) Rate limiting (MEDIUM)

- **Remediation:** In-memory per-IP rate limit for submit (e.g. 10/min) and export (e.g. 5/min). Document that serverless (e.g. Vercel) may need a shared store (e.g. Vercel KV / Upstash) for production.
- **Implications:** Reduces abuse and scraping; single-instance only unless external store is used.

### 3) Max lengths (MEDIUM)

- **Remediation:** Add `.max()` to all string fields in `lib/validation.ts` (e.g. firstName 100, intro 500, whatBuilding 500).
- **Implications:** Bounded payload size; reduces DoS and sheet bloat.

### 4) CSV formula injection (LOW)

- **Remediation:** When building CSV cells, if a value starts with `=`, `+`, `-`, `@`, `\t`, `\r`, prefix with single quote or escape so the cell is treated as text.
- **Implications:** Prevents formula execution when the CSV is opened in Excel/Sheets.

### 5) Error logging (LOW)

- **Remediation:** Do not log request body; log only error type/message (no PII). Keep client response generic.
- **Implications:** Fewer sensitive details in logs.

---

## 3. IMPLEMENTATION

(See code changes in this repo; summary below.)

- Export: optional `EXPORT_SECRET`; API checks `x-export-secret`; admin page has optional secret input.
- Validation: max lengths added to all relevant strings in `lib/validation.ts`.
- Export: CSV cells escaped for formula characters.
- Rate limiting: in-memory per-IP for submit and export (with README note for serverless).
- Submit route: error logging adjusted to avoid logging request body.

---

## 4. ADDITIONAL RECOMMENDATIONS

- **Admin path:** Consider moving `/admin` to an unguessable path or protecting it with a proper login (e.g. NextAuth) if the export secret is shared.
- **HTTPS:** Ensure the site is only served over HTTPS in production.
- **CSP:** Consider a Content-Security-Policy header to reduce XSS impact.
- **Vercel:** Use environment variables in dashboard; never commit `.env` or secrets.
- **Rate limiting in production:** For Vercel/serverless, add rate limiting via Vercel KV, Upstash Redis, or a middleware that checks a shared store.
