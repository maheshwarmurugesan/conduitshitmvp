#!/bin/bash

# Simple script to run your Python files
# Usage: bash run.sh mahesh.py
# Or just: bash run.sh (runs mahesh.py by default)

cd "$(dirname "$0")"

if [ -z "$1" ]; then
    # No argument provided, run mahesh.py
    echo "🚀 Running mahesh.py..."
    python3 mahesh.py
else
    # Run the file provided
    echo "🚀 Running $1..."
    if [ -f "$1" ]; then
        python3 "$1"
    else
        echo "❌ Error: File '$1' not found!"
        echo "Available Python files:"
        ls -1 *.py 2>/dev/null || echo "No Python files found"
    fi
fi

