# 🤖 @warpdeploy Bot - Commands Guide

## Bot Overview

**@warpdeploy** is an automated token deployment bot powered by Clanker SDK. All responses are in **English only**.

---

## 📝 Available Commands

### 1. Deploy Token
```
@warpdeploy deploy token name [NAME] symbol [SYMBOL]
```

**With Image:**
```
@warpdeploy deploy token name PEPE symbol PEPE
[Attach: logo.png]
```

**Response:**
```
🚀 Deploying token PEPE (PEPE) with your image on Base... Please wait!

[2 minutes later]

✅ Token PEPE deployed successfully with image!

🔗 Clanker: https://clanker.world/clanker/0x...
📜 Contract: 0x...
⛓️ TX: https://basescan.org/tx/0x...
🖼️ Image: Uploaded to IPFS
```

---

### 2. Help Command
```
@warpdeploy help
```

**Response:**
```
👋 Hi! I'm @warpdeploy - a token deployment bot via Clanker SDK.

Commands:
• deploy token name [NAME] symbol [SYMBOL] - Deploy ERC-20 token
• help - Show this message
• status - Check bot status
• history - Recent deployments
• about - Learn about me

💡 Tip: Attach an image for token logo!
```

---

### 3. Status Command
```
@warpdeploy status
```

**Response:**
```
✅ Status: Online & Ready

💼 Wallet: 0x4009...096
⚡ Balance: 0.0500 ETH
⛽ Gas Price: 0.02 gwei
🔋 Network: Base
🖼️ IPFS: Enabled

Total Deployments: 5
```

---

### 4. History Command
```
@warpdeploy history
```

**Response:**
```
📊 Recent Deployments:

1. PEPE (PEPE) 🖼️
   0x123456...abcdef
2. MEME (MEME)
   0x789012...345678
3. TEST (TST) 🖼️
   0xabcdef...123456

Total: 5 tokens deployed
```

---

### 5. About Command
```
@warpdeploy about
```

**Response:**
```
🤖 About @warpdeploy:

I'm an automated token deployment bot powered by Clanker SDK. I help you deploy ERC-20 tokens on Base blockchain instantly!

Features:
✅ Deploy tokens in seconds
✅ Support custom token logos (IPFS)
✅ Automatic liquidity on Uniswap V3
✅ No coding required

Built with: Clanker SDK, Neynar API, Pinata IPFS
Network: Base (Layer 2)
```

---

### 6. Gas Price Query
```
@warpdeploy gas
```

**Response:**
```
⛽ Current Gas Price on Base:

0.02 gwei

Estimated deployment cost: ~0.001 ETH
Network: Base (cheap & fast L2)
```

---

### 7. Balance Query
```
@warpdeploy balance
```

**Response:**
```
💼 Bot Wallet Info:

Address: 0x40095BC8...b23f096
Balance: 0.0500 ETH
Network: Base

View on BaseScan:
https://basescan.org/address/0x40095BC8f951284389027c28d0ff70A80B23f096
```

---

## 🤔 Q&A Responses

### "What is @warpdeploy?"
```
🤖 About @warpdeploy:

I'm an automated token deployment bot powered by Clanker SDK. I help you deploy ERC-20 tokens on Base blockchain instantly!

Features:
✅ Deploy tokens in seconds
✅ Support custom token logos (IPFS)
✅ Automatic liquidity on Uniswap V3
✅ No coding required

Built with: Clanker SDK, Neynar API, Pinata IPFS
Network: Base (Layer 2)
```

### "What is Clanker?"
```
🔧 What is Clanker?

Clanker is a protocol for deploying ERC-20 tokens on Base blockchain with:

✅ Instant deployment
✅ Automatic Uniswap V3 liquidity
✅ Fixed max supply (100B tokens)
✅ Permanent liquidity lock
✅ Creator fee rewards (0.4% volume)

Learn more: https://clanker.world
```

### "How do I deploy?"
```
📝 How to Deploy a Token:

1. Mention me with:
   @warpdeploy deploy token name [YOUR_NAME] symbol [SYMBOL]

2. (Optional) Attach an image for token logo

3. Wait 1-2 minutes for deployment

4. Get your Clanker link!

Example:
@warpdeploy deploy token name PEPE symbol PEPE
[Attach: logo.png]
```

