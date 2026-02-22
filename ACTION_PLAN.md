# 🚀 Action Plan: Landing Page Form → Spreadsheet → Partiful

## Quick Summary

You want a landing page form that:
1. Collects founder information (name, LinkedIn, email, phone, intro, building status)
2. Saves to Google Sheets automatically
3. Adds contacts to Partiful event for text blasting

---

## ✅ Pre-Build Checklist

### Step 1: Answer These Questions (5 min)

**Tech Stack:**
- [ ] Use Next.js? (Recommended: Yes, based on your existing projects)
- [ ] Use Tailwind CSS? (Recommended: Yes)

**Database:**
- [ ] Use Supabase? (⭐ Recommended: Yes - simpler, you already use it)
- [ ] Have Supabase account? (Create free at supabase.com)
- [ ] OR Use Google Sheets API? (More complex setup)

**Partiful:**
- [ ] Have Partiful account? (Required)
- [ ] Created event yet? (Can do later)
- [ ] Which integration method?
  - [ ] **Option A**: Manual CSV export (simplest, most reliable)
  - [ ] **Option B**: Community library (if available)
  - [ ] **Option C**: Web automation (complex, less reliable)

**Design:**
- [ ] Want dark theme? (Recommended: Yes, match your college counseling site)
- [ ] Any specific colors/branding?

### Step 2: Set Up Supabase (10 min) ⭐ Recommended

Follow the guide in `SUPABASE_APPROACH.md`:
1. Create Supabase project (supabase.com)
2. Create "submissions" table
3. Get API keys (Settings → API)
4. Set up Row Level Security policies

**You'll need:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**OR** if you prefer Google Sheets:
- Follow `GOOGLE_SHEETS_SETUP.md` (15 min, more complex)

### Step 3: Set Up Partiful (5 min)

1. Create account at [partiful.com](https://partiful.com)
2. Create an event
3. Copy event URL/ID (if using API method)
4. Note: For manual method, you'll just export CSV and upload

### Step 4: Prepare Your Prompt (5 min)

1. Open `CURSOR_PROMPT_TEMPLATE.md`
2. Fill in all `[BRACKETED]` sections with your actual values
3. Copy the entire prompt

### Step 5: Build in Cursor (30-60 min)

1. Open Cursor
2. Create new Next.js project OR use existing directory
3. Paste your filled prompt
4. Let Cursor build it
5. Test locally
6. Deploy to Vercel

---

## 📋 Files Created for You

1. **`LANDING_PAGE_PLANNING_GUIDE.md`** - Complete architecture and planning guide
2. **`CURSOR_PROMPT_TEMPLATE.md`** - Ready-to-use prompt (fill in brackets)
3. **`GOOGLE_SHEETS_SETUP.md`** - Step-by-step Google Sheets API setup
4. **`ACTION_PLAN.md`** - This file (your roadmap)

---

## 🎯 Recommended Approach

### For Maximum Reliability:

**Phase 1: Basic Form → Google Sheets** (Start here)
- Form collects data
- Saves to Google Sheets automatically
- You manually export CSV and upload to Partiful
- **Time**: 30-45 min to build
- **Reliability**: 100%

**Phase 2: Add Partiful Automation** (Later, if needed)
- Automate Partiful integration
- More complex, may break if Partiful changes
- **Time**: Additional 1-2 hours
- **Reliability**: 70-80%

### Why This Approach?

1. **Google Sheets API is official** - Won't break
2. **Partiful has no official API** - Any automation is fragile
3. **Manual CSV upload takes 30 seconds** - Often not worth automating
4. **You can always automate later** - Start simple

---

## 🔧 What You'll Need

### Environment Variables (.env)

```bash
# Supabase (Recommended)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (keep secret!)

# Email notifications (optional)
ADMIN_EMAIL=your-email@example.com
RESEND_API_KEY=re_xxxxx
```

### NPM Packages

```bash
npm install zod @supabase/supabase-js
# Optional:
npm install resend  # For email notifications
```

---

## 📝 Form Fields (Final Confirmation)

- ✅ First Name (required)
- ✅ Last Name (required)
- ✅ LinkedIn URL (required)
- ✅ Email (required)
- ✅ Phone Number (required, E.164 format)
- ✅ Intro (1-2 sentences, required)
- ✅ "Are you building?" (Yes/No, required)
- ✅ "What are you building?" (conditional, only if Yes)

---

## 🚦 Next Steps

1. **Right Now**: Read `SUPABASE_APPROACH.md` (5 min) ⭐
2. **Today**: Set up Supabase (10 min) - Follow `SUPABASE_APPROACH.md`
3. **Today**: Set up Partiful account (5 min)
4. **Today**: Fill out `CURSOR_PROMPT_TEMPLATE.md` with your values (5 min)
5. **Today/Tomorrow**: Use the prompt in Cursor to build (30-60 min)
6. **After Build**: Test thoroughly, deploy to Vercel

---

## 💡 Pro Tips

1. **Start Simple**: Get form → Google Sheets working first, then add Partiful
2. **Test Locally**: Use `npm run dev` and test with real data
3. **Use Vercel**: Deploy is free and easy for Next.js
4. **Monitor Errors**: Check Vercel logs if something breaks
5. **Backup Data**: Google Sheets is your source of truth

---

## 🆘 If You Get Stuck

1. **Google Sheets Issues**: Check `GOOGLE_SHEETS_SETUP.md` troubleshooting section
2. **Partiful Issues**: Consider manual CSV export (it's fast!)
3. **Code Issues**: Share error messages and I can help debug
4. **Design Issues**: Reference your existing `mahesh-college-counseling` project

---

## 📞 Questions to Ask Yourself

Before building, make sure you can answer:
- ✅ What's my Supabase project URL?
- ✅ What's my Supabase anon key?
- ✅ What's my Supabase service_role key?
- ✅ What's my Partiful event URL/ID?
- ✅ What should the success message say?
- ✅ What's my admin email for notifications?

Once you have these answers, you're ready to build! 🎉
