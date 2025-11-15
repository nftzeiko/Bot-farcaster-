# 🖼️ Deploy Token dengan Image - Guide Lengkap

## ✅ Fitur Baru: Image Upload Support!

Bot sekarang support **deploy token dengan image/logo**!

---

## 🎨 Cara Kerja

### User Workflow:

```
1. User buat cast di Farcaster
2. Tulis command: @bot deploy token name WHEN symbol WHEN
3. Attach image (logo token)
4. Submit cast
         ↓
5. Bot detect mention
6. Bot download image dari cast
7. Bot upload image ke IPFS (via Pinata)
8. Bot deploy token dengan IPFS URL
9. Bot reply dengan Clanker link
         ↓
10. Token deployed dengan logo! 🎉
```

---

## 📝 Command Format

### Dengan Image (Recommended):
```
@yourbotname deploy token name WHEN symbol WHEN
[Attach: logo.png]
```

### Tanpa Image:
```
@yourbotname deploy token name WHEN symbol WHEN
```
Token deployed tanpa logo (default icon).

---

## 🖼️ Image Requirements

### Supported Formats:
- ✅ PNG
- ✅ JPG/JPEG
- ✅ GIF
- ✅ WEBP

### Size Limits:
- **Recommended**: < 500 KB
- **Maximum**: 5 MB (Pinata free tier)
- **Dimensions**: 512x512 px (ideal for token logo)

### Best Practices:
- Use square images (1:1 ratio)
- High contrast for visibility
- Simple design works best
- Transparent background (PNG recommended)

---

## 🔧 Technical Details

### Image Processing Flow:

1. **Detection**
   ```
   Bot receives webhook → Parse cast → Extract embeds
   ```

2. **Download**
   ```
   Download image from Farcaster CDN → Verify format
   ```

3. **IPFS Upload**
   ```
   Upload to Pinata → Get IPFS hash
   Format: ipfs://bafybeig...
   ```

4. **Token Deployment**
   ```
   Deploy via Clanker SDK with image parameter
   Token metadata includes IPFS URL
   ```

5. **Verification**
   ```
   Image visible on:
   - Clanker.world token page
   - DEX listings (Uniswap, etc)
   - Block explorers
   ```

---

## 🧪 Testing

### Test 1: Deploy Tanpa Image
```
@bot deploy token name TEST symbol TST
```
✅ Should work, no image

### Test 2: Deploy Dengan Image
```
@bot deploy token name LOGO symbol LOGO
[Attach: logo.png 512x512]
```
✅ Should work, image uploaded to IPFS

### Test 3: Check Logs
```bash
tail -f /app/bot/bot-image.log
```

Look for:
```
🖼️  Image found in cast: https://...
📥 Downloading image from: https://...
✅ Image downloaded, size: 45.32 KB
📤 Uploading to IPFS via Pinata...
✅ Image uploaded to IPFS!
   IPFS Hash: bafybeig...
   IPFS URL: ipfs://bafybeig...
🚀 Deploying token: TEST (TST)
🖼️  With image: ipfs://bafybeig...
```

---

## 🌐 IPFS & Pinata

### What is IPFS?
- **InterPlanetary File System**
- Decentralized storage
- Content-addressed (immutable)
- Token images stored permanently

### What is Pinata?
- IPFS pinning service
- Ensures files stay online 24/7
- Fast CDN gateway
- Free tier: 1 GB storage

### Your Pinata Setup:
```
API Key: 6523c114312c1638a6e9
Status: ✅ Configured
Storage: 1 GB free
Rate Limit: 100 uploads/min
```

### Gateway URLs:
```
Pinata Gateway: https://gateway.pinata.cloud/ipfs/{hash}
Public IPFS: https://ipfs.io/ipfs/{hash}
Cloudflare: https://cloudflare-ipfs.com/ipfs/{hash}
```

---

## ⚠️ Troubleshooting

### Image not uploaded

**Error: "Failed to upload image to IPFS"**

Possible causes:
1. Image too large (> 5 MB)
2. Invalid format
3. Pinata rate limit
4. Network timeout

**Fix:**
- Compress image
- Check format (PNG/JPG only)
- Wait 1 minute, try again
- Check Pinata dashboard: https://app.pinata.cloud

