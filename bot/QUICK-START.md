# \ud83d\ude80 Quick Start Guide - Farcaster Clanker Bot

## \u2705 Bot Status

**Bot sudah RUNNING dan siap digunakan!**

- \ud83d\udccd Port: 3001
- \ud83d\udcbc Wallet: `0x40095BC8f951284389027c28d0ff70A80B23f096`
- \u26d3\ufe0f Network: Base (Chain ID: 8453)
- \ud83d\udd11 Credentials: Configured

---

## \ud83d\udcdd Apa yang Bot Ini Lakukan?

Bot ini akan:

1. **Listen** ketika ada user mention bot Anda di Farcaster
2. **Parse** command deploy token dari cast
3. **Deploy** token ERC-20 ke Base blockchain via Clanker SDK
4. **Reply** otomatis dengan link Clanker token

---

## \u26a1 Setup dalam 5 Menit

### Step 1: Install ngrok (untuk expose bot ke internet)

```bash
# Download dan install ngrok
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/

# Daftar gratis di https://dashboard.ngrok.com/signup
# Copy authtoken dari dashboard, lalu:
ngrok config add-authtoken YOUR_NGROK_TOKEN
```

### Step 2: Expose Bot

```bash
ngrok http 3001
```

**Copy URL ngrok Anda**, contoh: `https://abc123.ngrok.io`

### Step 3: Setup Webhook di Neynar

1. Buka: https://dev.neynar.com/webhooks
2. Klik **"Create Webhook"**
3. Isi:
   - **Webhook URL**: `https://abc123.ngrok.io/webhook` (ganti dengan URL ngrok Anda)
   - **Event Type**: Pilih `cast.created`
   - **Filters**: 
     ```json
     {
       "mentioned_fids": [YOUR_BOT_FID]
     }
     ```
     *(Ganti YOUR_BOT_FID dengan FID bot Anda dari Warpcast settings)*

4. Klik **Save**

### Step 4: Test Bot!

Mention bot Anda di Farcaster/Warpcast:

```
@yourbotname deploy token name WHEN symbol WHEN
```

Bot akan:
1. Detect mention Anda ✅
2. Deploy token WHEN ke Base ✅  
3. Reply dengan link Clanker ✅

---

## \ud83d\udcb0 Penting: Wallet Balance

**Wallet bot Anda memerlukan ETH di Base network untuk gas fee!**

- Wallet Address: `0x40095BC8f951284389027c28d0ff70A80B23f096`
- Network: **Base** (bukan Ethereum mainnet!)
- Check balance: https://basescan.org/address/0x40095BC8f951284389027c28d0ff70A80B23f096

### Cara Top-up:

1. **Option A: Bridge dari Ethereum**
   - Buka: https://bridge.base.org
   - Bridge ETH dari Ethereum ke Base

2. **Option B: Beli langsung**
   - Gunakan CEX yang support Base (Coinbase, Binance, dll)
   - Withdraw ETH ke address di atas dengan network **Base**

3. **Option C: Faucet (untuk testing)**
   - Base testnet faucet: https://faucet.quicknode.com/base/sepolia
   - ⚠️ Ini untuk testnet, bukan production!

---

## \ud83d\udd27 Bot Management

### Start Bot
```bash
/app/bot/start-bot.sh
```

### Stop Bot
```bash
/app/bot/stop-bot.sh
```

### Check Status
```bash
curl http://localhost:3001/health
```

### View Logs
```bash
tail -f /app/bot/bot.log
```

---

## \ud83d\udcac Command Format

Bot akan respond ke format ini:

```
deploy token name [NAME] symbol [SYMBOL]
```

### Contoh Valid:

✅ `@bot deploy token name WHEN symbol WHEN`
✅ `@bot deploy token name MyToken symbol MTK`
✅ `@bot deploy token name CoolCoin symbol COOL`
✅ `hey @bot can you deploy token name TEST symbol TST please?`

### Contoh Invalid:

