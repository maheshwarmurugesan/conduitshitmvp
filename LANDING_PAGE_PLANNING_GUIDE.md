# Landing Page with Form → Spreadsheet → Partiful Integration

## 🎯 Project Overview

Create a landing page form that collects contact information and automatically:
1. Saves submissions to a spreadsheet (Google Sheets)
2. Adds contacts to a Partiful event for text blasting

---

## 📋 Questions to Answer Before Building

### **Tech Stack Preferences**
- [ ] **Frontend Framework**: Next.js (recommended based on your existing projects) or React/Vite?
- [ ] **Styling**: Tailwind CSS (recommended) or CSS modules/styled-components?
- [ ] **Hosting**: Vercel (recommended for Next.js), Netlify, or other?

### **Database/Storage Integration**
- [ ] **Option A - Supabase** (⭐ Recommended - simpler, you already use it)
  - [ ] Do you have Supabase account?
  - [ ] Create project and table (we'll guide you)
- [ ] **Option B - Google Sheets API** (more complex setup)
  - [ ] Do you have Google Cloud project set up? Service account credentials?
  - [ ] Spreadsheet ID: Do you have a Google Sheet created already?

### **Partiful Integration**
⚠️ **Important**: Partiful doesn't have an official public API. Options:
- [ ] **Option A**: Use Partiful's bulk email upload feature (manual export from spreadsheet)
- [ ] **Option B**: Use community library (partiful-py or partiful-api from GitHub)
- [ ] **Option C**: Web automation with Puppeteer/Playwright (less reliable)
- [ ] **Do you have**: Partiful account? Event URL/ID?

### **Form Fields** (Confirm these are correct)
- ✅ First Name (required)
- ✅ Last Name (required)
- ✅ LinkedIn URL (required)
- ✅ Email (required)
- ✅ Phone Number (required)
- ✅ 1-2 sentence intro (required)
- ✅ "Are you building?" (Yes/No radio button)
- ✅ "If yes, what are you building?" (conditional textarea - only shows if "Yes")

### **Additional Requirements**
- [ ] **Success message**: What should users see after submission?
- [ ] **Error handling**: How should we handle failures?
- [ ] **Validation**: Any specific phone number format? (e.g., E.164 format)
- [ ] **Spam protection**: Do you want reCAPTCHA or similar?
- [ ] **Email notifications**: Should you get notified of new submissions?

---

## 🏗️ Recommended Architecture

### **Option 1: Supabase + Manual Export** (⭐ Simplest & Most Reliable)
```
Landing Page Form
    ↓
Next.js API Route (/api/submit)
    ↓
Supabase Table (submissions)
    ↓
Manual: Export CSV from Supabase → Upload to Google Sheets/Partiful
```

**Pros**: 
- Simplest setup (no Google Cloud service accounts)
- Official API, very reliable
- Easy to query and view data
- You already use Supabase in other projects
- Can export anytime with one click

**Cons**: 
- Requires manual export step (takes 30 seconds)

### **Option 2: Google Sheets + Manual Partiful Upload** (Alternative)
```
Landing Page Form
    ↓
Next.js API Route (/api/submit)
    ↓
┌─────────────────┬──────────────────┐
│ Google Sheets   │  Email to Admin  │
│ (via API)       │  (with CSV)       │
└─────────────────┴──────────────────┘
    ↓
Manual: Export from Sheets → Upload to Partiful
```

**Pros**: 
- Simple, reliable
- Uses official Google Sheets API
- No reverse engineering needed

**Cons**: 
- Requires manual step to upload to Partiful

### **Option 3: Google Sheets + Automated Partiful** (More Complex)
```
Landing Page Form
    ↓
Next.js API Route (/api/submit)
    ↓
┌─────────────────┬──────────────────────────┐
│ Google Sheets   │  Partiful Integration    │
│ (via API)       │  (via community lib/web)  │
└─────────────────┴──────────────────────────┘
```

**Pros**: 
- Fully automated
- No manual steps

**Cons**: 
- Partiful integration may break if they change their UI
- Requires reverse engineering or third-party library

---

## 📝 Optimal Prompt for Cursor

Copy this prompt and fill in your answers:

```
Create a landing page with a contact form that collects:
- First Name (required)
- Last Name (required)
- LinkedIn URL (required)
- Email (required)
- Phone Number (required, format: E.164)
- 1-2 sentence intro (required, textarea)
- "Are you building?" (Yes/No radio, required)
- "What are you building?" (textarea, conditional - only shows if "Are you building?" = Yes)

When the form is submitted:
1. Validate all fields (use Zod for validation)
2. Save to Google Sheets using Google Sheets API
   - Spreadsheet ID: [YOUR_SPREADSHEET_ID]
   - Sheet name: "Submissions"
   - Columns: First Name, Last Name, LinkedIn, Email, Phone, Intro, Building, What Building, Submitted At
3. Add contact to Partiful event [OPTION A/B/C - see below]
4. Show success message to user
5. Send email notification to admin (optional)

Tech Stack:
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Zod for validation
- Google Sheets API (googleapis npm package)
- [Partiful integration method]

Environment Variables Needed:
- GOOGLE_SHEETS_CLIENT_EMAIL
- GOOGLE_SHEETS_PRIVATE_KEY
- GOOGLE_SHEETS_SPREADSHEET_ID
- PARTIFUL_EVENT_ID (if using API)
- ADMIN_EMAIL (optional, for notifications)
- RESEND_API_KEY (optional, for email)

Design:
- Modern, clean landing page
- Form should be centered with good spacing
- Mobile-responsive
- Loading states during submission
- Error handling with user-friendly messages

Reference the existing form pattern from mahesh-college-counseling/src/app/apply/page.tsx
```

---

## 🔧 Setup Steps You'll Need

### 1. Supabase Setup (Recommended)
```bash
# 1. Create Supabase project at supabase.com
# 2. Create table (we'll provide SQL)
# 3. Get API keys from Settings → API
# 4. Install: npm install @supabase/supabase-js
```

See `SUPABASE_APPROACH.md` for detailed setup instructions.

### 1b. Google Sheets Setup (Alternative)
```bash
# Create Google Cloud Project
# Enable Google Sheets API
# Create Service Account
# Download JSON credentials
# Share spreadsheet with service account email
```

### 2. Partiful Setup
- Create Partiful account
- Create event
- Get event URL/ID
- Decide on integration method (A/B/C above)

### 3. Project Setup
```bash
npm create next-app@latest landing-page-form
cd landing-page-form
npm install zod googleapis
# Add other dependencies as needed
```

---

## 📊 Spreadsheet Schema

| Column | Type | Notes |
|--------|------|-------|
| First Name | Text | Required |
| Last Name | Text | Required |
| LinkedIn | URL | Required |
| Email | Email | Required, lowercase |
| Phone | Text | Required, E.164 format |
| Intro | Text | 1-2 sentences |
| Building | Boolean | Yes/No |
| What Building | Text | Only if Building = Yes |
| Submitted At | DateTime | ISO format |

---

## 🚀 Next Steps

1. **Answer all questions above** ✅
2. **Set up Google Sheets API credentials** 🔑
3. **Create Partiful event and get details** 📅
4. **Use the prompt template above** in Cursor
5. **Test thoroughly** before going live

---

## 💡 Alternative: Simpler Approach

If Partiful automation is too complex, consider:
- Form → Google Sheets (automated)
- Export CSV from Sheets → Upload to Partiful manually (takes 30 seconds)
- Use Partiful's bulk email feature

This is often more reliable than reverse engineering their API!
