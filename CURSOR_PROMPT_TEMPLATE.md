# 🎯 Ready-to-Use Cursor Prompt

Copy and paste this into Cursor, filling in the bracketed sections:

---

## Main Prompt

```
Create a landing page with a contact form for collecting startup founder information.

### Form Fields:
- First Name (text input, required)
- Last Name (text input, required)
- LinkedIn URL (url input, required, validate LinkedIn URL format)
- Email (email input, required)
- Phone Number (tel input, required, format as E.164: +1234567890)
- Intro (textarea, required, placeholder: "1-2 sentence intro about yourself")
- "Are you building?" (radio buttons: Yes/No, required)
- "What are you building?" (textarea, conditional - only visible if "Are you building?" = Yes)

### Form Submission Flow:
1. Client-side validation using Zod schema
2. POST to /api/submit endpoint
3. Server-side validation with Zod
4. Save to Supabase table:
   - Use @supabase/supabase-js
   - Table name: "submissions"
   - Columns: first_name, last_name, linkedin, email, phone, intro, is_building, what_building, created_at
   - Use service_role key for server-side writes
5. Show success message: "Thanks! We'll be in touch soon."
6. Handle errors gracefully with user-friendly messages

### Tech Stack:
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS (modern, clean design)
- Zod for validation
- Supabase (@supabase/supabase-js) for database
- Optional: Resend for email notifications

### Design Requirements:
- Modern landing page with hero section
- Centered form (max-width: 600px)
- Dark theme (similar to mahesh-college-counseling project)
- Mobile-responsive
- Loading spinner during submission
- Form validation with inline error messages
- Success state with clear confirmation

### API Route Structure:
Create `/app/api/submit/route.ts`:
- Validate request body with Zod
- Connect to Google Sheets API
- Handle Partiful integration
- Return appropriate responses
- Log errors for debugging

### Environment Variables:
- NEXT_PUBLIC_SUPABASE_URL=[your Supabase project URL]
- NEXT_PUBLIC_SUPABASE_ANON_KEY=[Supabase anon/public key]
- SUPABASE_SERVICE_ROLE_KEY=[Supabase service_role key - keep secret!]
- ADMIN_EMAIL=[your email for notifications]
- RESEND_API_KEY=[optional, for email notifications]

### Reference:
Use the form pattern from mahesh-college-counseling/src/app/apply/page.tsx as a starting point for styling and structure.

### Error Handling:
- Network errors: "Connection error. Please try again."
- Validation errors: Show specific field errors
- Server errors: "Something went wrong. Please try again later."
- Log all errors to console for debugging

### Additional Features:
- Phone number formatting (auto-format as user types)
- LinkedIn URL validation (must be linkedin.com/in/...)
- Conditional field visibility (What Building only shows if Building = Yes)
- Form reset after successful submission
- Prevent double-submission (disable button during submission)
```

---

## Quick Checklist Before Using This Prompt

- [ ] Google Sheets API credentials ready (service account JSON)
- [ ] Google Sheet created and shared with service account email
- [ ] Spreadsheet ID copied
- [ ] Partiful event created (if using)
- [ ] Partiful event ID/URL ready (if using)
- [ ] Admin email address ready
- [ ] Resend API key (optional, for email notifications)

---

## Filled Example

Here's what it looks like with actual values:

```
Create a landing page with a contact form for collecting startup founder information.

### Form Fields:
- First Name (text input, required)
- Last Name (text input, required)
- LinkedIn URL (url input, required, validate LinkedIn URL format)
- Email (email input, required)
- Phone Number (tel input, required, format as E.164: +1234567890)
- Intro (textarea, required, placeholder: "1-2 sentence intro about yourself")
- "Are you building?" (radio buttons: Yes/No, required)
- "What are you building?" (textarea, conditional - only visible if "Are you building?" = Yes)

### Form Submission Flow:
1. Client-side validation using Zod schema
2. POST to /api/submit endpoint
3. Server-side validation with Zod
4. Save to Google Sheets:
   - Use googleapis npm package
   - Spreadsheet ID: 1a2b3c4d5e6f7g8h9i0j
   - Sheet name: "Submissions"
   - Append row with: First Name, Last Name, LinkedIn, Email, Phone, Intro, Building (Yes/No), What Building (or empty), Submitted At (ISO timestamp)
5. Add to Partiful event: Method A - Export to CSV and email admin with attachment
6. Show success message: "Thanks! We'll be in touch soon."
7. Handle errors gracefully with user-friendly messages

### Tech Stack:
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS (modern, clean design)
- Zod for validation
- googleapis for Google Sheets
- Resend for email notifications

### Design Requirements:
- Modern landing page with hero section
- Centered form (max-width: 600px)
- Dark theme (similar to mahesh-college-counseling project)
- Mobile-responsive
- Loading spinner during submission
- Form validation with inline error messages
- Success state with clear confirmation

### API Route Structure:
Create `/app/api/submit/route.ts`:
- Validate request body with Zod
- Connect to Supabase using service_role key
- Insert into submissions table
- Return appropriate responses
- Log errors for debugging

### Supabase Table Setup:
Create table "submissions" with columns:
- id (uuid, primary key, default gen_random_uuid())
- first_name (text, not null)
- last_name (text, not null)
- linkedin (text, not null)
- email (text, not null)
- phone (text, not null)
- intro (text, not null)
- is_building (boolean, not null)
- what_building (text, nullable)
- created_at (timestamptz, default now())

Enable Row Level Security (RLS):
- Policy: Allow INSERT for anonymous users (for form submissions)
- Policy: Allow SELECT for authenticated users (for admin viewing)

### Environment Variables:
- GOOGLE_SHEETS_CLIENT_EMAIL=my-service-account@project.iam.gserviceaccount.com
- GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
- GOOGLE_SHEETS_SPREADSHEET_ID=1a2b3c4d5e6f7g8h9i0j
- ADMIN_EMAIL=your-email@example.com
- RESEND_API_KEY=re_1234567890abcdef

### Reference:
Use the form pattern from mahesh-college-counseling/src/app/apply/page.tsx as a starting point for styling and structure.

### Error Handling:
- Network errors: "Connection error. Please try again."
- Validation errors: Show specific field errors
- Server errors: "Something went wrong. Please try again later."
- Log all errors to console for debugging

### Additional Features:
- Phone number formatting (auto-format as user types)
- LinkedIn URL validation (must be linkedin.com/in/...)
- Conditional field visibility (What Building only shows if Building = Yes)
- Form reset after successful submission
- Prevent double-submission (disable button during submission)
```

---

## 🎨 Design Inspiration

The form should look similar to your existing college counseling form but with:
- Hero section at top ("Join Our Network" or similar)
- Clean, minimal design
- Professional color scheme
- Smooth animations on submit
