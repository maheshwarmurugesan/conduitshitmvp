# Prompts in strict order — copy-paste one at a time

Follow the steps exactly: **paste Prompt 1** → I build that only → you test → then **paste Prompt 2** → I build that only → etc. Do not skip; each prompt assumes the previous ones are done.

---

## Prompt 1 — Project setup and Instagram API research

**Paste this first. When it's built, test: you have a project structure and understand Instagram API limitations.**

```
TECH FLOW:
- Research Instagram Graph API and Basic Display API capabilities
- Understand limitations: what's possible vs what requires workarounds
- Set up project structure: backend (Python/FastAPI or Node.js) + database + basic config
- Document API requirements and limitations clearly

BUILD IT:
In this repo (instagram-automation):
1. Create project structure: backend/ folder with main.py (or server.js), requirements.txt (or package.json)
2. Create a research document: INSTAGRAM_API_RESEARCH.md that explains:
   - What Instagram Graph API can do (read comments, send DMs, check followers)
   - What it CANNOT do (real-time webhooks, button interactions in DMs)
   - Workarounds needed (polling, web app for button clicks)
3. Set up basic FastAPI or Express server with one health check endpoint
4. Create .env.example with placeholders for Instagram API credentials
5. Add README.md explaining the project goal

DONE WHEN: You have a working server, clear understanding of Instagram API limits, and project structure ready.
```

---

## Prompt 2 — Instagram API authentication setup

**Paste this after Prompt 1 is done.**

```
TECH FLOW:
- Set up Instagram Graph API authentication
- Get access token (long-lived token)
- Test connection to Instagram API
- Store credentials securely

BUILD IT:
In this repo (instagram-automation/backend):
1. Create auth/instagram_auth.py (or instagram_auth.js) that:
   - Handles OAuth flow for Instagram Graph API
   - Gets and refreshes long-lived access tokens
   - Stores tokens securely (encrypted in DB or env)
2. Add endpoint GET /api/auth/instagram/login that redirects to Instagram OAuth
3. Add endpoint GET /api/auth/instagram/callback that handles OAuth callback
4. Add endpoint GET /api/auth/instagram/status that shows if authenticated
5. Test: Can authenticate and get access token

DONE WHEN: You can authenticate with Instagram and have a valid access token stored.
```

---

## Prompt 3 — Database setup for tracking comments and users

**Paste this after Prompt 2 is done.**

```
TECH FLOW:
- Set up database (SQLite for dev, PostgreSQL for prod)
- Create tables: comments, users, dm_conversations, follow_status
- Track which comments we've processed, which users got DMs, follow status

BUILD IT:
In this repo (instagram-automation/backend):
1. Create database.py (or database.js) with connection setup
2. Create migrations/schema.sql with tables:
   - comments: id, post_id, comment_id, username, text, keyword_matched, processed_at, created_at
   - users: id, username, instagram_user_id, got_dm_at, follow_status (pending/yes/no), last_checked_at
   - dm_conversations: id, user_id, message_sent_at, button_clicked_at, link_sent_at
   - config: keyword (the trigger word), dm_message_template, link_url
3. Add database initialization script
4. Create models/schemas.py (or models.js) with Pydantic/Schema models

DONE WHEN: Database exists with all tables, can insert/query data.
```

---

## Prompt 4 — Comment monitoring (polling Instagram posts)

**Paste this after Prompt 3 is done.**

```
TECH FLOW:
- Poll your Instagram posts for new comments
- Check if comment contains the keyword
- Store new comments in database
- Mark which ones matched the keyword

BUILD IT:
In this repo (instagram-automation/backend):
1. Create services/comment_monitor.py (or comment_monitor.js):
   - Function get_recent_comments(post_id) that fetches comments from Instagram API
   - Function check_keyword(comment_text, keyword) that checks if keyword exists
   - Function process_new_comments() that polls posts, checks keywords, saves to DB
2. Create endpoint POST /api/monitor/start that starts polling (or use background task)
3. Create endpoint GET /api/monitor/status that shows last check time and new comments found
4. Use a scheduler (APScheduler for Python or node-cron for Node.js) to poll every 5 minutes
5. Log all activity

DONE WHEN: System polls your posts every 5 minutes, finds comments with keyword, saves them to DB.
```

---

## Prompt 5 — Send DM to users who commented keyword

**Paste this after Prompt 4 is done.**

```
TECH FLOW:
- When keyword comment found, get user's Instagram user ID
- Send them a DM via Instagram API
- Track that DM was sent (prevent duplicates)
- Include message asking them to follow

BUILD IT:
In this repo (instagram-automation/backend):
1. Create services/dm_service.py (or dm_service.js):
   - Function send_dm(user_id, message) that sends DM via Instagram API
   - Function should_send_dm(username) that checks if we already sent DM (not in last 24h)
   - Function get_dm_template() that reads message template from config/DB
2. Create endpoint POST /api/dm/send/{username} for manual testing
3. Integrate with comment_monitor: when keyword found, automatically send DM
4. Update users table: set got_dm_at timestamp
5. Handle errors: if DM fails (user blocked, etc.), log it but don't crash

DONE WHEN: When someone comments keyword, they automatically get a DM asking them to follow.
```

---

## Prompt 6 — Check if user followed you

**Paste this after Prompt 5 is done.**

