#!/bin/bash

# Script to run the web version of the program
# This will start a web server

cd "$(dirname "$0")"

echo "🔍 Checking if Flask is installed..."

# Check if Flask is installed
if ! python3 -c "import flask" 2>/dev/null; then
    echo "📦 Flask is not installed. Installing it now..."
    pip3 install flask
    echo "✅ Flask installed!"
fi

echo ""
echo "🚀 Starting web server..."
echo "📍 Open your browser and go to: http://localhost:5000"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

python3 mahesh_web.py


