# Partiful Automation Options

## The Challenge

Partiful **doesn't have an official API** for adding contacts to events. However, there are a few workarounds:

---

## Option 1: Web Automation (Most Reliable Workaround) ⭐

Use Puppeteer/Playwright to automate the browser and add contacts through Partiful's UI.

### How It Works:
1. Form submits → Saves to Google Sheets
2. API route triggers automation script
3. Script logs into Partiful
4. Script navigates to your event
5. Script adds contacts via bulk email upload or phone import

### Pros:
- ✅ Works with Partiful's actual UI
- ✅ Relatively reliable (as long as UI doesn't change drastically)
- ✅ Can handle bulk imports

### Cons:
- ⚠️ Can break if Partiful changes their UI
- ⚠️ Requires keeping browser automation running
- ⚠️ More complex setup

### Implementation:
```typescript
// app/api/add-to-partiful/route.ts
import puppeteer from 'puppeteer';

export async function POST(req: Request) {
  const { contacts } = await req.json(); // Array of {name, email, phone}
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Login to Partiful
  await page.goto('https://partiful.com/login');
  await page.type('[name="email"]', process.env.PARTIFUL_EMAIL);
  await page.type('[name="password"]', process.env.PARTIFUL_PASSWORD);
  await page.click('button[type="submit"]');
  
  // Navigate to your event
  await page.goto(`https://partiful.com/e/${process.env.PARTIFUL_EVENT_ID}`);
  
  // Click "Invite" → "Send emails"
  await page.click('button:has-text("Invite")');
  await page.click('button:has-text("Send emails")');
  
  // Bulk upload contacts
  // (Would need to format contacts and upload)
  
  await browser.close();
  
  return Response.json({ success: true });
}
```

---

## Option 2: Community Library + Reverse Engineering

Use the `partiful-api` library and extend it to add contacts.

### Current Library Capabilities:
- ✅ Get event data
- ✅ Get invitable contacts
- ✅ Export guests CSV
- ❌ **Cannot add guests** (not implemented yet)

### What You'd Need:
- Extract auth token from browser (expires periodically)
- Reverse engineer Partiful's Firebase calls for adding guests
- Implement the add guest functionality

### Pros:
- ✅ More reliable than web automation
- ✅ Faster execution

### Cons:
- ⚠️ Requires reverse engineering
- ⚠️ Auth token expires (need to refresh manually)
- ⚠️ May break if Partiful changes backend

---

## Option 3: Hybrid Approach (Recommended) ⭐⭐

**Automated Google Sheets → Manual Partiful Upload**

1. Form saves to Google Sheets automatically
2. Create a simple admin page that:
   - Shows all submissions
   - Has "Export to CSV" button
   - Formats CSV for Partiful import
3. You click one button → CSV downloads → Upload to Partiful (30 seconds)

### Pros:
- ✅ 100% reliable (no automation to break)
- ✅ Simple to implement
- ✅ Takes only 30 seconds per export
- ✅ You control when to add contacts

### Cons:
- ⚠️ Requires manual step (but very quick)

### Implementation:
```typescript
// app/api/export-partiful/route.ts
export async function GET() {
  // Fetch from Google Sheets
  const submissions = await getSubmissionsFromSheets();
  
  // Format for Partiful CSV (name, email, phone)
  const csv = submissions.map(s => 
    `${s.firstName} ${s.lastName},${s.email},${s.phone}`
  ).join('\n');
  
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="partiful-import.csv"'
    }
  });
}
```

---

## Option 4: Scheduled Sync (Advanced)

Create a cron job that:
1. Checks Google Sheets for new submissions
2. Uses web automation to add them to Partiful
3. Runs every hour/day

### Pros:
- ✅ Fully automated
- ✅ Runs on schedule

### Cons:
- ⚠️ Most complex
- ⚠️ Requires server/function to run continuously
- ⚠️ Can break if Partiful changes UI

---

## My Recommendation

**Start with Option 3 (Hybrid Approach):**

1. Form → Google Sheets (automatic) ✅
2. Admin page with "Export for Partiful" button
3. One-click CSV download
4. Upload to Partiful (30 seconds)

**Why?**
- Takes 30 seconds per export
- 100% reliable
- No automation to break
- You control when contacts are added

**Then, if you really need full automation:**
- Try Option 1 (Web Automation) for adding contacts automatically
- Use it as a background job that runs periodically

---

## Implementation Plan

### Phase 1: Basic (Do This First)
- ✅ Form → Google Sheets
- ✅ Admin export page
- ✅ CSV download for Partiful

### Phase 2: Automation (If Needed)
- Add web automation script
- Set up background job
- Test thoroughly

---

## Questions to Consider

1. **How often do you need to add contacts?**
   - Daily? → Automation might be worth it
   - Weekly? → Manual export is fine

2. **How many contacts per batch?**
   - < 50? → Manual is quick
   - > 100? → Automation might help

3. **Do you need real-time?**
   - Yes → Automation required
   - No → Manual export works

---

## Next Steps

1. **Build the form** → Google Sheets (already planned)
2. **Add admin export page** → One-click CSV download
3. **Test manual workflow** → See if 30 seconds is acceptable
4. **Add automation later** → If manual becomes too tedious

Want me to add the admin export page to your prompt?
