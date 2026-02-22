# Deploy Mahesh College Counseling to Vercel

## Fix "404 NOT_FOUND" and "Failed to fetch git submodules"

Your GitHub repo has `mahesh-college-counseling` as a **submodule** (nested repo). Vercel can't fetch it, so you get 404.

### Quick fix – run this script

```bash
cd ~/Coding/mahesh-college-counseling
bash DEPLOY_TO_VERCEL.sh
```

This pushes this folder directly to your GitHub repo, replacing the submodule with the real code.

### Manual fix

```bash
cd ~/Coding/mahesh-college-counseling
git add -A
git commit -m "Update" 2>/dev/null || true
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/maheshwarmurugesan/collegecounselingwebsitemahesh.git
git branch -M main
git push -u origin main --force
```

---

## Why you're seeing 404 NOT_FOUND

1. **Git submodule** – The repo has `mahesh-college-counseling` as a submodule. Vercel fails to fetch it.
2. **Wrong root directory** – If the app is in a subfolder, Vercel may build from the wrong place.
3. **Database** – SQLite does not work on Vercel. You need a hosted database.

---

## Step 1: Fix GitHub – Push the app code

Your college counseling app must be the **root** of the repo Vercel deploys from.

### Option A: Use this folder as its own repo (recommended)

```bash
cd ~/Coding/mahesh-college-counseling

# Remove link to parent .git if it exists
# Then push to your existing repo (replace with your repo URL)
git remote remove origin 2>/dev/null
git remote add origin https://github.com/maheshwarmurugesan/collegecounselingwebsitemahesh.git
git branch -M main
git push -u origin main --force
```

**Note:** `--force` overwrites the existing repo. If you want to keep the current repo content, create a new GitHub repo and push there instead.

### Option B: Keep parent repo and set Root Directory in Vercel

If the full `Coding` folder is in the repo and `mahesh-college-counseling` has real files (not a submodule):

1. Vercel Dashboard → your project → **Settings**
2. **General** → **Root Directory**
3. Set to: `mahesh-college-counseling`
4. **Save**

---

## Step 2: Add a database (required for Vercel)

SQLite cannot run on Vercel. Use one of these:

### Vercel Postgres (simplest)

1. Vercel Dashboard → your project → **Storage**
2. Create a **Postgres** database
3. Connect it to the project
4. Vercel will add `POSTGRES_URL` (or similar) to Environment Variables

### Or Supabase (free tier)

1. Sign up at [supabase.com](https://supabase.com)
2. Create a project and copy the connection string
3. In Vercel → **Settings** → **Environment Variables**, add:
   - Name: `DATABASE_URL`
   - Value: `postgresql://user:password@host:5432/database?sslmode=require`

### Update Prisma for PostgreSQL

In `prisma/schema.prisma`, change:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run migrations:

```bash
cd mahesh-college-counseling
npx prisma migrate deploy
```

---

## Step 3: Environment variables in Vercel

In Vercel → **Settings** → **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Postgres connection string |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-site.vercel.app` |
| `ADMIN_EMAIL` | Your admin email |
| `ADMIN_PASSWORD` | Your admin password |

Optional (email, payments):

| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | From resend.com |
| `FROM_EMAIL` | Your verified sender |
| `STRIPE_SECRET_KEY` | From Stripe |
| `STRIPE_PUBLISHABLE_KEY` | From Stripe |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook |

---

## Step 4: Redeploy

After updating the repo, database, and env vars:

1. Vercel → **Deployments** → **Redeploy** latest, or
2. Push a new commit to trigger a deploy

---

## Troubleshooting: "Failed to submit application"

If form submission always fails:

1. **Debug mode**: The app now shows the actual error on screen when submission fails. Deploy, submit, and read the error message.

2. **Supabase pooler URL**: Use the **pooler** (Session or Transaction mode), not the direct connection:
   - Supabase → Connect → Connection String → **Session mode** or **Transaction pooler**
   - Format: `postgresql://postgres.PROJECT_REF:PASSWORD@HOST.pooler.supabase.com:6543/postgres?pgbouncer=true`
   - Replace `[YOUR-PASSWORD]` with your database password
   - Add `?pgbouncer=true` at the end (required for Prisma)
   - Use the **exact** host Supabase shows (e.g. `aws-0-us-west-2` or `aws-8-us-west-2`)

3. **Verify DATABASE_URL in Vercel**: Settings → Environment Variables. Must match the Supabase Connect string exactly.

4. **Redeploy** after changing environment variables.

---

## Quick checklist

- [ ] Next.js code is at repo root or Root Directory is set to `mahesh-college-counseling`
- [ ] PostgreSQL database is created and `DATABASE_URL` is set
- [ ] Prisma schema uses `provider = "postgresql"`
- [ ] Tables exist (run SQL in Supabase or `npx prisma db push` locally)
- [ ] `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set
- [ ] Redeploy after changes
