#!/bin/bash
# Fix Tailwind CSS version mismatch

echo "Removing lock files and node_modules..."
rm -rf pnpm-lock.yaml node_modules package-lock.json

echo "Installing dependencies with npm..."
npm install

echo "Done! You can now run 'npm start' to start the development server."
