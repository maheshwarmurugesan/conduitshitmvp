# Google Sheets API Setup Guide

## Step-by-Step Instructions

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it (e.g., "Landing Page Form")
4. Click "Create"

### 2. Enable Google Sheets API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

### 3. Create Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in:
   - **Service account name**: `landing-page-form`
   - **Service account ID**: (auto-generated)
   - **Description**: "For landing page form submissions"
4. Click "Create and Continue"
5. Skip "Grant access" (click "Continue")
6. Click "Done"

### 4. Create and Download Key

1. Click on your new service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON"
5. Click "Create" (downloads automatically)
6. **Save this file securely** - you'll need it!

### 5. Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it (e.g., "Landing Page Submissions")
4. Create headers in Row 1:
   ```
   First Name | Last Name | LinkedIn | Email | Phone | Intro | Building | What Building | Submitted At
   ```
5. **Copy the Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[THIS_IS_THE_ID]/edit
   ```

### 6. Share Sheet with Service Account

1. In your Google Sheet, click "Share" button
2. Paste your **service account email** (found in the JSON file as `client_email`)
   - Format: `landing-page-form@your-project.iam.gserviceaccount.com`
3. Give it "Editor" permissions
4. Click "Send" (you can uncheck "Notify people")

### 7. Extract Credentials for .env

Open your downloaded JSON file. You'll need:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "landing-page-form@your-project.iam.gserviceaccount.com",
  ...
}
```

For your `.env` file:

```bash
GOOGLE_SHEETS_CLIENT_EMAIL=landing-page-form@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id-from-url
```

**Important**: 
- Keep the `\n` characters in the private key
- Wrap the private key in quotes
- Never commit this file to git!

---

## Testing Your Setup

Once you have the code, test with this simple script:

```typescript
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function test() {
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: 'Submissions!A:I',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        'Test',
        'User',
        'https://linkedin.com/in/test',
        'test@example.com',
        '+1234567890',
        'Test intro',
        'Yes',
        'Test project',
        new Date().toISOString()
      ]],
    },
  });
  console.log('Success!', response.data);
}

test();
```

---

## Troubleshooting

### "The caller does not have permission"
- Make sure you shared the sheet with the service account email
- Check that the email matches exactly (copy-paste it)

### "Invalid credentials"
- Check that your private key has `\n` characters preserved
- Make sure the private key is wrapped in quotes in .env

### "Spreadsheet not found"
- Verify the spreadsheet ID is correct
- Make sure the sheet is shared with the service account

---

## Security Best Practices

1. ✅ Never commit `.env` file to git
2. ✅ Add `.env` to `.gitignore`
3. ✅ Use environment variables in production (Vercel, etc.)
4. ✅ Rotate keys if compromised
5. ✅ Limit service account permissions (only Editor on one sheet)