```
TECH FLOW:
- Periodically check if users who got DMs are now following you
- Update follow_status in database
- Only check users who got DM but haven't followed yet

BUILD IT:
In this repo (instagram-automation/backend):
1. Create services/follow_checker.py (or follow_checker.js):
   - Function check_if_following(username) that uses Instagram API to check follower list
   - Function check_pending_users() that checks all users with got_dm_at but follow_status != 'yes'
   - Update users table: set follow_status = 'yes' and last_checked_at
2. Create scheduled task that runs every 10 minutes to check pending users
3. Create endpoint GET /api/follow/check/{username} for manual testing
4. Log when someone follows (for debugging)

DONE WHEN: System automatically detects when users who got DMs start following you.
```

---

## Prompt 7 — Web app for button click (since Instagram DMs don't support buttons)

**Paste this after Prompt 6 is done.**

```
TECH FLOW:
- Since Instagram DMs don't support interactive buttons, send a link instead
- Create a simple web page where user clicks "I followed" button
- Button click triggers link delivery
- Link should be unique per user (token-based)

BUILD IT:
In this repo (instagram-automation):
1. Create frontend/ folder with simple HTML page:
   - Page at /verify/{token} that shows "Click here if you followed"
   - Button that calls backend API to verify follow and send link
   - Simple, mobile-friendly design
2. In backend, create endpoint GET /verify/{token} that shows the page
3. Create endpoint POST /api/verify/click/{token} that:
   - Validates token
   - Checks if user is following (double-check)
   - If following, sends link via DM
   - Updates dm_conversations table: set button_clicked_at and link_sent_at
4. Generate unique token per user when sending initial DM
5. Include token link in DM message

DONE WHEN: DM includes link to web page, clicking button verifies follow and sends final link.
```

---

## Prompt 8 — Link delivery after follow + button click

**Paste this after Prompt 7 is done.**

```
TECH FLOW:
- After user follows AND clicks button, send them the final link via DM
- Link comes from config (different link per use case)
- Track that link was sent (prevent duplicates)
- Send confirmation message

BUILD IT:
In this repo (instagram-automation/backend):
1. In services/dm_service.py, add function send_link_dm(user_id, link):
   - Sends DM with the specific link
   - Includes friendly message
2. In POST /api/verify/click/{token} endpoint:
   - After verifying follow, call send_link_dm()
   - Update dm_conversations: set link_sent_at
   - Return success message
3. Create endpoint GET /api/config/link to view/set the link (admin)
4. Create endpoint POST /api/config/link to update the link (admin)
5. Store link in config table or env variable

DONE WHEN: When user follows and clicks button, they get final link via DM automatically.
```

---

## Prompt 9 — Admin dashboard to monitor activity

**Paste this after Prompt 8 is done.**

```
TECH FLOW:
- Simple web dashboard to see:
  - Recent keyword comments found
  - DMs sent
  - Users who followed
  - Links delivered
  - System status

BUILD IT:
In this repo (instagram-automation):
1. Create frontend/admin.html (or React component):
   - Dashboard showing stats: comments found today, DMs sent, follows, links sent
   - Table of recent activity
   - Form to update keyword and link URL
   - System status (last poll time, API status)
2. Create backend endpoints:
   - GET /api/admin/stats - returns all stats
   - GET /api/admin/activity - returns recent activity log
   - GET /api/admin/config - returns current config
   - POST /api/admin/config - updates config (keyword, link, DM message)
3. Add simple auth (password or API key) to protect admin routes

DONE WHEN: You can view dashboard, see all activity, and update config through web UI.
```

---

## Prompt 10 — Error handling, logging, and production readiness

**Paste this last, after Prompts 1–9 are done.**

```
TECH FLOW:
- Handle all error cases gracefully
- Log everything for debugging
- Add rate limiting (Instagram API has limits)
- Add monitoring/alerting
- Document deployment

BUILD IT:
In this repo (instagram-automation/backend):
1. Add comprehensive error handling:
   - Instagram API rate limits (429 errors) - wait and retry
   - User blocked DMs - skip and log
   - API token expired - auto-refresh
   - Database errors - retry logic
2. Add logging (use Python logging or Winston for Node.js):
   - Log all API calls, errors, DM sends, follow checks
   - Rotate logs, keep for 30 days
3. Add rate limiting:
   - Don't poll comments more than once per 5 minutes
   - Don't check follows more than once per 10 minutes per user
   - Respect Instagram API rate limits
4. Create DEPLOYMENT.md with:
   - How to set up Instagram app and get credentials
   - Environment variables needed
   - How to deploy (Docker, cloud, etc.)
   - Monitoring setup
5. Add health check endpoint GET /api/health

DONE WHEN: System handles errors gracefully, logs everything, respects rate limits, and is ready for production.
```

---

## Order summary

| # | What you paste | What gets built |
|---|----------------|------------------|
| 1 | Prompt 1 | Project setup + API research |
| 2 | Prompt 2 | Instagram authentication |
| 3 | Prompt 3 | Database setup |
| 4 | Prompt 4 | Comment monitoring (polling) |
| 5 | Prompt 5 | Send DM on keyword comment |
| 6 | Prompt 6 | Check if user followed |
| 7 | Prompt 7 | Web app for button click |
| 8 | Prompt 8 | Link delivery after follow + click |
| 9 | Prompt 9 | Admin dashboard |
| 10 | Prompt 10 | Error handling + production ready |

Use them in order. After each prompt is built and tested, move to the next.

---

## Important Notes

- **Instagram API Limitations**: Instagram doesn't support interactive buttons in DMs, so we use a web link workaround
- **Rate Limits**: Instagram has strict rate limits - we'll respect them
- **Terms of Service**: Make sure this automation complies with Instagram's ToS
- **Testing**: Test with a test Instagram account first, not your main account
