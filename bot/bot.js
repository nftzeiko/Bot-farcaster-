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

console.log('🤖 Farcaster Clanker Bot initialized (WEBHOOK MODE)');
console.log('💼 Wallet Address:', account.address);

// Track processed casts to avoid duplicates
const processedCasts = new Set();

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
    console.log('📝 Transaction Hash:', txHash);

    const result = await waitForTransaction();
    console.log('✅ Token deployed successfully!');
    console.log('📍 Token Address:', result.tokenAddress);

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

    console.log('📨 Webhook received:', type);

    // Check if it's a cast creation event
    if (type === 'cast.created') {
      const castText = data.text.toLowerCase();
      const castHash = data.hash;
      const authorUsername = data.author.username;

      console.log(`💬 Cast from @${authorUsername}: ${data.text}`);

      // Skip if already processed
      if (processedCasts.has(castHash)) {
        console.log('⏭️  Cast already processed, skipping...');
        return res.status(200).json({ success: true, message: 'Already processed' });
      }

      // Check if cast contains deploy command
      if (castText.includes('deploy') && castText.includes('token')) {
        const command = parseDeployCommand(data.text);

        if (command) {
          console.log('✅ Valid deploy command detected');
          console.log('   Token Name:', command.name);
          console.log('   Token Symbol:', command.symbol);

          // Mark as processed immediately
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
          // Invalid command format
          processedCasts.add(castHash);
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
    mode: 'webhook',
    bot: 'Farcaster Clanker Bot',
    wallet: account.address,
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('');
  console.log('🎯 Bot webhook server running on port', PORT);
  console.log('📍 Webhook URL: http://localhost:' + PORT + '/webhook');
  console.log('🏥 Health check: http://localhost:' + PORT + '/health');
  console.log('');
  console.log('📝 Next steps:');
  console.log('   1. Make sure ngrok is running: ngrok http 3001');
  console.log('   2. Configure webhook in Neynar dashboard');
  console.log('   3. Test by mentioning bot in Farcaster!');
  console.log('');
});
