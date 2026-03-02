#!/bin/bash
# A script to package the Next.js standalone build for Hostinger deployment

echo "Setting up Hostinger Deployment Package..."

if [ ! -f "next.config.ts" ] && [ ! -f "next.config.js" ] && [ ! -f "next.config.mjs" ]; then
  echo "Error: Run this script from the root of your Next.js project."
  exit 1
fi

echo "1. Installing production dependencies to prepare..."
npm install

echo "2. Generating Prisma client..."
npx prisma generate

echo "3. Building Next.js app (Standalone Mode)..."
npm run build

echo "4. Preparing Hostinger deployment folder..."
rm -rf hostinger-deployment
mkdir hostinger-deployment

echo "   Copying standalone files..."
cp -r .next/standalone/* hostinger-deployment/

# Copy .env file if it exists so it goes to production
if [ -f ".env" ]; then
  echo "   Including .env file"
  cp .env hostinger-deployment/
fi

echo "   Copying static assets (Next.js standalone requires these separately)..."
mkdir -p hostinger-deployment/.next
cp -r .next/static hostinger-deployment/.next/
cp -r public hostinger-deployment/

echo "   Copying Prisma folder (for migrations if needed)..."
mkdir -p hostinger-deployment/prisma
cp -r prisma/* hostinger-deployment/prisma/

echo "5. Zipping the deployment package..."
cd hostinger-deployment
zip -r ../hostinger-deploy.zip .
cd ..

echo "6. Cleaning up temporary folder..."
rm -rf hostinger-deployment

echo ""
echo "=========================================================="
echo "✅ Done! The 'hostinger-deploy.zip' file is ready."
echo "=========================================================="
echo "Upload this .zip file to your Hostinger file manager,"
echo "extract it, and set the Node.js Application startup file"
echo "to 'server.js'."
