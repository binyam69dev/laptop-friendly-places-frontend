#!/bin/bash

# Build script for production

echo "🚀 Building Laptop-Friendly Places Frontend..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Create production build
echo "🏗️  Creating production build..."
npm run build

echo "✅ Build complete! The build folder is ready for deployment."
echo "📁 Build location: ./dist"
