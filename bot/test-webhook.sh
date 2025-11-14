#!/bin/bash

echo "🧪 Testing Farcaster Clanker Bot Webhook..."
echo ""

# Test 1: Health Check
echo "1️⃣ Testing health endpoint..."
HEALTH=$(curl -s http://localhost:3001/health)
echo "Response: $HEALTH"
echo ""

# Test 2: Simulate webhook with deploy command
echo "2️⃣ Testing webhook with deploy command..."
echo "Sending mock cast with command: 'deploy token name WHEN symbol WHEN'"

curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "cast.created",
    "data": {
      "hash": "0xtest123",
      "text": "@bot deploy token name WHEN symbol WHEN",
      "author": {
        "username": "testuser",
        "fid": 12345
      },
      "mentioned_fids": [67890]
    }
  }'

echo ""
echo ""
echo "✅ Test completed! Check logs for bot response:"
echo "   tail -f /app/bot/bot.log"
