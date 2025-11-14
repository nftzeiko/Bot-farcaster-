# Farcaster Clanker Bot

Bot otomatis untuk deploy token di Base blockchain melalui Clanker SDK ketika di-mention di Farcaster.

## Fitur

- ✅ Auto-detect mention di Farcaster
- ✅ Parse command deploy token
- ✅ Deploy token ke Base via Clanker SDK
- ✅ Auto-reply dengan link Clanker
- ✅ Support custom token name & symbol

## Setup

### 1. Install Dependencies

```bash
cd /app/bot
yarn install
```

### 2. Configure Environment

Edit `.env` file dan pastikan semua credentials sudah benar:

```env
NEYNAR_API_KEY=your_api_key
SIGNER_UUID=your_signer_uuid
BASE_WALLET_PRIVATE_KEY=0x...
PORT=3001
```

### 3. Setup Neynar Webhook

1. Login ke [Neynar Developer Portal](https://dev.neynar.com)
2. Buat webhook baru:
   - Event Type: `cast.created`
   - Filters: `mentioned_fids` (tambahkan FID bot Anda)
   - Webhook URL: `https://your-domain.com/webhook` atau gunakan ngrok untuk testing

### 4. Start Bot

```bash
yarn start
```

Atau untuk development dengan auto-reload:

```bash
yarn dev
```

## Testing dengan ngrok

Untuk testing di local:

```bash
# Install ngrok
npm install -g ngrok

# Start bot
yarn start

# Di terminal lain, expose port
ngrok http 3001

# Copy ngrok URL dan set di Neynar webhook
# Contoh: https://abc123.ngrok.io/webhook
```

## Usage

Setelah bot running dan webhook configured, mention bot di Farcaster dengan format:

```
@yourbotname deploy token name WHEN symbol WHEN
```

Bot akan:
1. ✅ Detect mention
2. ✅ Parse command
3. ✅ Deploy token ke Base
4. ✅ Reply dengan link Clanker

## Command Format

```
deploy token name [TOKEN_NAME] symbol [TOKEN_SYMBOL]
```

Contoh:
- `deploy token name WHEN symbol WHEN`
- `deploy token name MyToken symbol MTK`
- `deploy token name CoolCoin symbol COOL`

## Troubleshooting

### Bot tidak respond
1. Check logs di console
2. Verify webhook configured di Neynar
3. Check ngrok tunnel masih active
4. Verify credentials di .env

### Deployment failed
1. Check wallet balance (butuh ETH untuk gas)
2. Verify private key valid
3. Check Clanker SDK logs

### Reply tidak muncul
1. Verify Signer UUID benar
2. Check Neynar API key valid
3. Check bot FID permissions

## Architecture

```
Farcaster User
     |
     | (mention bot)
     |
     v
Neynar Webhook
     |
     | (POST /webhook)
     |
     v
  Bot Server (Express)
     |
     |-- Parse Command
     |-- Deploy via Clanker SDK
     |-- Reply via Neynar SDK
     v
  User receives reply
```

## Requirements

- Node.js 18+
- Yarn
- Neynar API key & Signer UUID
- Base wallet dengan ETH untuk gas
- Public webhook URL (ngrok untuk testing)
