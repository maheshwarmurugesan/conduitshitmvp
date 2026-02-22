# Set Up Google Sheets (Square 0)

Use this if the form keeps failing. Start with a **brand new** sheet.

---

## 1. Create a new Google Sheet

1. Go to [sheets.new](https://sheets.new)
2. Keep the default first tab named **Sheet1** (don’t rename it)
3. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/XXXXXXXXXX/edit
                                      ^^^^^^^^^^
                                      This part
   ```

---

## 2. Share the sheet with the service account

1. In the sheet, click **Share**
2. Add: `landing-page-form@landing-page-form-488119.iam.gserviceaccount.com`
3. Set permission to **Editor**
4. Uncheck “Notify people”
5. Click **Share**

---

## 3. Get the private key (if you need it again)

1. [Google Cloud Console](https://console.cloud.google.com/) → Your project
2. **APIs & Services** → **Credentials**
3. Open your service account (or create one)
4. **Keys** tab → **Add Key** → **Create new key** → **JSON**
5. Open the downloaded JSON file
6. Find `"private_key"` – copy the **entire value** including the quotes, e.g.:
   ```
   "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANB...\n...\n-----END PRIVATE KEY-----\n"
   ```
7. In Vercel, paste it **exactly as-is** (one line, with `\n` in it)

---

## 4. Set Vercel environment variables

In Vercel → Your project → **Settings** → **Environment Variables**:

| Name | Value | Notes |
|------|-------|-------|
| `GOOGLE_SHEETS_CLIENT_EMAIL` | `landing-page-form@landing-page-form-488119.iam.gserviceaccount.com` | From the JSON file |
| `GOOGLE_SHEETS_PRIVATE_KEY` | The full key from JSON (one line, with `\n`) | Paste the `private_key` value |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | The ID from step 1 | No spaces, no URL, just the ID |

Enable for **Production** (and Preview if you use it).

---

## 5. Redeploy

Vercel → **Deployments** → ⋮ on latest → **Redeploy**

Env vars are only applied on new deploys.

---

## 6. Test

Visit: **https://your-domain.com/api/test-sheets**

- If you see `"ok": true` → it worked. Submit the form.
- If you see an error → the response will show the exact cause and hints.
