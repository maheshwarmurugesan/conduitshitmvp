# 🚀 Simple Instructions: Landing Page Form (Google Sheets)

## What You're Building

A form that saves people's info directly to Google Sheets. Later, you can export from Sheets to Partiful.

---

## Step 1: Create Google Sheet (2 min)

1. Go to [sheets.google.com](https://sheets.google.com)
2. Create new spreadsheet
3. Name it: `Landing Page Submissions`
4. In Row 1, add these headers:
   ```
   First Name | Last Name | LinkedIn | Email | Phone | Intro | Building | What Building | Submitted At
   ```
5. Copy the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[THIS_IS_THE_ID]/edit
   ```

---

## Step 2: Set Up Google Cloud (10 min)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Name: `landing-page-form`
4. Click "Create"

### Enable Google Sheets API:
5. Click "APIs & Services" → "Library"
6. Search "Google Sheets API"
7. Click it → Click "Enable"

### Create Service Account:
8. Click "APIs & Services" → "Credentials"
9. Click "Create Credentials" → "Service Account"
10. Name: `landing-page-form`
11. Click "Create and Continue"
12. Click "Done"

### Create Key:
13. Click on your service account
14. Click "Keys" tab → "Add Key" → "Create new key"
15. Choose "JSON"
16. Click "Create" (downloads automatically)
17. **Save this file!** You'll need it.

---

## Step 3: Share Sheet with Service Account (1 min)

1. Open your Google Sheet
2. Click "Share" button
3. Find the email in your downloaded JSON file (look for `"client_email"`)
   - It looks like: `landing-page-form@project.iam.gserviceaccount.com`
4. Paste that email in the Share box
5. Give it "Editor" permission
6. Click "Send" (uncheck "Notify people")

---

## Step 4: Get Credentials (2 min)

Open your downloaded JSON file. You need 3 things:

1. **client_email**: `landing-page-form@project.iam.gserviceaccount.com`
2. **private_key**: The long key that starts with `-----BEGIN PRIVATE KEY-----`
3. **Spreadsheet ID**: From your sheet URL (Step 1)

---

## Step 5: Copy Prompt to Cursor (1 min)

1. Open `SIMPLE_PROMPT.md`
2. Replace these:
   - `[YOUR_SPREADSHEET_ID]` → Your spreadsheet ID
   - `[YOUR_SERVICE_ACCOUNT_EMAIL]` → Your client_email
   - `[YOUR_PRIVATE_KEY]` → Your private_key (keep the \n characters!)
   - `[YOUR_EMAIL]` → Your email
3. Copy the whole thing

---

## Step 6: Build in Cursor (30 min)

1. Open Cursor
2. Create new folder: `landing-page-form`
3. Paste your filled prompt
4. Let Cursor build it
5. Test it!

---

## Step 7: Export to Partiful (when you need it)

1. Open your Google Sheet
2. File → Download → CSV
3. Upload CSV to Partiful

---

## That's It! 🎉

Your form will:
- ✅ Save to Google Sheets automatically
- ✅ You can view data in Sheets anytime
- ✅ Export CSV when needed (30 seconds)

---

## Quick Checklist

- [ ] Google Sheet created with headers
- [ ] Google Cloud project created
- [ ] Google Sheets API enabled
- [ ] Service account created
- [ ] JSON key downloaded
- [ ] Sheet shared with service account email
- [ ] Credentials copied
- [ ] Prompt filled out
- [ ] Built in Cursor
- [ ] Tested form submission

---

## Environment Variables You'll Need

```bash
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
```

**Important:** Keep the `\n` characters in the private key and wrap it in quotes!
