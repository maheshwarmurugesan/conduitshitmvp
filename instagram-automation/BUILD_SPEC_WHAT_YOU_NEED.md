# Instagram Automation Bot — What You Need to Build This

This document explains what you need to build an Instagram automation bot that:
1. Monitors comments on your posts for a specific keyword
2. Sends a DM to users who comment the keyword
3. Checks if they follow you
4. After they follow and click a button (via web link), sends them a specific link

---

## 1. What This Bot Does (Simple Flow)

```
User comments "KEYWORD" on your post
    ↓
Bot detects comment (checks every 5 minutes)
    ↓
Bot sends DM: "Please follow me, then click this link: [web link]"
    ↓
User follows you
    ↓
Bot detects follow (checks every 10 minutes)
    ↓
User clicks link → goes to your web page → clicks "I followed" button
    ↓
Bot verifies follow → sends final link via DM
```

---

## 2. Technical Components Needed

### 2.1 Instagram API Access

**What you need:**
- Meta Developer Account (free)
- Instagram Business or Creator Account (required for Graph API)
- Instagram App created in Meta Developer Console
- Access Token (long-lived token)

**Steps to get:**
1. Go to https://developers.facebook.com/
2. Create a Meta Developer account
3. Create a new app → choose "Business" type
4. Add "Instagram Graph API" product
5. Get your Instagram Business Account ID
6. Generate access token with permissions:
   - `instagram_basic`
   - `pages_read_engagement`
   - `pages_manage_messages` (for DMs)

**Important limitations:**
- ❌ No real-time webhooks for comments (must poll)
- ❌ No interactive buttons in DMs (must use web link)
- ✅ Can read comments on your posts
- ✅ Can send DMs
- ✅ Can check if someone follows you
- ⚠️ Rate limits: ~200 requests per hour per user

---

### 2.2 Backend Server

**What to build:**
- API server (Python/FastAPI or Node.js/Express)
- Database (SQLite for dev, PostgreSQL for prod)
- Background tasks (scheduled jobs)
- Web frontend (simple HTML or React)

**Tech stack options:**

**Option A: Python**
- FastAPI (API framework)
- SQLAlchemy (database)
- APScheduler (scheduled tasks)
- Requests (HTTP calls to Instagram API)

**Option B: Node.js**
- Express (API framework)
- Prisma or TypeORM (database)
- node-cron (scheduled tasks)
- Axios (HTTP calls)

**Recommendation:** Python/FastAPI is easier for beginners, Node.js is faster for real-time.

---

### 2.3 Database Schema

**Tables needed:**

1. **comments**
   - `id` (primary key)
   - `post_id` (Instagram post ID)
   - `comment_id` (Instagram comment ID)
   - `username` (who commented)
   - `text` (comment text)
   - `keyword_matched` (boolean - did it match keyword?)
   - `processed_at` (when we processed it)
   - `created_at` (when comment was made)

2. **users**
   - `id` (primary key)
   - `username` (Instagram username)
   - `instagram_user_id` (Instagram user ID)
   - `got_dm_at` (when we sent DM)
   - `follow_status` (pending/yes/no)
   - `last_checked_at` (last time we checked if following)
   - `verification_token` (unique token for web link)

3. **dm_conversations**
   - `id` (primary key)
   - `user_id` (foreign key to users)
   - `message_sent_at` (when initial DM sent)
   - `button_clicked_at` (when they clicked web button)
   - `link_sent_at` (when final link sent)
   - `final_link` (what link was sent)

4. **config**
   - `id` (primary key)
   - `keyword` (the trigger word, e.g. "LINK")
   - `dm_message_template` (message to send in DM)
   - `link_url` (the final link to send)
   - `updated_at` (when config changed)

---

### 2.4 Key Features to Build

#### Feature 1: Comment Monitoring
- **What:** Poll your Instagram posts for new comments
- **How:** Use Instagram Graph API endpoint: `GET /{post-id}/comments`
- **Frequency:** Every 5 minutes (to respect rate limits)
- **Logic:** Check if comment text contains keyword (case-insensitive)

#### Feature 2: DM Sending
- **What:** Send DM to user who commented keyword
- **How:** Use Instagram Graph API: `POST /{ig-user-id}/messages`
- **Message:** "Hi! Please follow me, then click this link: [your-web-link]/verify/{token}"
- **Prevent duplicates:** Check if we already sent DM in last 24 hours

#### Feature 3: Follow Detection
- **What:** Check if user is following you
- **How:** Use Instagram Graph API: `GET /{your-ig-user-id}?fields=followers_count` and check followers list
- **Frequency:** Every 10 minutes for users who got DM but haven't followed
- **Note:** Instagram API doesn't give real-time follow events, must poll

#### Feature 4: Web Verification Page
- **What:** Simple web page where user clicks "I followed" button
- **Why:** Instagram DMs don't support interactive buttons, so we use web link
- **URL:** `https://your-domain.com/verify/{token}`
- **Page shows:** "Thanks for following! Click the button below to get your link."
- **Button:** Calls backend API to verify follow and trigger link delivery

