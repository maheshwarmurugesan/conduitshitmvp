#!/bin/bash

# Script to check your development environment setup
# Run this to see what's installed and what's missing

echo "🔍 Checking your development environment..."
echo "=========================================="
echo ""

# Check Command Line Tools
echo "📦 Command Line Tools:"
if xcode-select -p &> /dev/null; then
    echo "   ✅ Installed at: $(xcode-select -p)"
else
    echo "   ❌ NOT INSTALLED - This is required!"
    echo "   Run: xcode-select --install"
fi
echo ""

# Check Python
echo "🐍 Python:"
if command -v python3 &> /dev/null; then
    echo "   ✅ Installed"
    python3 --version
else
    echo "   ❌ NOT FOUND"
fi
echo ""

# Check if we can run Python
echo "🧪 Can run Python scripts?"
if python3 mahesh.py &> /dev/null; then
    echo "   ✅ YES! Python is working!"
    echo "   Output:"
    python3 mahesh.py
else
    echo "   ❌ NO - Python cannot run scripts"
    echo "   You need Command Line Tools installed"
fi
echo ""

echo "=========================================="
echo "Setup check complete!"

