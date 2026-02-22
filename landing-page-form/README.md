# Landing Page Form → Google Sheets CRM → Partiful

One-page form that saves submissions to a Google Sheet (CRM) and optionally runs Partiful automation (add phone to event via Playwright).

## What’s included

- **Landing page** (`/`) – form with: First name, Last name, LinkedIn, Email, Phone, Intro, Are you building?, What are you building?
- **Submit API** – validates, appends to your Google Sheet, and (if credentials are set) triggers Partiful automation to add the contact’s phone to your event.
- **Partiful automation** – Playwright-based flow (login → event → Invite → add phone). Non-blocking: form success does not depend on Partiful; failures are logged.
- **Admin** (`/admin`) – Link to open your Partiful event.

## Setup

1. **Google Sheet**
   - First sheet (e.g. “Sheet1”) must have row 1:  
     `First Name | Last Name | LinkedIn | Email | Phone | Intro | Building | What Building | Submitted At`
   - Sheet is shared with the service account email (Editor).

2. **Env**
   - Copy `.env.example` to `.env` and fill in Google Sheets (and optionally Partiful) credentials.
   - Do not commit `.env` (it’s in `.gitignore`).
   - **Partiful automation (optional):** Set `PARTIFUL_EMAIL`, `PARTIFUL_PASSWORD`, and `PARTIFUL_EVENT_ID` to run the Playwright automation that adds each submitter’s phone to your event. If any are missing, submission still saves to Sheets and only skips Partiful.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the form and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin / Partiful event link.

## Partiful (text blast)

**Automation (optional):** If `PARTIFUL_EMAIL`, `PARTIFUL_PASSWORD`, and `PARTIFUL_EVENT_ID` are set, each form submission triggers a Playwright flow that logs into Partiful and adds the submitter’s phone to your event. This runs in the background; if it fails (e.g. Partiful uses SMS login or UI changed), the form still succeeds and the error is logged.

**Manual fallback:** The app always saves to the Google Sheet. Open your Partiful event from `/admin` to manage invites.

## Security

- See **SECURITY_AUDIT.md** for the audit and mitigations (rate limiting, input limits, logging).
- **Rate limiting:** Submit (and add-to-partiful) are rate-limited per IP (in-memory; for multi-instance deploy consider Vercel KV or similar).

## Deploy (e.g. Vercel)

1. Push the repo (without `.env`).
2. In the host’s dashboard, add env vars:  
   `GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`, `GOOGLE_SHEETS_SPREADSHEET_ID`, `NEXT_PUBLIC_PARTIFUL_EVENT_ID` (optional; admin event link). For Partiful automation (if supported by the host): `PARTIFUL_EMAIL`, `PARTIFUL_PASSWORD`, `PARTIFUL_EVENT_ID`.
3. Deploy.
