#!/bin/bash
echo "🔨 Building SolanaSwift..."

# Build Anchor program
anchor build

# Build frontend
cd frontend
npm run build
cd ..

echo "✅ Build completed!"
