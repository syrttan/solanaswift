#!/bin/bash
echo "🚀 Starting SolanaSwift development environment..."

# Start local validator in background
solana-test-validator --reset &
VALIDATOR_PID=$!

# Wait for validator to start
sleep 5

# Build and deploy program
echo "📦 Building program..."
anchor build

echo "🚀 Deploying program..."
anchor deploy

# Start frontend
echo "🖥️ Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Development environment ready!"
echo "📱 Frontend: http://localhost:3000"
echo "⚓ Anchor tests: anchor test --skip-local-validator"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for interrupt
trap "kill $VALIDATOR_PID $FRONTEND_PID; exit" INT
wait
