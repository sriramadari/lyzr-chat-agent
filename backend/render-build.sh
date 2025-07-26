#!/bin/bash

echo "🔨 Starting Render build process..."

# Install dependencies including dev dependencies for TypeScript compilation
echo "📦 Installing dependencies..."
npm ci

# Install TypeScript types
echo "🔧 Installing TypeScript definitions..."
npm install --save-dev @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/node

# Build TypeScript
echo "🏗️ Building TypeScript..."
npm run build

# Copy additional files
echo "📁 Copying additional files..."
if [ -d "../widget" ]; then
  cp -r ../widget dist/
  echo "✅ Widget files copied"
fi

if [ -d "src/templates" ]; then
  cp -r src/templates dist/
  echo "✅ Template files copied"
fi

echo "✅ Build completed successfully!"