### "How much does it cost?"
```
💰 Deployment Cost:

Gas Fee: ~0.001 ETH (~$2-3)
Bot Fee: FREE
Network: Base (cheap L2)

You only pay blockchain gas fees!

Note: I need ETH in my wallet for deployment. Make sure to have sufficient balance.
```

---

## ❌ Invalid Command

If user mentions bot without valid command:

```
User: @warpdeploy hello
```

**Response:**
```
🤔 I didn't understand that command.

Try:
• help - Show available commands
• deploy token name X symbol Y - Deploy a token
• status - Check bot status

Need help? Type: @warpdeploy help
```

---

## 📊 Command Examples

### Example 1: Deploy Simple Token
```
User: @warpdeploy deploy token name MYCOIN symbol MYC

Bot:  🚀 Deploying token MYCOIN (MYC) on Base... Please wait!
      
      [2 min later]
      
      ✅ Token MYCOIN deployed successfully!
      
      🔗 Clanker: https://clanker.world/clanker/0x...
      📜 Contract: 0x...
      ⛓️ TX: https://basescan.org/tx/0x...
```

### Example 2: Deploy with Logo
```
User: @warpdeploy deploy token name PEPE symbol PEPE
      [Attach: pepe.png]

Bot:  🚀 Deploying token PEPE (PEPE) with your image on Base... Please wait!
      
      [2 min later]
      
      ✅ Token PEPE deployed successfully with image!
      
      🔗 Clanker: https://clanker.world/clanker/0x...
      📜 Contract: 0x...
      ⛓️ TX: https://basescan.org/tx/0x...
      🖼️ Image: Uploaded to IPFS
```

### Example 3: Check Status
```
User: @warpdeploy status

Bot:  ✅ Status: Online & Ready
      
      💼 Wallet: 0x4009...096
      ⚡ Balance: 0.0500 ETH
      ⛽ Gas Price: 0.02 gwei
      🔋 Network: Base
      🖼️ IPFS: Enabled
      
      Total Deployments: 3
```

### Example 4: Get Help
```
User: @warpdeploy help

Bot:  👋 Hi! I'm @warpdeploy - a token deployment bot via Clanker SDK.
      
      Commands:
      • deploy token name [NAME] symbol [SYMBOL] - Deploy ERC-20 token
      • help - Show this message
      • status - Check bot status
      • history - Recent deployments
      • about - Learn about me
      
      💡 Tip: Attach an image for token logo!
```

### Example 5: Ask Question
```
User: @warpdeploy what is clanker?

Bot:  🔧 What is Clanker?
      
      Clanker is a protocol for deploying ERC-20 tokens on Base blockchain with:
      
      ✅ Instant deployment
      ✅ Automatic Uniswap V3 liquidity
      ✅ Fixed max supply (100B tokens)
      ✅ Permanent liquidity lock
      ✅ Creator fee rewards (0.4% volume)
      
      Learn more: https://clanker.world
```

---

## 🎯 Key Points

### Language
- ✅ All responses in **English only**
- ✅ No Indonesian responses
- ✅ Professional tone

### Bot Identity
- Name: **@warpdeploy**
- Purpose: Token deployment via Clanker SDK
- Network: Base (Layer 2)
- Features: Image upload, IPFS, Smart Q&A

### Response Format
- Clear and concise
- Emojis for visual clarity
- Structured information
- Action-oriented

---

## 🚀 Testing Commands

```bash
# Test help
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "cast.created",
    "data": {
      "hash": "0xtest1",
      "text": "@warpdeploy help",
      "author": {"username": "testuser"},
      "embeds": []
    }
  }'

# Test status
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "cast.created",
    "data": {
      "hash": "0xtest2",
      "text": "@warpdeploy status",
      "author": {"username": "testuser"},
      "embeds": []
    }
  }'

# Test deploy
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "cast.created",
    "data": {
      "hash": "0xtest3",
      "text": "@warpdeploy deploy token name TEST symbol TST",
      "author": {"username": "testuser"},
      "embeds": []
    }
  }'
```

---

## 📞 Bot Management

```bash
# Start bot
cd /app/bot && node bot-smart.js &

# Stop bot
pkill -f "bot-smart"

# View logs
tail -f /app/bot/bot-smart.log

# Check health
curl http://localhost:3001/health
```

---

**Bot ready to answer questions & deploy tokens! 🚀**
