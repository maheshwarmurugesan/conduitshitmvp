#!/bin/bash
# Fix Vercel 404 / "Failed to fetch git submodules" error
# Run this from Terminal to push the college counseling site correctly

set -e
cd "$(dirname "$0")"

echo "=============================================="
echo "  Mahesh College Counseling - Vercel Deploy   "
echo "=============================================="
echo ""
echo "This script pushes THIS folder to GitHub so Vercel can deploy it."
echo "Your current repo has this as a submodule, which causes the 404."
echo ""
echo "Target repo: https://github.com/maheshwarmurugesan/collegecounselingwebsitemahesh"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 1
fi

# Ensure we're in the right place
if [ ! -f "package.json" ]; then
  echo "Error: Run this script from mahesh-college-counseling folder."
  exit 1
fi

# Add all and commit if there are changes
git add -A
if ! git diff --staged --quiet; then
  git commit -m "Update site content and fix deployment"
fi

# Set remote (overwrite if exists)
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/maheshwarmurugesan/collegecounselingwebsitemahesh.git

echo ""
echo "Pushing to GitHub (this will overwrite the repo)..."
git push -u origin main --force

echo ""
echo "=============================================="
echo "  Done! Next steps:"
echo "=============================================="
echo "1. Vercel will auto-redeploy if connected to this repo."
echo "2. If still 404: In Vercel Dashboard → Project → Settings → General"
echo "   Set Root Directory to blank (or leave default)."
echo "3. Add DATABASE_URL (Postgres) in Vercel env vars - SQLite won't work on Vercel."
echo "4. See DEPLOYMENT.md for full setup."
echo ""
