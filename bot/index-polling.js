import express from 'express';
import bodyParser from 'body-parser';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { Clanker } from 'clanker-sdk/v4';
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import dotenv from 'dotenv';
import axios from 'axios';

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

console.log('🤖 Farcaster Clanker Bot initialized (POLLING MODE)');
console.log('Wallet Address:', account.address);

// Get bot's FID and username
let BOT_FID = null;
let BOT_USERNAME = null;
let processedCasts = new Set();
let lastCheckTime = Math.floor(Date.now() / 1000) - 3600; // Start from 1 hour ago

async function initializeBot() {
  try {
    console.log('🔍 Fetching bot info...');
    const signerInfo = await neynar.lookupSigner(process.env.SIGNER_UUID);
    BOT_FID = signerInfo.fid;
    
    // Get username from user info
    const userInfo = await neynar.fetchBulkUsers([BOT_FID]);
    BOT_USERNAME = userInfo.users[0].username;
    
    console.log('✅ Bot FID:', BOT_FID);
    console.log('✅ Bot Username:', BOT_USERNAME);
  } catch (error) {
    console.error('❌ Failed to fetch bot info:', error.message);
    process.exit(1);
  }
}

// Parse command from cast text
function parseDeployCommand(text) {
  const nameMatch = text.match(/name\\s+([A-Za-z0-9]+)/i);
  const symbolMatch = text.match(/symbol\\s+([A-Za-z0-9]+)/i);

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
    console.error('❌ Failed to reply:', error.message);
  }
}

// Poll for mentions using public feed
async function pollForMentions() {
  if (!BOT_USERNAME) {
    console.log('⚠️  Bot username not available yet');
    return;
  }

  try {
    console.log(`🔄 Polling for @${BOT_USERNAME} mentions...`);
    
    // Fetch recent casts from feed that mention bot
    const feed = await neynar.fetchFeed({
      filterType: 'fids',
      fids: [BOT_FID],
      limit: 25,
    });

    if (!feed || !feed.casts) {
      console.log('No casts found');
      return;
    }

    // Check parent casts for mentions
    for (const cast of feed.casts) {
      // Look for replies to bot
      if (cast.parent_hash) {
        try {
          const parentCast = await neynar.lookUpCastByHashOrWarpcastUrl(cast.parent_hash, 'hash');
          
          // Check if this is a reply mentioning bot
          const castText = cast.text.toLowerCase();
          const castHash = cast.hash;
          
          // Skip if already processed or too old
          if (processedCasts.has(castHash) || cast.timestamp < lastCheckTime) {
            continue;
          }

          console.log(`📩 Found cast from @${cast.author.username}: "${cast.text}"`);

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
                await replyToCast(
                  castHash,
                  `✅ Token ${command.name} deployed successfully!\\n\\n🔗 Clanker: ${result.clankerLink}\\n📜 Contract: ${result.tokenAddress}\\n⛓️ TX: https://basescan.org/tx/${result.txHash}`
                );
              } else {
                await replyToCast(
                  castHash,
                  `❌ Failed to deploy token: ${result.error || 'Unknown error'}`
                );
              }
            } else {
              processedCasts.add(castHash);
              await replyToCast(
                castHash,
                `⚠️ Invalid command format. Please use: deploy token name [NAME] symbol [SYMBOL]`
              );
            }
          }
        } catch (err) {
          // Skip if can't fetch parent cast
          continue;
        }
      }
    }

    // Update last check time
    lastCheckTime = Math.floor(Date.now() / 1000);
  } catch (error) {
    console.error('❌ Polling error:', error.message);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'polling',
    bot: 'Farcaster Clanker Bot',
    wallet: account.address,
    username: BOT_USERNAME,
    fid: BOT_FID,
  });
});

// Webhook endpoint (still available if user upgrades)
app.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'cast.created') {
      const castText = data.text.toLowerCase();
      const castHash = data.hash;

      if (castText.includes('deploy') && castText.includes('token')) {
        const command = parseDeployCommand(data.text);

        if (command && !processedCasts.has(castHash)) {
          processedCasts.add(castHash);
          
          await replyToCast(
            castHash,
            `🚀 Deploying token ${command.name} (${command.symbol}) on Base...`
          );

          const result = await deployToken(command.name, command.symbol);

          if (result.success) {
            await replyToCast(
              castHash,
              `✅ Token ${command.name} deployed!\\n\\n🔗 ${result.clankerLink}\\n📜 ${result.tokenAddress}\\n⛓️ https://basescan.org/tx/${result.txHash}`
            );
          } else {
            await replyToCast(castHash, `❌ Failed: ${result.error}`);
          }
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize and start
await initializeBot();

// Start polling every 60 seconds
console.log('🔄 Starting polling (checking every 60 seconds)...');
setInterval(pollForMentions, 60000);
setTimeout(pollForMentions, 5000); // First poll after 5 seconds

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎯 Bot server running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('📝 Instructions:');
  console.log(`1. Tag bot in Farcaster: @${BOT_USERNAME || 'yourbot'}`);
  console.log('2. Add command: deploy token name WHEN symbol WHEN');
  console.log('3. Bot will auto-deploy and reply!');
});
