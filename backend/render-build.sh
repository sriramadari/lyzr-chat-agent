# This file tells Render which commands to run during deployment
# Place this file in your backend directory

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Copy static files to dist directory for production
mkdir -p dist/public dist/widget dist/templates
cp -r ../widget/* dist/widget/ 2>/dev/null || echo "Widget directory not found, skipping..."
cp -r ../public/* dist/public/ 2>/dev/null || echo "Public directory not found, skipping..."
cp -r src/templates/* dist/templates/ 2>/dev/null || echo "Templates directory not found, skipping..."

echo "Build completed successfully!"
