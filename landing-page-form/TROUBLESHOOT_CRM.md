# Fix Form → Google Sheets (CRM) Connection

Follow these steps in order. Stop when something fails and fix that step.

---

## Step 1: Verify env vars are loaded on Vercel

1. Open: **https://maheshwarmurugesan.com/api/check-env**
2. You should see: `hasClientEmail: true`, `hasPrivateKey: true`, `hasSpreadsheetId: true`

**If any is `false`:** Go to Vercel → your project → Settings → Environment Variables. Add or fix the missing one. Make sure it's enabled for **Production**. Then go to Step 2 and redeploy.

---

## Step 2: Redeploy (required after env changes)

1. Vercel → your project → **Deployments**
2. Click the **⋮** menu on the latest deployment
3. Click **Redeploy**
4. Wait for it to finish

Env vars are applied only when a new deployment runs. Old deployments keep the old env.

---

## Step 3: Share the Google Sheet with the service account

1. Open your Google Sheet
2. Click **Share**
3. Add: `landing-page-form@landing-page-form-488119.iam.gserviceaccount.com`
4. Set permission to **Editor**
5. Click **Send** (uncheck "Notify people" if you want)

If this step is wrong, the API will fail with a permission error.

---

## Step 4: Check the Spreadsheet ID

1. Open your Google Sheet in the browser
2. Look at the URL: `https://docs.google.com/spreadsheets/d/XXXXXXXX/edit`
3. The part between `/d/` and `/edit` is your Spreadsheet ID
4. In Vercel → Environment Variables → `GOOGLE_SHEETS_SPREADSHEET_ID` must match exactly (no spaces, no extra characters)

---

## Step 5: Check the sheet tab name

The app writes to a sheet tab named **Sheet1** (the default). If you renamed it:

- Either rename it back to **Sheet1**, or
- Add a row 1 with headers: First Name, Last Name, LinkedIn, Email, Phone, Intro, Building, What Building, Timestamp

---

## Step 6: Fix the private key (if Step 1 shows hasPrivateKey: true but form still fails)

The private key must have newlines. In Vercel:

1. Go to Environment Variables
2. Edit `GOOGLE_SHEETS_PRIVATE_KEY`
3. Replace the value with the full key as a **single line**, using `\n` for each line break, for example:

   ```
   -----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...(rest of key)...\n-----END PRIVATE KEY-----
   ```

4. Save and redeploy (Step 2)

---

## Quick checklist

| Step | Action |
|------|--------|
| 1 | Visit /api/check-env — all three `true`? |
| 2 | Redeploy after any env var change |
| 3 | Sheet shared with service account as Editor |
| 4 | Spreadsheet ID in URL matches env var |
| 5 | Sheet tab is named "Sheet1" |
| 6 | Private key has `\n` for line breaks |

---

## See the actual error

1. Vercel → your project → **Logs**
2. Submit the form on maheshwarmurugesan.com
3. In Logs, find the error for the `/api/submit` request

The log will show the real error (e.g. "Missing credentials", "403", "The caller does not have permission").
