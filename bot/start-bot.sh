#!/bin/bash

echo "🤖 Starting Farcaster Clanker Bot..."

# Change to bot directory
cd /app/bot

# Check if dependencies installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    yarn install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with required credentials."
    exit 1
fi

# Kill existing bot process if running
PID=$(ps aux | grep "node index.js" | grep -v grep | awk '{print $2}')
if [ ! -z "$PID" ]; then
    echo "🛑 Stopping existing bot (PID: $PID)..."
    kill $PID
    sleep 2
fi

# Start bot in background
echo "🚀 Starting bot..."
nohup node index.js > bot.log 2>&1 &
NEW_PID=$!

sleep 2

# Check if bot started successfully
if ps -p $NEW_PID > /dev/null; then
    echo "✅ Bot started successfully (PID: $NEW_PID)"
    echo "📊 Wallet Address: $(curl -s http://localhost:3001/health | grep -o '0x[a-fA-F0-9]\{40\}')"
    echo ""
    echo "📝 Next steps:"
    echo "1. Setup ngrok: ngrok http 3001"
    echo "2. Configure Neynar webhook with ngrok URL"
    echo "3. Test by mentioning bot in Farcaster"
    echo ""
    echo "📋 Logs: tail -f /app/bot/bot.log"
    echo "🏥 Health: curl http://localhost:3001/health"
else
    echo "❌ Failed to start bot"
    echo "Check logs: cat /app/bot/bot.log"
    exit 1
fi
