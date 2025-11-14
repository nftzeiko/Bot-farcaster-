# ✅ Solusi untuk Neynar Free Plan

## Masalah
Neynar free plan **tidak support webhook** di dashboard.

## Solusi: Manual Deployment dengan Web Interface

Bot sekarang running dengan **Manual Mode** - Anda deploy token via web interface yang user-friendly!

---

## 🚀 Cara Kerja

### 1. User Mention Bot di Farcaster

User mention bot Anda dengan command:
```
@yourbotname deploy token name WHEN symbol WHEN
```

### 2. Anda Buka Web Interface

Buka: **https://tagmemic-vita-unhinderingly.ngrok-free.dev**

Atau local: **http://localhost:3001**

### 3. Copy Cast Hash (Optional)

- Buka cast dari user di Warpcast
- Copy Cast Hash (format: 0x...)
- Paste di form "Cast Hash"

### 4. Deploy Token

- Isi Token Name: **WHEN**
- Isi Token Symbol: **WHEN**  
- Klik **Deploy Token**

### 5. Bot Auto-Reply!

Bot akan:
1. ✅ Deploy token ke Base via Clanker
2. ✅ Reply ke cast user dengan link Clanker
3. ✅ User dapat link token langsung!

---

## 🌐 Access Web Interface

### Public URL (via ngrok):
```
https://tagmemic-vita-unhinderingly.ngrok-free.dev
```

### Local URL:
```
http://localhost:3001
```

---

## 📝 Cara Mendapatkan Cast Hash

### Method 1: Dari Warpcast Web
1. Buka cast dari user
2. Klik "..." (more options)
3. Copy link
4. Hash ada di akhir URL: `https://warpcast.com/username/0x1234...`
5. Copy bagian `0x1234...`

### Method 2: Dari Warpcast Mobile
1. Long press cast
2. "Copy link"
3. Paste, ambil hash di akhir

### Method 3: Skip Cast Hash
- Jika tidak provide Cast Hash, token tetap deploy
- Tapi bot tidak auto-reply ke user
- Anda manually share link ke user

---

## 💡 Tips & Best Practices

### 1. Response Time
- Deploy biasanya 1-2 menit
- Tidak perlu refresh page, status auto-update

### 2. Wallet Balance
⚠️ **PENTING**: Wallet harus punya ETH di Base!

Check balance:
```
https://basescan.org/address/0x40095BC8f951284389027c28d0ff70A80B23f096
```

Jika balance 0, top-up ETH ke wallet di Base network.

### 3. Multiple Requests
- Web interface bisa handle multiple deployments
- Process satu per satu untuk stability

### 4. Sharing Link
Setelah deploy success, share link ini ke user:
- Clanker page: `https://clanker.world/clanker/0x...`
- Basescan TX: `https://basescan.org/tx/0x...`

---

## 🔧 Bot Management

### Start Bot
```bash
cd /app/bot
node server.js &
```

### Stop Bot
```bash
pkill -f "node server.js"
```

### Check Status
```bash
curl http://localhost:3001/api/health
```

### View Logs
```bash
tail -f /app/bot/bot.log
```

### Restart ngrok
```bash
ngrok http 3001
```

---

## 🎯 Workflow Lengkap

```
User → Mention @bot di Farcaster
         ↓
Anda   → Copy Cast Hash
         ↓
Anda   → Buka web interface
         ↓
Anda   → Isi form & deploy
         ↓
Bot    → Deploy token via Clanker
         ↓
Bot    → Reply ke cast user
         ↓
User   → Terima link Clanker!
```

---

## ✅ Keunggulan Solusi Ini

1. ✅ **Tidak perlu webhook** - bypass limitasi Neynar free plan
2. ✅ **User-friendly** - web interface yang mudah
3. ✅ **Kontrol penuh** - Anda yang approve deployment
4. ✅ **Auto-reply** - bot tetap reply ke cast user
5. ✅ **Deployment history** - track semua deployment
6. ✅ **Free** - tidak perlu upgrade Neynar plan

---

## 🚨 Troubleshooting

### Web interface tidak bisa diakses
```bash
# Check bot running
ps aux | grep "node server.js"

# Restart bot
cd /app/bot && node server.js &
```

### ngrok URL tidak work
```bash
# Restart ngrok
pkill ngrok
ngrok http 3001

# Get new URL
curl -s http://localhost:4040/api/tunnels
```

### Deployment failed
1. Check wallet balance di Base
2. Check bot logs: `tail -f /app/bot/bot.log`
3. Verify credentials di .env

### Reply tidak muncul di Farcaster
1. Verify Cast Hash correct
2. Check Neynar API key valid
3. Check Signer UUID active

---

## 📞 Support

Files penting:
- `/app/bot/server.js` - Main bot code
- `/app/bot/public/index.html` - Web interface
- `/app/bot/.env` - Credentials
- `/app/bot/bot.log` - Logs

Bot sudah **READY** dan **WORKING**! 🎉

Tinggal:
1. Top-up wallet dengan ETH di Base
2. Share public URL ke team
3. Deploy token untuk users!
