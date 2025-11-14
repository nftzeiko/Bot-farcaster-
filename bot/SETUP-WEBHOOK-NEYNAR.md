# 🚀 Setup Webhook Neynar - Panduan Lengkap

## ✅ Status Bot

Bot sudah **RUNNING** dan siap menerima webhook!

- 🤖 Mode: **Webhook**
- 💼 Wallet: `0x40095BC8f951284389027c28d0ff70A80B23f096`
- 🌐 ngrok URL: `https://tagmemic-vita-unhinderingly.ngrok-free.dev`
- 📍 Webhook Endpoint: `https://tagmemic-vita-unhinderingly.ngrok-free.dev/webhook`

---

## 📋 Langkah Setup Webhook di Neynar

### Step 1: Login ke Neynar Dashboard

Buka: **https://dev.neynar.com**

Login dengan akun Neynar Anda.

---

### Step 2: Navigate ke Webhooks

Di dashboard, klik menu **"Webhooks"** di sidebar kiri.

Atau langsung buka: **https://dev.neynar.com/webhooks**

---

### Step 3: Create New Webhook

Klik tombol **"+ Create Webhook"** atau **"New Webhook"**

---

### Step 4: Configure Webhook

Isi form dengan detail berikut:

#### **Name** (optional)
```
Farcaster Clanker Bot
```

#### **Webhook URL** ⚠️ PENTING!
```
https://tagmemic-vita-unhinderingly.ngrok-free.dev/webhook
```

**PASTIKAN:**
- ✅ URL diakhiri dengan `/webhook`
- ✅ Menggunakan `https://` (bukan `http://`)
- ✅ URL dari ngrok (bukan localhost)

#### **Event Types** - Pilih Event

Centang: **`cast.created`**

Ini akan trigger webhook setiap ada cast baru yang match filter Anda.

#### **Filters** ⚠️ PENTING!

Anda perlu setup filter agar bot hanya menerima mention ke bot Anda.

**Ada 2 cara:**

##### Option A: Filter by mentioned_fids (Recommended)

Tambahkan filter untuk detect mention:

```json
{
  "mentioned_fids": [FID_BOT_ANDA]
}
```

**Cara cek FID bot Anda:**
1. Login ke https://warpcast.com
2. Klik profile Anda
3. Klik Settings
4. FID tercantum di halaman settings (contoh: 12345)

Ganti `FID_BOT_ANDA` dengan angka FID Anda.

**Contoh:**
```json
{
  "mentioned_fids": [12345]
}
```

##### Option B: Filter by parent_author_fids (untuk replies)

Jika Anda ingin detect replies ke cast bot:

```json
{
  "parent_author_fids": [FID_BOT_ANDA]
}
```

##### Option C: Kombinasi (Most Comprehensive)

```json
{
  "mentioned_fids": [FID_BOT_ANDA],
  "parent_author_fids": [FID_BOT_ANDA]
}
```

#### **Webhook Secret** (Optional tapi Recommended)

Generate random secret string untuk security:

```
my-secret-webhook-key-12345
```

Save secret ini di `/app/bot/.env`:
```env
WEBHOOK_SECRET=my-secret-webhook-key-12345
```

---

### Step 5: Save Webhook

Klik tombol **"Create"** atau **"Save"**

Neynar akan:
1. Validate URL Anda
2. Send test ping
3. Show webhook status

---

### Step 6: Verify Setup

#### Test 1: Check Webhook Status

Di Neynar dashboard, webhook status harus:
- ✅ **Active** (hijau)
- ✅ **Last delivered**: (timestamp terbaru)

#### Test 2: Check Bot Logs

```bash
tail -f /app/bot/bot.log
```

Harus muncul:
```
📨 Webhook received: webhook.test
```

#### Test 3: Test di Farcaster

Mention bot Anda di Warpcast:

```
@yourbotname deploy token name TEST symbol TST
```

Check logs, harus muncul:
```
📨 Webhook received: cast.created
💬 Cast from @yourname: @yourbotname deploy token name TEST symbol TST
✅ Valid deploy command detected
   Token Name: TEST
   Token Symbol: TST
```

---

## 🔍 Cara Mendapatkan FID Bot

### Method 1: Via Warpcast Settings

1. Buka https://warpcast.com
2. Login dengan account bot
3. Klik profile picture → Settings
4. FID tercantum di halaman settings
5. Copy angka FID (contoh: 12345)

### Method 2: Via Neynar API

```bash
curl -X GET "https://api.neynar.com/v2/farcaster/user/by_username?username=BOTUSERNAME" \
  -H "api_key: YOUR_NEYNAR_API_KEY"
```

FID ada di response JSON.

### Method 3: Via Bot Console

Saat bot start, FID akan di-print di console (jika sudah implement).

---

## 🧪 Testing Webhook

### Test 1: Manual Test via curl

```bash
curl -X POST https://tagmemic-vita-unhinderingly.ngrok-free.dev/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "cast.created",
    "data": {
      "hash": "0xtest123",
      "text": "@bot deploy token name WHEN symbol WHEN",
      "author": {
        "username": "testuser",
        "fid": 12345
      }
    }
  }'
```

