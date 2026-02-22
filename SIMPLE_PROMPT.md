# Copy This Prompt to Cursor

---

Create a landing page with a contact form.

**Form Fields:**
- First Name (required)
- Last Name (required)
- LinkedIn URL (required)
- Email (required)
- Phone Number (required)
- Intro (textarea, 1-2 sentences, required)
- "Are you building?" (radio: Yes/No, required)
- "What are you building?" (textarea, only shows if "Yes" selected)

**When Form is Submitted:**
1. Validate with Zod
2. Save to Google Sheets using googleapis package
3. Append row to sheet "Submissions" (or first sheet if no name specified)
4. Show success message: "Thanks! We'll be in touch soon."

**Tech Stack:**
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS (dark theme, modern design)
- Zod for validation
- googleapis npm package for Google Sheets

**Environment Variables:**
```
GOOGLE_SHEETS_CLIENT_EMAIL=[YOUR_SERVICE_ACCOUNT_EMAIL]
GOOGLE_SHEETS_PRIVATE_KEY="[YOUR_PRIVATE_KEY]"
GOOGLE_SHEETS_SPREADSHEET_ID=[YOUR_SPREADSHEET_ID]
```

**Design:**
- Dark theme (like mahesh-college-counseling project)
- Centered form, max-width 600px
- Mobile responsive
- Loading state during submission
- Error messages if validation fails

**Reference:**
Use the form pattern from `mahesh-college-counseling/src/app/apply/page.tsx`

**API Routes:**
1. Create `/app/api/submit/route.ts` that:
   - Validates with Zod schema
   - Connects to Google Sheets API using credentials
   - Appends row with: First Name, Last Name, LinkedIn, Email, Phone, Intro, Building (Yes/No), What Building (or empty), Submitted At (ISO timestamp)
   - Returns success/error response

2. Create `/app/api/export-partiful/route.ts` that:
   - Reads all submissions from Google Sheets
   - Formats as CSV: Name, Email, Phone
   - Returns CSV file for download

**Admin Export Page (Optional but Recommended):**
Create `/app/admin/page.tsx`:
- Simple page with "Export for Partiful" button
- Button calls `/api/export-partiful`
- Downloads CSV file formatted for Partiful bulk import
- This makes it easy to add contacts to Partiful (takes 30 seconds)

**Google Sheets Setup:**
- Use googleapis package
- Authenticate with service account credentials
- Append to range: "Submissions!A:I" (or first sheet if no name)
- Handle errors gracefully

**Note on Partiful Automation:**
Partiful doesn't have an official API. Options:
- ✅ Manual: Export CSV → Upload to Partiful (30 seconds, 100% reliable)
- ⚠️ Automation: Web automation possible but can break (see PARTIFUL_AUTOMATION_OPTIONS.md)

---

**Replace the environment variables above with your actual Google Sheets credentials!**

**Important:** The private key must include `\n` characters and be wrapped in quotes in your .env file.
