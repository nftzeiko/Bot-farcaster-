# Setup Webhook Neynar untuk Bot

## Status Bot

✅ Bot sudah running di port **3001**
✅ Wallet Address: **0x40095BC8f951284389027c28d0ff70A80B23f096**

## Langkah Setup Webhook

### Option 1: Testing dengan ngrok (Recommended untuk Testing)

#### 1. Install ngrok

```bash
# Download ngrok
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Or download binary
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/
```

#### 2. Setup ngrok Token (Gratis)

1. Daftar di https://dashboard.ngrok.com/signup
2. Copy authtoken dari dashboard
3. Run:

```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

#### 3. Expose Bot ke Internet

```bash
ngrok http 3001
```

Output akan seperti ini:
```
Forwarding   https://abc123.ngrok.io -> http://localhost:3001
```

**Copy URL ngrok Anda**, contoh: `https://abc123.ngrok.io`

---

### Option 2: Production dengan Public Server

Jika Anda punya server dengan public IP atau domain:

1. Setup nginx reverse proxy ke port 3001
2. Enable HTTPS dengan Let's Encrypt
3. Gunakan URL: `https://yourdomain.com/webhook`

---

## Setup Webhook di Neynar

### 1. Login ke Neynar Developer Portal

Buka: https://dev.neynar.com/webhooks

### 2. Create New Webhook

Klik **"Create Webhook"** dan isi:

#### Basic Settings:
- **Name**: Farcaster Clanker Bot
- **Description**: Auto deploy token via Clanker

#### Webhook URL:
- Jika pakai ngrok: `https://abc123.ngrok.io/webhook`
- Jika production: `https://yourdomain.com/webhook`

#### Event Type:
✅ Pilih: **`cast.created`**

#### Filters (PENTING!):

Anda perlu setup filter agar bot hanya listen mention ke account bot Anda:

**Option A: Filter by mentioned_fids**
1. Cari FID (Farcaster ID) bot Anda di https://warpcast.com/~/settings
2. Tambahkan di filter: `mentioned_fids: [YOUR_BOT_FID]`

Contoh:
```json
{
  "mentioned_fids": [12345]
}
```

**Option B: Filter by author_fids (jika hanya ingin dari user tertentu)**
```json
{
  "author_fids": [12345, 67890]
}
```

#### Webhook Secret (Optional tapi Recommended):
- Generate secret random string
- Simpan di `/app/bot/.env` sebagai `WEBHOOK_SECRET`
- Gunakan untuk verify webhook signature

### 3. Test Webhook

Setelah save webhook, Neynar akan send test ping.

Cek di terminal bot Anda, harusnya muncul:
```
📩 Webhook received: webhook.test
```

### 4. Verify Setup

1. Mention bot Anda di Farcaster:
   ```
   @yourbotname deploy token name WHEN symbol WHEN
   ```

2. Check logs di terminal bot:
   ```bash
   # Di server bot
   tail -f /app/bot/bot.log
   ```

3. Bot seharusnya:
   - ✅ Detect mention
   - ✅ Parse command
   - ✅ Deploy token
   - ✅ Reply dengan Clanker link

---

## Troubleshooting

### Bot tidak respond ke mention

**1. Check webhook receiving events:**
```bash
curl http://localhost:3001/health
```

**2. Check ngrok tunnel:**
```bash
# Access ngrok dashboard
http://localhost:4040
```

**3. Check bot logs:**
```bash
ps aux | grep "node index.js"
```

**4. Verify Neynar webhook:**
- Login ke https://dev.neynar.com/webhooks
- Check webhook status (should be "Active")
- Check delivery history
- Look for failed deliveries

### Deployment failed

**1. Check wallet balance:**
```bash
# Wallet address: 0x40095BC8f951284389027c28d0ff70A80B23f096
# Visit: https://basescan.org/address/0x40095BC8f951284389027c28d0ff70A80B23f096
# Pastikan ada ETH untuk gas fee
```

**2. Top-up wallet:**
Kirim ETH ke: `0x40095BC8f951284389027c28d0ff70A80B23f096` di Base network

**3. Check Clanker SDK logs:**
Lihat error di console bot

### Reply tidak muncul

**1. Verify Signer UUID:**
Check di Neynar dashboard apakah signer active

**2. Check API permissions:**
Pastikan Neynar API key punya permission untuk `publishCast`

---

## Command Examples

Setelah webhook setup, mention bot dengan format:

```
@yourbotname deploy token name WHEN symbol WHEN
```

Contoh lain:
```
@yourbotname deploy token name MyToken symbol MTK
@yourbotname deploy token name CoolCoin symbol COOL  
@yourbotname deploy token name MemeToken symbol MEME
```

Bot akan reply dengan:
```
✅ Token WHEN deployed successfully!

🔗 Clanker: https://clanker.world/clanker/0x...
📜 Contract: 0x...
⛓️ TX: https://basescan.org/tx/0x...
```

---

## Security Notes

⚠️ **PENTING:**

1. **Private Key**: JANGAN share private key di .env ke siapapun
2. **Webhook Secret**: Gunakan webhook secret untuk verify requests
3. **Rate Limiting**: Implement rate limiting jika bot jadi populer
4. **Gas Management**: Monitor wallet balance secara regular
5. **Logging**: JANGAN log private keys atau sensitive data

---

## Production Checklist

- [ ] ngrok setup dan running
- [ ] Webhook configured di Neynar
- [ ] Filter by mentioned_fids configured
- [ ] Bot responding to test mention
- [ ] Wallet has ETH balance for gas
- [ ] Deployment successful
- [ ] Reply cast working
- [ ] Monitoring setup (logs, alerts)

---

## Support

Jika ada masalah:

1. Check logs: `tail -f /app/bot/bot.log`
2. Check bot status: `curl http://localhost:3001/health`
3. Check ngrok: `http://localhost:4040`
4. Check Neynar webhook deliveries
5. Verify wallet balance