### Test 2: Check ngrok Inspector

Buka: http://localhost:4040

Ini akan show semua HTTP requests yang masuk ke bot via ngrok.

### Test 3: Production Test

1. Mention bot di Farcaster
2. Wait 1-2 detik
3. Check bot logs
4. Check bot reply di Farcaster

---

## ⚠️ PENTING: Wallet Balance

**Bot memerlukan ETH di Base network untuk deploy token!**

Check balance:
```
https://basescan.org/address/0x40095BC8f951284389027c28d0ff70A80B23f096
```

Jika balance 0 atau rendah:

### Cara Top-up ETH ke Base

#### Option 1: Bridge dari Ethereum
1. Buka https://bridge.base.org
2. Connect wallet
3. Bridge ETH dari Ethereum → Base
4. Send ke: `0x40095BC8f951284389027c28d0ff70A80B23f096`

#### Option 2: CEX (Coinbase, Binance)
1. Withdraw ETH dari exchange
2. Select network: **Base**
3. Address: `0x40095BC8f951284389027c28d0ff70A80B23f096`

#### Option 3: Buy directly on Base
Gunakan services seperti:
- https://www.relay.link
- https://jumper.exchange

---

## 🚨 Troubleshooting

### Webhook tidak receive events

**Check 1: Webhook Active?**
```
Login ke Neynar dashboard → Webhooks → Check status
```

**Check 2: URL correct?**
```
https://tagmemic-vita-unhinderingly.ngrok-free.dev/webhook
                                                  ^^^^^^^^ 
                                                  JANGAN LUPA!
```

**Check 3: ngrok running?**
```bash
curl http://localhost:4040/api/tunnels
```

**Check 4: Bot running?**
```bash
curl http://localhost:3001/health
```

**Check 5: Filter configured?**
```
Check Neynar webhook settings → Filters → mentioned_fids set?
```

### Bot tidak reply

**Check 1: Wallet balance**
```
https://basescan.org/address/0x40095BC8f951284389027c28d0ff70A80B23f096
```

**Check 2: Signer UUID valid**
```bash
# Check di .env
cat /app/bot/.env | grep SIGNER_UUID
```

**Check 3: Neynar API key**
```bash
# Test API key
curl -X GET "https://api.neynar.com/v2/farcaster/user/bulk?fids=3" \
  -H "api_key: YOUR_KEY"
```

**Check 4: Bot logs**
```bash
tail -f /app/bot/bot.log
```

Look for errors.

### Deployment failed

**Error: "insufficient funds"**
```
→ Top-up wallet dengan ETH di Base network
```

**Error: "invalid signer"**
```
→ Check Signer UUID di Neynar dashboard
→ Verify signer is active
```

**Error: "rate limit"**
```
→ Upgrade Neynar plan atau wait
```

### ngrok URL changed

ngrok free plan generates new URL setiap restart.

**Fix:**
1. Get new ngrok URL: `curl http://localhost:4040/api/tunnels`
2. Update webhook di Neynar dashboard
3. Test again

**Permanent fix:**
- Upgrade to ngrok paid plan ($8/mo)
- Get fixed domain
- No need update webhook setiap restart

---

## 📊 Monitoring

### Check Bot Status
```bash
curl http://localhost:3001/health
```

### View Logs
```bash
tail -f /app/bot/bot.log
```

### Check ngrok Traffic
```
http://localhost:4040
```

### Check Webhook Deliveries
```
Neynar Dashboard → Webhooks → [Your Webhook] → Delivery History
```

---

## ✅ Setup Checklist

Before going live:

- [ ] Bot running: `curl http://localhost:3001/health`
- [ ] ngrok running: `curl http://localhost:4040/api/tunnels`
- [ ] Webhook configured di Neynar
- [ ] Filter `mentioned_fids` set dengan FID bot
- [ ] Test webhook received di logs
- [ ] Wallet has ETH balance on Base
- [ ] Test deploy command di Farcaster
- [ ] Bot reply successful

---

## 🎉 Success!

Setelah semua setup, workflow Anda:

```
User mention @bot di Farcaster
         ↓
Neynar send webhook to bot
         ↓
Bot parse command
         ↓
Bot deploy token via Clanker
         ↓
Bot reply dengan Clanker link
         ↓
User terima link token!
```

**Bot siap digunakan! 🚀**

---

## 📞 Quick Commands

```bash
# Start bot
cd /app/bot && node bot.js &

# Stop bot
pkill -f "node bot.js"

# Restart bot
pkill -f "node bot.js" && cd /app/bot && node bot.js &

# View logs
tail -f /app/bot/bot.log

# Start ngrok
ngrok http 3001

# Stop ngrok
pkill ngrok

# Check health
curl http://localhost:3001/health

# Check ngrok URL
curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['tunnels'][0]['public_url'])"
```

---

**Happy Deploying! 🎊**
