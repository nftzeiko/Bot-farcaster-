import express from 'express';
import bodyParser from 'body-parser';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { Clanker } from 'clanker-sdk/v4';
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Initialize Neynar client
const neynar = new NeynarAPIClient(process.env.NEYNAR_API_KEY);

// Initialize Viem clients for Base blockchain
const account = privateKeyToAccount(process.env.BASE_WALLET_PRIVATE_KEY);
const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(),
});

// Initialize Clanker SDK
const clanker = new Clanker({
  publicClient,
  wallet: walletClient,
});

console.log('🤖 Farcaster Clanker Bot initialized');
console.log('Wallet Address:', account.address);

// Get bot's FID from signer
let BOT_FID = null;
let processedCasts = new Set(); // Track processed cast hashes

async function initializeBot() {
  try {
    // Get signer info to know bot's FID
    console.log('🔍 Fetching bot FID...');
    const signerInfo = await neynar.lookupSigner(process.env.SIGNER_UUID);
    BOT_FID = signerInfo.fid;
    console.log('✅ Bot FID:', BOT_FID);
  } catch (error) {
    console.error('⚠️  Could not fetch bot FID:', error.message);
    console.log('ℹ️  Bot will still work with webhook mode');
  }
}

// Initialize bot on startup
initializeBot();

// Parse command from cast text
function parseDeployCommand(text) {
  // Expected format: "deploy token name [NAME] symbol [SYMBOL]"
  const nameMatch = text.match(/name\s+([A-Za-z0-9]+)/i);
  const symbolMatch = text.match(/symbol\s+([A-Za-z0-9]+)/i);

  if (nameMatch && symbolMatch) {
    return {
      name: nameMatch[1],
      symbol: symbolMatch[1],
    };
  }
  return null;
}

// Deploy token via Clanker
async function deployToken(name, symbol) {
  try {
    console.log(`🚀 Deploying token: ${name} (${symbol})`);

    const { txHash, waitForTransaction, error } = await clanker.deploy({
      name,
      symbol,
      tokenAdmin: account.address,
    });

    if (error) {
      console.error('❌ Deployment error:', error);
      return { success: false, error };
    }

    console.log('⏳ Waiting for transaction confirmation...');
    console.log('Transaction Hash:', txHash);

    const result = await waitForTransaction();
    console.log('✅ Token deployed successfully!');
    console.log('Token Address:', result.tokenAddress);

    // Construct Clanker link
    const clankerLink = `https://clanker.world/clanker/${result.tokenAddress}`;

    return {
      success: true,
      txHash,
      tokenAddress: result.tokenAddress,
      clankerLink,
    };
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    return { success: false, error: error.message };
  }
}

// Reply to cast
async function replyToCast(castHash, message) {
  try {
    await neynar.publishCast(process.env.SIGNER_UUID, message, {
      replyTo: castHash,
    });
    console.log('✅ Reply sent successfully');
  } catch (error) {
    console.error('❌ Failed to reply:', error);
  }
}

// Webhook endpoint for Farcaster mentions
app.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log('📩 Webhook received:', type);

    // Check if it's a mention event
    if (type === 'cast.created') {
      const castText = data.text.toLowerCase();
      const castHash = data.hash;
      const authorUsername = data.author.username;

      console.log(`💬 Cast from @${authorUsername}: ${data.text}`);

      // Check if cast contains deploy command
      if (castText.includes('deploy') && castText.includes('token')) {
        const command = parseDeployCommand(data.text);

        if (command) {
          console.log('✅ Valid deploy command detected');
          console.log('Token Name:', command.name);
          console.log('Token Symbol:', command.symbol);

          // Reply with "Processing" message
          await replyToCast(
            castHash,
            `🚀 Deploying token ${command.name} (${command.symbol}) on Base... Please wait!`
          );

          // Deploy token
          const result = await deployToken(command.name, command.symbol);

          if (result.success) {
            // Reply with success and Clanker link
            await replyToCast(
              castHash,
              `✅ Token ${command.name} deployed successfully!\n\n🔗 Clanker: ${result.clankerLink}\n📜 Contract: ${result.tokenAddress}\n⛓️ TX: https://basescan.org/tx/${result.txHash}`
            );
          } else {
            // Reply with error
            await replyToCast(
              castHash,
              `❌ Failed to deploy token: ${result.error || 'Unknown error'}`
            );
          }
        } else {
          // Invalid command format
          await replyToCast(
            castHash,
            `⚠️ Invalid command format. Please use: deploy token name [NAME] symbol [SYMBOL]`
          );
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    bot: 'Farcaster Clanker Bot',
    wallet: account.address,
  });
});

// Polling mode for free plan users (alternative to webhook)
async function pollForMentions() {
  if (!BOT_FID) {
    console.log('⚠️  Bot FID not available, skipping polling');
    return;
  }

  try {
    console.log('🔄 Polling for mentions...');
    
    // Fetch notifications for bot
    const notifications = await neynar.fetchAllNotifications({
      fid: BOT_FID,
      type: 'mentions',
    });

    if (notifications?.notifications) {
      for (const notif of notifications.notifications) {
        const cast = notif.cast;
        if (!cast) continue;

        const castHash = cast.hash;
        const castText = cast.text.toLowerCase();

        // Skip if already processed
        if (processedCasts.has(castHash)) continue;

        console.log(`📩 New mention from @${cast.author.username}: ${cast.text}`);

        // Check if cast contains deploy command
        if (castText.includes('deploy') && castText.includes('token')) {
          const command = parseDeployCommand(cast.text);

          if (command) {
            console.log('✅ Valid deploy command detected');
            console.log('Token Name:', command.name);
            console.log('Token Symbol:', command.symbol);

            // Mark as processed
            processedCasts.add(castHash);

            // Reply with "Processing" message
            await replyToCast(
              castHash,
              `🚀 Deploying token ${command.name} (${command.symbol}) on Base... Please wait!`
            );

            // Deploy token
            const result = await deployToken(command.name, command.symbol);

            if (result.success) {
              // Reply with success and Clanker link
              await replyToCast(
                castHash,
                `✅ Token ${command.name} deployed successfully!\n\n🔗 Clanker: ${result.clankerLink}\n📜 Contract: ${result.tokenAddress}\n⛓️ TX: https://basescan.org/tx/${result.txHash}`
              );
            } else {
              // Reply with error
              await replyToCast(
                castHash,
                `❌ Failed to deploy token: ${result.error || 'Unknown error'}`
              );
            }
          } else {
            processedCasts.add(castHash);
            // Invalid command format
            await replyToCast(
              castHash,
              `⚠️ Invalid command format. Please use: deploy token name [NAME] symbol [SYMBOL]`
            );
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Polling error:', error.message);
  }
}

// Start polling every 30 seconds
const POLLING_ENABLED = process.env.POLLING_MODE === 'true';
if (POLLING_ENABLED) {
  console.log('🔄 Polling mode ENABLED (checking mentions every 30 seconds)');
  setInterval(pollForMentions, 30000); // Poll every 30 seconds
  // Run first poll after 5 seconds
  setTimeout(pollForMentions, 5000);
} else {
  console.log('📡 Webhook mode (set POLLING_MODE=true in .env to enable polling)');
}

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎯 Bot webhook server running on port ${PORT}`);
  console.log(`📍 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