❌ `@bot deploy WHEN` (missing "name" dan "symbol" keywords)
❌ `@bot create token WHEN` (harus pakai "deploy token")

---

## \ud83e\udde0 Cara Kerja Bot

```
User mention @bot di Farcaster
         ↓
Neynar Webhook → Bot Server
         ↓
Parse command (extract name & symbol)
         ↓
Deploy token via Clanker SDK
         ↓
Get token address & TX hash
         ↓
Reply to user dengan Clanker link
```

---

## \ud83d\udc1b Troubleshooting

### Bot tidak respond

**1. Check bot running:**
```bash
ps aux | grep "node index.js"
```

**2. Check ngrok tunnel:**
```bash
curl http://localhost:4040/api/tunnels
```
Atau buka: http://localhost:4040

**3. Check webhook di Neynar:**
- Login ke https://dev.neynar.com/webhooks
- Check "Delivery History"
- Pastikan ada request masuk dan status 200

**4. Check bot logs:**
```bash
tail -f /app/bot/bot.log
```

### Deployment gagal

**1. Check wallet balance:**
```bash
curl "https://api.basescan.org/api?module=account&action=balance&address=0x40095BC8f951284389027c28d0ff70A80B23f096&apikey=YourApiKeyToken"
```

Atau visit: https://basescan.org/address/0x40095BC8f951284389027c28d0ff70A80B23f096

**2. Top-up wallet** jika balance 0 atau rendah

**3. Check Clanker SDK error** di bot logs

### Reply tidak muncul

**1. Check Signer UUID valid:**
- Login ke Neynar dashboard
- Verify signer status = "active"

**2. Check Neynar API permissions:**
- Pastikan API key punya permission `cast:write`

---

## \ud83d\udd12 Security Checklist

- ✅ Private key stored in .env (not committed to git)
- ✅ .env file permissions 600 (read/write owner only)
- ✅ Webhook secret configured (optional tapi recommended)
- ✅ ngrok authentication token set
- ⚠️ JANGAN share private key ke siapapun!
- ⚠️ JANGAN commit .env to version control!

---

## \ud83d\udcca Monitoring

### Check Bot Health
```bash
curl http://localhost:3001/health | jq
```

Response:
```json
{
  "status": "ok",
  "bot": "Farcaster Clanker Bot",
  "wallet": "0x40095BC8f951284389027c28d0ff70A80B23f096"
}
```

### Check Recent Deployments
Monitor di:
- Bot logs: `/app/bot/bot.log`
- Basescan: https://basescan.org/address/0x40095BC8f951284389027c28d0ff70A80B23f096
- Clanker: https://clanker.world

---

## \ud83d\udce6 Tech Stack

- **Bot Framework**: Node.js + Express
- **Farcaster SDK**: @neynar/nodejs-sdk
- **Blockchain SDK**: clanker-sdk + viem
- **Network**: Base (EVM-compatible L2)
- **Token Standard**: ERC-20

---

## \ud83d\udcde Support

Jika ada masalah:

1. **Check documentation**: `/app/bot/setup-webhook.md`
2. **Check logs**: `tail -f /app/bot/bot.log`
3. **Check wallet**: https://basescan.org/address/0x40095BC8f951284389027c28d0ff70A80B23f096
4. **Restart bot**: `/app/bot/start-bot.sh`

---

## \ud83c\udf89 Success Criteria

Bot berhasil jika:

- ✅ User mention bot dengan command
- ✅ Bot reply "Deploying token..."
- ✅ Token berhasil deploy ke Base
- ✅ Bot reply dengan Clanker link
- ✅ User bisa view token di Clanker.world

---

## \ud83d\ude80 Next Steps

Setelah bot running:

1. **Test deployment** dengan mention bot
2. **Monitor gas usage** dan top-up wallet jika perlu
3. **Share bot** ke komunitas Farcaster Anda
4. **Track deployments** via Basescan
5. **Scale** dengan tambah rate limiting jika traffic tinggi

---

**Bot sudah siap! Tinggal setup ngrok + webhook, lalu test! \ud83d\ude80**
