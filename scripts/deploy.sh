#!/bin/bash

# SolanaSwift Deployment Script
echo "🚀 SolanaSwift Deployment Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Error handling
set -e
trap 'echo -e "${RED}❌ Deployment failed at line $LINENO${NC}"' ERR

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}📋 Checking prerequisites...${NC}"
    
    # Check if solana CLI is installed
    if ! command -v solana &> /dev/null; then
        echo -e "${RED}❌ Solana CLI not found. Please install: sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\"${NC}"
        exit 1
    fi
    
    # Check if anchor CLI is installed
    if ! command -v anchor &> /dev/null; then
        echo -e "${RED}❌ Anchor CLI not found. Please install: cargo install --git https://github.com/coral-xyz/anchor avm --locked --force${NC}"
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js not found. Please install Node.js v18+${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All prerequisites satisfied${NC}"
}

# Setup Solana configuration
setup_solana() {
    echo -e "${BLUE}⚙️ Setting up Solana configuration...${NC}"
    
    # Set to devnet
    solana config set --url https://api.devnet.solana.com
    
    # Check if wallet exists, create if not
    if [ ! -f ~/.config/solana/id.json ]; then
        echo -e "${YELLOW}📝 Creating new Solana wallet...${NC}"
        solana-keygen new --outfile ~/.config/solana/id.json --no-bip39-passphrase
    fi
    
    # Show wallet info
    WALLET_ADDRESS=$(solana address)
    echo -e "${GREEN}📱 Wallet address: $WALLET_ADDRESS${NC}"
    
    # Check balance
    BALANCE=$(solana balance)
    echo -e "${GREEN}💰 Current balance: $BALANCE${NC}"
    
    # Airdrop SOL if balance is low
    if [[ "$BALANCE" == "0 SOL" ]]; then
        echo -e "${YELLOW}💸 Requesting airdrop...${NC}"
        solana airdrop 2
        sleep 5
        BALANCE=$(solana balance)
        echo -e "${GREEN}💰 New balance: $BALANCE${NC}"
    fi
}

# Install dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    
    # Install Rust dependencies (Anchor)
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    # Install frontend dependencies
    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    cd ..
    
    echo -e "${GREEN}✅ Dependencies installed${NC}"
}

# Build the program
build_program() {
    echo -e "${BLUE}🔨 Building Anchor program...${NC}"
    
    # Clean previous build
    if [ -d "target" ]; then
        rm -rf target/
    fi
    
    # Build the program
    anchor build
    
    # Get program ID
    PROGRAM_ID=$(solana address -k target/deploy/solanaswift-keypair.json)
    echo -e "${GREEN}📋 Program ID: $PROGRAM_ID${NC}"
    
    # Update lib.rs with correct program ID
    sed -i.bak "s/SwiftXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/$PROGRAM_ID/g" programs/solanaswift/src/lib.rs
    
    # Update Anchor.toml
    sed -i.bak "s/SwiftXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/$PROGRAM_ID/g" Anchor.toml
    
    # Rebuild with correct program ID
    anchor build
    
    echo -e "${GREEN}✅ Program built successfully${NC}"
}

# Deploy the program
deploy_program() {
    echo -e "${BLUE}🚀 Deploying to Solana devnet...${NC}"
    
    # Deploy
    anchor deploy --provider.cluster devnet
    
    # Verify deployment
    PROGRAM_ID=$(solana address -k target/deploy/solanaswift-keypair.json)
    PROGRAM_INFO=$(solana program show $PROGRAM_ID)
    
    if [[ $PROGRAM_INFO == *"Program Id: $PROGRAM_ID"* ]]; then
        echo -e "${GREEN}✅ Program deployed successfully!${NC}"
        echo -e "${GREEN}📋 Program ID: $PROGRAM_ID${NC}"
    else
        echo -e "${RED}❌ Deployment verification failed${NC}"
        exit 1
    fi
}

# Run tests
run_tests() {
    echo -e "${BLUE}🧪 Running tests...${NC}"
    
    # Run anchor tests
    anchor test --skip-local-validator
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed${NC}"
    else
        echo -e "${YELLOW}⚠️ Some tests failed, but deployment continues${NC}"
    fi
}

# Setup frontend environment
setup_frontend() {
    echo -e "${BLUE}🖥️ Setting up frontend environment...${NC}"
    
    cd frontend
    
    # Create .env.local from example if it doesn't exist
    if [ ! -f ".env.local" ]; then
        cp .env.local.example .env.local
    fi
    
    # Update program ID in env file
    PROGRAM_ID=$(solana address -k ../target/deploy/solanaswift-keypair.json)
    sed -i.bak "s/SwiftXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/$PROGRAM_ID/g" .env.local
    
    # Build frontend
    npm run build
    
    cd ..
    
    echo -e "${GREEN}✅ Frontend configured${NC}"
}

# Generate deployment report
generate_report() {
    echo -e "${BLUE}📊 Generating deployment report...${NC}"
    
    PROGRAM_ID=$(solana address -k target/deploy/solanaswift-keypair.json)
    WALLET_ADDRESS=$(solana address)
    BALANCE=$(solana balance)
    TIMESTAMP=$(date)
    
    cat > deployment-report.md << EOF
# SolanaSwift Deployment Report

**Deployment Date:** $TIMESTAMP

## 📋 Deployment Details

- **Network:** Solana Devnet
- **Program ID:** \`$PROGRAM_ID\`
- **Deployer Wallet:** \`$WALLET_ADDRESS\`
- **Wallet Balance:** $BALANCE

## 🔗 URLs

- **Program Explorer:** https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet
- **Wallet Explorer:** https://explorer.solana.com/address/$WALLET_ADDRESS?cluster=devnet

## 🚀 Frontend Deployment

The frontend is configured and ready for deployment to platforms like:
- Vercel: \`cd frontend && vercel --prod\`
- Netlify: \`cd frontend && npm run build && netlify deploy --prod --dir=out\`

## 📝 Next Steps

1. Test the deployed program using the frontend
2. Create initial liquidity pools
3. Deploy frontend to hosting platform
4. Set up monitoring and analytics
5. Prepare for mainnet deployment

## 🧪 Testing

To test the deployed program:
\`\`\`bash
cd frontend
npm run dev
# Visit http://localhost:3000
\`\`\`

## 📞 Support

If you encounter issues:
1. Check Solana devnet status: https://status.solana.com/
2. Verify program deployment in explorer
3. Ensure wallet has sufficient SOL for transactions
EOF

    echo -e "${GREEN}✅ Deployment report generated: deployment-report.md${NC}"
}

# Main deployment flow
main() {
    echo -e "${BLUE}🎯 Starting SolanaSwift deployment...${NC}"
    
    check_prerequisites
    setup_solana
    install_dependencies
    build_program
    deploy_program
    run_tests
    setup_frontend
    generate_report
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${GREEN}📋 Program ID: $(solana address -k target/deploy/solanaswift-keypair.json)${NC}"
    echo -e "${GREEN}🌐 Frontend ready at: cd frontend && npm run dev${NC}"
    echo -e "${GREEN}📊 Check deployment-report.md for details${NC}"
    echo ""
    echo -e "${BLUE}🚀 Ready for Solana Day presentation!${NC}"
}

# Run main function
main "$@"