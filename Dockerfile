# Multi-stage build for SolanaSwift
FROM rust:1.70 as builder

# Install Solana CLI
RUN sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"
ENV PATH="/root/.local/share/solana/install/active_release/bin:$PATH"

# Install Anchor CLI
RUN cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
RUN avm install latest && avm use latest

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

# Set working directory
WORKDIR /app

# Copy source code
COPY . .

# Build smart contracts
RUN anchor build

# Build frontend
WORKDIR /app/frontend
RUN npm ci
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built frontend
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/frontend/package*.json ./frontend/
COPY --from=builder /app/target ./target

# Install production dependencies
WORKDIR /app/frontend
RUN npm ci --only=production

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]