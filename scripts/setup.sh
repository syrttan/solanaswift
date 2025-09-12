#!/bin/bash

# SolanaSwift Setup Script
echo "⚙️ SolanaSwift Development Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detect OS
OS="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
fi

echo -e "${BLUE}🖥️ Detected OS: $OS${NC}"

# Install Rust
install_rust() {
    echo -e "${BLUE}🦀 Installing Rust...${NC}"
    
    if command -v rustc &> /dev/null; then
        echo -e "${GREEN}✅ Rust already installed${NC}"
        rustc --version
    else
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source ~/.cargo/env
        echo -e "${GREEN}✅ Rust installed successfully${NC}"
    fi
}

# Install Solana CLI
install_solana() {
    echo -e "${BLUE}☀️ Installing Solana CLI...${NC}"
    
    if command -v solana &> /dev/null; then
        echo -e "${GREEN}✅ Solana CLI already installed${NC}"
        solana --version
    else
        sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
        export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
        echo -e "${GREEN}✅ Solana CLI installed successfully${NC}"
    fi
}

# Install Anchor
install_anchor() {
    echo -e "${BLUE}⚓ Installing Anchor CLI...${NC}"
    
    if command -v anchor &> /dev/null; then
        echo -e "${GREEN}✅ Anchor already installed${NC}"
        anchor --version
    else
        # Install avm (Anchor Version Manager)
        cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
        
        # Install latest anchor
        avm install latest
        avm use latest
        
        echo -e "${GREEN}✅ Anchor installed successfully${NC}"
    fi
}

# Install Node.js (if not present)
install_nodejs() {
    echo -e "${BLUE}📦 Checking Node.js...${NC}"
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo -e "${GREEN}✅ Node.js already installed: $NODE_VERSION${NC}"
    else
        echo -e "${YELLOW}⚠️ Node.js not found. Please install Node.js v18+ from https://nodejs.org/${NC}"
        if [[ "$OS" == "macos" ]]; then
            echo -e "${BLUE}💡 Tip: Use 'brew install node' if you have Homebrew${NC}"
        elif [[ "$OS" == "linux" ]]; then
            echo -e "${BLUE}💡 Tip: Use your package manager (apt, yum, etc.) or visit nodejs.org${NC}"
        fi
        exit 1
    fi
}

# Install project dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Installing project dependencies...${NC}"
    
    # Install root dependencies
    if [ -f "package.json" ]; then
        npm install
        echo -e "${GREEN}✅ Root dependencies installed${NC}"
    fi
    
    # Install frontend dependencies
    if [ -d "frontend" ]; then
        cd frontend
        npm install
        cd ..
        echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
    fi
}

# Setup development environment
setup_dev_env() {
    echo -e "${BLUE}🛠️ Setting up development environment...${NC}"
    
    # Create .env files if they don't exist
    if [ -d "frontend" ] && [ ! -f "frontend/.env.local" ]; then
        cp frontend/.env.local.example frontend/.env.local
        echo -e "${GREEN}✅ Created frontend/.env.local${NC}"
    fi
    
    # Setup Solana config for development
    solana config set --url https://api.devnet.solana.com
    
    # Generate keypair if it doesn't exist
    if [ ! -f ~/.config/solana/id.json ]; then
        echo -e "${YELLOW}🔑 Creating development wallet...${NC}"
        solana-keygen new --outfile ~/.config/solana/id.json --no-bip39-passphrase
    fi
    
    WALLET_ADDRESS=$(solana address)
    echo -e "${GREEN}💰 Development wallet: $WALLET_ADDRESS${NC}"
    
    # Request airdrop for development
    echo -e "${BLUE}💸 Requesting devnet SOL...${NC}"
    solana airdrop 2 || echo -e "${YELLOW}⚠️ Airdrop failed, continuing...${NC}"
}

# Install VS Code extensions
install_vscode_extensions() {
    echo -e "${BLUE}📝 Setting up VS Code extensions...${NC}"
    
    if command -v code &> /dev/null; then
        # Rust extensions
        code --install-extension rust-lang.rust-analyzer
        code --install-extension vadimcn.vscode-lldb
        
        # JavaScript/TypeScript extensions
        code --install-extension bradlc.vscode-tailwindcss
        code --install-extension esbenp.prettier-vscode
        
        # Solana extensions
        code --install-extension solana-labs.solana-developer-tools
        
        echo -e "${GREEN}✅ VS Code extensions installed${NC}"
    else
        echo -e "${YELLOW}⚠️ VS Code not found, skipping extension installation${NC}"
    fi
}

# Create development scripts
create_dev_scripts() {
    echo -e "${BLUE}📝 Creating development scripts...${NC}"
    
    # Create dev script
    cat > dev.sh << 'EOF'
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
EOF

    chmod +x dev.sh
    
    # Create build script
    cat > build.sh << 'EOF'
#!/bin/bash
echo "🔨 Building SolanaSwift..."

# Build Anchor program
anchor build

# Build frontend
cd frontend
npm run build
cd ..

echo "✅ Build completed!"
EOF

    chmod +x build.sh
    
    echo -e "${GREEN}✅ Development scripts created${NC}"
}

# Display final instructions
show_final_instructions() {
    echo ""
    echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Next steps:${NC}"
    echo -e "1. ${YELLOW}Build the program:${NC} anchor build"
    echo -e "2. ${YELLOW}Run tests:${NC} anchor test"
    echo -e "3. ${YELLOW}Deploy to devnet:${NC} ./scripts/deploy.sh"
    echo -e "4. ${YELLOW}Start development:${NC} ./dev.sh"
    echo ""
    echo -e "${BLUE}🔗 Useful commands:${NC}"
    echo -e "• ${YELLOW}anchor build${NC} - Build the program"
    echo -e "• ${YELLOW}anchor test${NC} - Run tests"
    echo -e "• ${YELLOW}anchor deploy${NC} - Deploy to configured cluster"
    echo -e "• ${YELLOW}solana balance${NC} - Check wallet balance"
    echo -e "• ${YELLOW}solana airdrop 1${NC} - Request devnet SOL"
    echo ""
    echo -e "${BLUE}📚 Documentation:${NC}"
    echo -e "• Anchor: https://anchor-lang.com/"
    echo -e "• Solana: https://docs.solana.com/"
    echo ""
    echo -e "${GREEN}🚀 Ready for Solana Day hackathon!${NC}"
}

# Main setup function
main() {
    echo -e "${BLUE}🎯 Starting SolanaSwift setup...${NC}"
    
    install_rust
    install_solana
    install_nodejs
    install_anchor
    install_dependencies
    setup_dev_env
    install_vscode_extensions
    create_dev_scripts
    show_final_instructions
}

# Run main function
main "$@"