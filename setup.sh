#!/bin/bash

# Install pnpm if not already installed
if ! command -v pnpm &> /dev/null; then
    echo "pnpm not found, installing..."
    npm install -g pnpm
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Setup complete
echo "Setup complete! You can now run the following commands:"
echo "- pnpm dev: Start both frontend and backend in development mode"
echo "- pnpm dev --filter=web: Start only the frontend"
echo "- pnpm dev --filter=api: Start only the backend"
echo "- pnpm build: Build all applications"
echo "- pnpm start: Start all applications in production mode" 