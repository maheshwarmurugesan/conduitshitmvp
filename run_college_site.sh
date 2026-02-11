#!/bin/bash
# Run Mahesh College Counseling site (Next.js)
# Use this when you're in the Coding folder

cd "$(dirname "$0")/mahesh-college-counseling" || exit 1

echo "Starting Mahesh College Counseling..."
echo "Open: http://localhost:3000"
echo "Press Ctrl+C to stop"
echo ""

npm run dev
