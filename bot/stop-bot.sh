#!/bin/bash

echo "🛑 Stopping Farcaster Clanker Bot..."

PID=$(ps aux | grep "node index.js" | grep -v grep | awk '{print $2}')

if [ -z "$PID" ]; then
    echo "ℹ️  Bot is not running"
    exit 0
fi

echo "Killing process $PID..."
kill $PID

sleep 2

if ps -p $PID > /dev/null; then
    echo "⚠️  Process still running, forcing kill..."
    kill -9 $PID
    sleep 1
fi

if ! ps -p $PID > /dev/null 2>&1; then
    echo "✅ Bot stopped successfully"
else
    echo "❌ Failed to stop bot"
    exit 1
fi