#### Feature 5: Link Delivery
- **What:** Send final link via DM after follow + button click
- **How:** Send another DM with the link from config
- **Message:** "Thanks for following! Here's your link: [link]"
- **Track:** Mark in database that link was sent

---

## 3. What You Need Before Building

### 3.1 Instagram Account Setup
- [ ] Instagram Business or Creator account
- [ ] Meta Developer account
- [ ] Instagram App created
- [ ] Access token with correct permissions
- [ ] Test with a test account first (not your main account!)

### 3.2 Configuration Values
- [ ] **Keyword:** What word triggers the bot? (e.g. "LINK", "SIGNUP", "ACCESS")
- [ ] **DM Message:** What message to send? (include web link with {token} placeholder)
- [ ] **Final Link:** What link to send after follow + click?
- [ ] **Your Instagram User ID:** Needed for API calls

### 3.3 Hosting/Deployment
- [ ] **Where to host:** Cloud (AWS, Heroku, Railway, Render) or your own server?
- [ ] **Domain:** For web verification page (or use subdomain)
- [ ] **SSL Certificate:** HTTPS required for web links
- [ ] **Environment Variables:** Store Instagram credentials securely

---

## 4. Step-by-Step Build Plan

### Phase 1: Setup & Research (Prompt 1)
- Create project structure
- Research Instagram API capabilities
- Document limitations and workarounds

### Phase 2: Authentication (Prompt 2)
- Set up Instagram OAuth
- Get and store access tokens
- Test API connection

### Phase 3: Database (Prompt 3)
- Set up database
- Create all tables
- Test CRUD operations

### Phase 4: Comment Monitoring (Prompt 4)
- Build comment polling
- Keyword detection
- Save to database

### Phase 5: DM Sending (Prompt 5)
- Send DM when keyword found
- Prevent duplicates
- Track in database

### Phase 6: Follow Detection (Prompt 6)
- Check if users are following
- Update database
- Schedule periodic checks

### Phase 7: Web Verification (Prompt 7)
- Create web page
- Generate unique tokens
- Handle button clicks

### Phase 8: Link Delivery (Prompt 8)
- Send final link after verification
- Track delivery
- Update database

### Phase 9: Admin Dashboard (Prompt 9)
- View stats and activity
- Update configuration
- Monitor system

### Phase 10: Production Ready (Prompt 10)
- Error handling
- Logging
- Rate limiting
- Deployment docs

---

## 5. Important Considerations

### 5.1 Instagram Terms of Service
⚠️ **Warning:** Instagram's ToS restricts automation. Make sure:
- You're not spamming users
- You're providing value (not just asking for follows)
- You comply with their automation policies
- Consider using Instagram's official APIs only

### 5.2 Rate Limits
- Instagram API: ~200 requests/hour per user
- Don't poll too frequently
- Implement exponential backoff on errors
- Cache follower lists when possible

### 5.3 Error Handling
- What if Instagram API is down?
- What if user blocks you?
- What if token expires?
- What if rate limit hit?
- Handle all gracefully, log everything

### 5.4 Security
- Never expose access tokens
- Use environment variables
- Encrypt sensitive data in database
- Use HTTPS for web pages
- Validate all user inputs

---

## 6. Testing Strategy

1. **Test Account:** Use a separate Instagram account for testing
2. **Test Flow:**
   - Comment keyword on test post
   - Verify DM received
   - Follow the test account
   - Click verification link
   - Verify final link received
3. **Test Edge Cases:**
   - User comments keyword twice
   - User follows before clicking link
   - User clicks link before following
   - API errors/rate limits

---

## 7. Deployment Checklist

- [ ] Instagram app configured
- [ ] Access token obtained
- [ ] Database set up (production)
- [ ] Environment variables configured
- [ ] Web server running (HTTPS)
- [ ] Scheduled tasks running
- [ ] Monitoring/logging set up
- [ ] Admin dashboard accessible
- [ ] Tested with real account
- [ ] Error handling verified

---

## 8. Cost Estimate

**Free tier options:**
- Instagram API: Free
- Meta Developer: Free
- Hosting: Free tiers available (Railway, Render, Heroku)
- Database: SQLite (free) or PostgreSQL free tier

**Paid options (if needed):**
- Hosting: $5-20/month
- Database: $0-10/month
- Domain: $10-15/year

**Total:** Can be built for $0-20/month

---

## Bottom Line

You need:
1. ✅ Instagram Business account + Meta Developer account
2. ✅ Backend server (Python or Node.js)
3. ✅ Database (SQLite or PostgreSQL)
4. ✅ Web hosting (for verification page)
5. ✅ Configuration (keyword, messages, links)

The bot is built in 10 steps (see PROMPTS_STRICT_ORDER.md). Each step builds on the previous one. Follow them in order, test after each step.
