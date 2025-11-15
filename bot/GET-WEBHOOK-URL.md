# 🔗 Cara Mendapatkan Webhook URL

## Step 1: Start ngrok

Buka terminal dan jalankan:

```bash
ngrok http 3001
```

**Output akan seperti ini:**

```
ngrok                                                          

Session Status                online
Account                       your@email.com
Version                       3.33.0
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123-def-456.ngrok-free.app -> http://localhost:3001

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

## Step 2: Copy ngrok URL

Dari output di atas, copy bagian **"Forwarding"**:

```
https://abc123-def-456.ngrok-free.app
```

⚠️ **IMPORTANT**: URL Anda akan berbeda! Ini hanya contoh.

---

## Step 3: Tambahkan /webhook

**Webhook URL LENGKAP yang harus Anda set:**

```
https://abc123-def-456.ngrok-free.app/webhook
                                      ^^^^^^^^
                                      JANGAN LUPA!
```

Format:
```
[NGROK_URL]/webhook
```

---

## 🎯 Webhook URL Anda

Setelah start ngrok, webhook URL Anda adalah:

```
https://[YOUR-NGROK-SUBDOMAIN].ngrok-free.app/webhook
```

**Contoh:**
- ❌ SALAH: `https://abc123.ngrok-free.app` (tanpa /webhook)
- ✅ BENAR: `https://abc123.ngrok-free.app/webhook`

---

## 🔍 Cara Alternatif: Via Web Interface

### Option 1: Buka ngrok Web Interface

```bash
# Buka browser ke:
http://localhost:4040
```

Di halaman tersebut, Anda akan lihat:
- **Public URL** → Copy URL ini
- Tambahkan `/webhook` di akhir

### Option 2: Via Command Line

```bash
# Get ngrok URL
curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['tunnels'][0]['public_url'] + '/webhook')"
```

Output:
```
https://abc123.ngrok-free.app/webhook
```

---

## 📝 Set di Neynar Dashboard

### 1. Buka Neynar

https://dev.neynar.com/webhooks

### 2. Create Webhook

Klik **"+ Create Webhook"**

### 3. Isi Form

**Webhook URL:**
```
https://[YOUR-NGROK-URL].ngrok-free.app/webhook
```

**Event Type:**
```
cast.created
```

**Filters:**
```json
{
  "mentioned_fids": [YOUR_BOT_FID]
}
```

**Contoh dengan FID 12345:**
```json
{
  "mentioned_fids": [12345]
}
```

### 4. Save

Klik **"Create"** atau **"Save"**

---

## ✅ Verify Setup

### Test 1: Check Bot

```bash
curl http://localhost:3001/health
```

Harus return:
```json
{"status":"ok","mode":"smart-qa",...}
```

### Test 2: Check ngrok

```bash
curl http://localhost:4040
```

Harus buka ngrok web interface.

### Test 3: Test Webhook

```bash
curl -X POST https://YOUR-NGROK-URL.ngrok-free.app/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"webhook.test","data":{}}'
```

Harus return:
```json
{"success":true}
```

### Test 4: Check Neynar

Di Neynar dashboard:
- Webhook status = **"Active"** (hijau)
- Last delivery = timestamp terbaru

---

## 🚨 Troubleshooting

### ngrok tidak running

```bash
# Check process
ps aux | grep ngrok

# If not running, start:
ngrok http 3001
```

### ngrok URL changed

ngrok free tier generates new URL setiap restart.

**Fix:**
1. Start ngrok
2. Get new URL
3. Update webhook URL di Neynar
4. Test again

**Permanent solution:**
- Upgrade ngrok paid ($8/mo)
- Get fixed domain
- No need update webhook URL

### Webhook test failed

**Check:**
1. Bot running?
2. ngrok running?
3. URL correct (dengan /webhook)?
4. Firewall blocking?

---

## 💡 Quick Commands

```bash
# Start ngrok
ngrok http 3001

# Get webhook URL (in another terminal)
curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*ngrok[^"]*' | head -1

# Add /webhook
echo "$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*ngrok[^"]*' | head -1)/webhook"

# Test webhook
WEBHOOK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*ngrok[^"]*' | head -1)
curl -X POST "$WEBHOOK_URL/webhook" \
  -H "Content-Type: application/json" \
  -d '{"type":"test","data":{}}'
```

---

## 📞 Need Help?

Jika masih bingung:

1. Screenshot ngrok output
2. Screenshot Neynar webhook form
3. Share error messages

Saya akan help debug! 😊

---

**Summary:**

1. ✅ Start ngrok: `ngrok http 3001`
2. ✅ Copy URL dari output
3. ✅ Tambahkan `/webhook` di akhir
4. ✅ Paste di Neynar webhook URL
5. ✅ Save & test!
