#!/bin/bash

# Simple script to test if Python is working
# Double-click this file or run: bash test_python.sh

echo "🔍 Testing Python installation..."
echo ""

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "✅ Python3 is installed!"
    python3 --version
    echo ""
    echo "🚀 Running your script..."
    echo "---"
    python3 mahesh.py
    echo "---"
    echo ""
    echo "✅ Everything works! You're ready to code! 🎉"
else
    echo "❌ Python3 not found"
    echo "Please install Command Line Tools first (see SETUP_GUIDE.md)"
fi