### Image not visible on Clanker

**Token deployed but no image showing**

Possible causes:
1. IPFS propagation delay (5-30 sec)
2. Gateway slow
3. Browser cache

**Fix:**
- Wait 30 seconds, refresh
- Try different IPFS gateway
- Clear browser cache
- Check IPFS hash on multiple gateways

### Bot not detecting image

**Command works but image ignored**

Possible causes:
1. Image not attached to cast
2. Wrong attachment type (video/link)
3. Image URL not in embeds

**Fix:**
- Verify image attached (not link)
- Use supported formats
- Check cast embeds in Warpcast
- View bot logs for debug info

---

## 📊 Bot Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "mode": "webhook",
  "features": ["image-upload", "ipfs"],
  "bot": "Farcaster Clanker Bot",
  "wallet": "0x40095BC8f951284389027c28d0ff70A80B23f096"
}
```

✅ `features` includes `image-upload` and `ipfs`

---

## 🎯 Examples

### Example 1: Meme Token dengan Logo

**User Cast:**
```
@bot deploy token name PEPE symbol PEPE
[Attach: pepe-logo.png]
```

**Bot Response:**
```
🚀 Deploying token PEPE (PEPE) with your image on Base... Please wait!

[2 minutes later]

✅ Token PEPE deployed successfully with image!

🔗 Clanker: https://clanker.world/clanker/0x...
📜 Contract: 0x...
⛓️ TX: https://basescan.org/tx/0x...
🖼️ Image on IPFS: ✅
```

### Example 2: Utility Token Tanpa Logo

**User Cast:**
```
@bot deploy token name UTIL symbol UTL
```

**Bot Response:**
```
🚀 Deploying token UTIL (UTL) on Base... Please wait!

[2 minutes later]

✅ Token UTIL deployed successfully!

🔗 Clanker: https://clanker.world/clanker/0x...
📜 Contract: 0x...
⛓️ TX: https://basescan.org/tx/0x...
```

---

## 💡 Tips & Best Practices

### For Users:

1. **Logo Design**
   - Square format (512x512)
   - Simple, recognizable design
   - High contrast colors
   - Transparent background

2. **File Size**
   - Compress before upload
   - Use tools: TinyPNG, Squoosh
   - Target: < 200 KB

3. **Testing**
   - Test dengan small token first
   - Verify logo on IPFS gateway
   - Check on Clanker.world

### For Bot Owner:

1. **Monitoring**
   ```bash
   # Watch logs
   tail -f /app/bot/bot-image.log
   
   # Check Pinata usage
   # Login: https://app.pinata.cloud
   ```

2. **Rate Limits**
   - Pinata free: 100 uploads/min
   - Monitor quota usage
   - Upgrade if needed ($20/mo = unlimited)

3. **Backup**
   - Keep copy of .env file
   - Backup Pinata credentials
   - Document IPFS hashes

---

## 🚀 Deployment Checklist

Before going live with image feature:

- [x] Bot running with image support
- [x] Pinata API configured
- [ ] ngrok running (expose webhook)
- [ ] Webhook configured in Neynar
- [ ] Test deploy without image
- [ ] Test deploy with image
- [ ] Verify IPFS upload working
- [ ] Check token on Clanker.world
- [ ] Monitor Pinata quota

---

## 📞 Quick Commands

```bash
# Start bot with image support
cd /app/bot && node bot-with-image.js &

# Stop bot
pkill -f "bot-with-image"

# View logs
tail -f /app/bot/bot-image.log

# Check health
curl http://localhost:3001/health

# Test image detection (mock webhook)
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "cast.created",
    "data": {
      "hash": "0xtest",
      "text": "@bot deploy token name TEST symbol TST",
      "author": {"username": "tester"},
      "embeds": [{"url": "https://example.com/image.png"}]
    }
  }'
```

---

## 🎉 Success!

Bot dengan image support sudah ready!

**Next steps:**
1. Setup webhook di Neynar
2. Top-up wallet ETH di Base
3. Test deploy dengan image
4. Share bot dengan komunitas!

🚀 **Happy Token Deploying dengan Logo!**
