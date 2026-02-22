# Instagram Automation Bot

An automation bot that monitors Instagram comments, sends DMs, checks follows, and delivers links to users who comment a specific keyword.

## What It Does

1. **Monitors Comments**: Checks your Instagram posts every 5 minutes for comments containing a keyword
2. **Sends DM**: Automatically sends a DM to users who comment the keyword
3. **Checks Follows**: Periodically checks if users are following you
4. **Verifies & Delivers**: After user follows and clicks verification button, sends them a specific link

## How to Use This Guide

This project is built step-by-step. Follow the prompts in order:

1. **Read** `BUILD_SPEC_WHAT_YOU_NEED.md` - Understand what you need before starting
2. **Follow** `PROMPTS_STRICT_ORDER.md` - Copy-paste prompts one at a time
3. **Test** after each step before moving to the next

## Quick Start

1. Make sure you have:
   - Instagram Business or Creator account
   - Meta Developer account
   - Python 3.8+ or Node.js 16+ installed

2. Start with **Prompt 1** from `PROMPTS_STRICT_ORDER.md`

3. Copy-paste each prompt to your AI assistant (like Claude in Cursor)

4. Test each step before moving to the next

## Project Structure

```
instagram-automation/
├── backend/           # API server
├── frontend/          # Web verification page + admin dashboard
├── database/          # Database migrations
├── README.md          # This file
├── PROMPTS_STRICT_ORDER.md    # Step-by-step prompts
└── BUILD_SPEC_WHAT_YOU_NEED.md # Detailed requirements
```

## Important Notes

⚠️ **Instagram Terms of Service**: Make sure your automation complies with Instagram's ToS. Use official APIs only.

⚠️ **Rate Limits**: Instagram API has strict rate limits (~200 requests/hour). The bot respects these limits.

⚠️ **Testing**: Always test with a test Instagram account first, not your main account!

## Support

If you get stuck:
1. Check `BUILD_SPEC_WHAT_YOU_NEED.md` for detailed explanations
2. Review the specific prompt in `PROMPTS_STRICT_ORDER.md`
3. Check error logs in the backend

## License

Use at your own risk. Make sure you comply with Instagram's Terms of Service.
