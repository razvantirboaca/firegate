#!/bin/bash

echo "🔧 Checking Node version from .nvmrc..."
if [ -f ".nvmrc" ]; then
  NODE_VERSION=$(cat .nvmrc)
  echo "🔍 .nvmrc specifies Node $NODE_VERSION"
  
  if ! nvm ls "$NODE_VERSION" > /dev/null 2>&1; then
    echo "📥 Installing Node $NODE_VERSION..."
    nvm install "$NODE_VERSION"
  fi
  
  echo "🔄 Using Node $NODE_VERSION..."
  nvm use "$NODE_VERSION"
else
  echo "⚠️ No .nvmrc file found!"
fi

echo "📦 Installing dependencies..."
yarn install

echo "✅ Setup complete! Ready to roll 🚀"