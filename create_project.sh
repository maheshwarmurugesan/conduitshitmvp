#!/bin/bash

# Script to create a new Python project/file
# Usage: bash create_project.sh my_script

if [ -z "$1" ]; then
    echo "❌ Please provide a name for your Python file"
    echo "Usage: bash create_project.sh my_script"
    echo "This will create: my_script.py"
    exit 1
fi

FILENAME="$1.py"

if [ -f "$FILENAME" ]; then
    echo "⚠️  File $FILENAME already exists!"
    read -p "Do you want to overwrite it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 1
    fi
fi

# Create a basic Python template
cat > "$FILENAME" << 'EOF'
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Your script description here
"""

def main():
    print("Hello, World!")
    # Your code here

if __name__ == "__main__":
    main()
EOF

chmod +x "$FILENAME"
echo "✅ Created $FILENAME"
echo "🚀 Run it with: python3 $FILENAME"
echo "   Or: bash run.sh $FILENAME"

