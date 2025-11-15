import express from 'express';
import bodyParser from 'body-parser';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { Clanker } from 'clanker-sdk/v4';
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import pinataSDK from '@pinata/sdk';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Initialize Neynar client
const neynar = new NeynarAPIClient(process.env.NEYNAR_API_KEY);

// Initialize Pinata for IPFS uploads
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

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

console.log('🤖 Farcaster Clanker Bot initialized (SMART Q&A MODE)');
console.log('💼 Wallet Address:', account.address);
console.log('🖼️  IPFS via Pinata: ENABLED');
console.log('🧠 Smart Q&A: ENABLED');
console.log('🌐 Language: English Only');

// Track processed casts and deployment history
const processedCasts = new Set();
const deploymentHistory = [];

// Parse command from cast text
function parseDeployCommand(text) {
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

// Extract image URL from cast embeds
function extractImageFromCast(castData) {
  if (!castData.embeds || castData.embeds.length === 0) {
    return null;
  }

  for (const embed of castData.embeds) {
    if (embed.url) {
      const url = embed.url;
      if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.includes('imagedelivery.net')) {
        return url;
      }
    }
  }

  return null;
}

// Upload image to IPFS via Pinata
async function uploadImageToIPFS(imageUrl) {
  try {
    console.log('📥 Downloading image from:', imageUrl);
    
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    const imageBuffer = Buffer.from(response.data);
    console.log('✅ Image downloaded, size:', (imageBuffer.length / 1024).toFixed(2), 'KB');

    console.log('📤 Uploading to IPFS via Pinata...');
    
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: 'token-image.png',
      contentType: response.headers['content-type'] || 'image/png',
    });

    const pinataResponse = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_API_SECRET,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    const ipfsHash = pinataResponse.data.IpfsHash;
    const ipfsUrl = `ipfs://${ipfsHash}`;
    
    console.log('✅ Image uploaded to IPFS!');
    console.log('   IPFS Hash:', ipfsHash);
    console.log('   IPFS URL:', ipfsUrl);

    return ipfsUrl;
  } catch (error) {
    console.error('❌ Failed to upload image to IPFS:', error.message);
    return null;
  }
}

// Get wallet balance
async function getWalletBalance() {
  try {
    const balance = await publicClient.getBalance({ address: account.address });
    return (Number(balance) / 1e18).toFixed(4);
  } catch (error) {
    return 'N/A';
  }
}

// Get gas price
async function getGasPrice() {
  try {
    const gasPrice = await publicClient.getGasPrice();
    return (Number(gasPrice) / 1e9).toFixed(2);
  } catch (error) {
    return 'N/A';
  }
}

// Deploy token via Clanker
async function deployToken(name, symbol, imageUrl = null) {
  try {
    console.log('🚀 Deploying token:', name, '(' + symbol + ')');
    if (imageUrl) {
      console.log('🖼️  With image:', imageUrl);
    }

    const deployParams = {
      name,
      symbol,
      tokenAdmin: account.address,
    };

    if (imageUrl) {
      deployParams.image = imageUrl;
    }

    const { txHash, waitForTransaction, error } = await clanker.deploy(deployParams);

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

    // Add to history
    deploymentHistory.unshift({
      name,
      symbol,
      address: result.tokenAddress,
      txHash,
      hasImage: !!imageUrl,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 10 deployments
    if (deploymentHistory.length > 10) {
      deploymentHistory.pop();
    }

    return {
      success: true,
      txHash,
      tokenAddress: result.tokenAddress,
      clankerLink,
      hasImage: !!imageUrl,
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

// Handle commands
async function handleCommand(castHash, castText, authorUsername) {
  const text = castText.toLowerCase();

  // Help command
  if (text.includes('help') || text.includes('how to') || text.includes('commands')) {
    await replyToCast(
      castHash,
      `👋 Hi! I'm @warpdeploy - a token deployment bot via Clanker SDK.\n\n` +
      `Commands:\n` +
      `• deploy token name [NAME] symbol [SYMBOL] - Deploy ERC-20 token\n` +
      `• help - Show this message\n` +
      `• status - Check bot status\n` +
      `• history - Recent deployments\n` +
      `• about - Learn about me\n\n` +
      `💡 Tip: Attach an image for token logo!`
    );
    return true;
  }

  // About command
  if (text.includes('about') || text.includes('what is @warpdeploy') || text.includes('who are you')) {
    await replyToCast(
      castHash,
      `🤖 About @warpdeploy:\n\n` +
      `I'm an automated token deployment bot powered by Clanker SDK. I help you deploy ERC-20 tokens on Base blockchain instantly!\n\n` +
      `Features:\n` +
      `✅ Deploy tokens in seconds\n` +
      `✅ Support custom token logos (IPFS)\n` +
      `✅ Automatic liquidity on Uniswap V3\n` +
      `✅ No coding required\n\n` +
      `Built with: Clanker SDK, Neynar API, Pinata IPFS\n` +
      `Network: Base (Layer 2)`
    );
    return true;
  }

  // Status command
  if (text.includes('status') || text.includes('online') || text.includes('working')) {
    const balance = await getWalletBalance();
    const gasPrice = await getGasPrice();
    
    await replyToCast(
      castHash,
      `✅ Status: Online & Ready\n\n` +
      `💼 Wallet: ${account.address.slice(0, 6)}...${account.address.slice(-4)}\n` +
      `⚡ Balance: ${balance} ETH\n` +
      `⛽ Gas Price: ${gasPrice} gwei\n` +
      `🔋 Network: Base\n` +
      `🖼️ IPFS: Enabled\n\n` +
      `Total Deployments: ${deploymentHistory.length}`
    );
    return true;
  }

  // History command
  if (text.includes('history') || text.includes('recent') || text.includes('deployed tokens')) {
    if (deploymentHistory.length === 0) {
      await replyToCast(
        castHash,
        `📊 Deployment History:\n\nNo tokens deployed yet. Be the first!\n\nUse: deploy token name [NAME] symbol [SYMBOL]`
      );
    } else {
      let historyMsg = `📊 Recent Deployments:\n\n`;
      deploymentHistory.slice(0, 5).forEach((dep, idx) => {
        historyMsg += `${idx + 1}. ${dep.name} (${dep.symbol})${dep.hasImage ? ' 🖼️' : ''}\n`;
        historyMsg += `   ${dep.address.slice(0, 8)}...${dep.address.slice(-6)}\n`;
      });
      historyMsg += `\nTotal: ${deploymentHistory.length} tokens deployed`;
      
      await replyToCast(castHash, historyMsg);
    }
    return true;
  }

  // Gas price query
  if (text.includes('gas') || text.includes('fee')) {
    const gasPrice = await getGasPrice();
    await replyToCast(
      castHash,
      `⛽ Current Gas Price on Base:\n\n` +
      `${gasPrice} gwei\n\n` +
      `Estimated deployment cost: ~0.001 ETH\n` +
      `Network: Base (cheap & fast L2)`
    );
    return true;
  }

  // Balance query
  if (text.includes('balance') || text.includes('wallet')) {
    const balance = await getWalletBalance();
    await replyToCast(
      castHash,
      `💼 Bot Wallet Info:\n\n` +
      `Address: ${account.address.slice(0, 10)}...${account.address.slice(-8)}\n` +
      `Balance: ${balance} ETH\n` +
      `Network: Base\n\n` +
      `View on BaseScan:\nhttps://basescan.org/address/${account.address}`
    );
    return true;
  }

  // Clanker info
  if (text.includes('what is clanker') || text.includes('clanker?')) {
    await replyToCast(
      castHash,
      `🔧 What is Clanker?\n\n` +
      `Clanker is a protocol for deploying ERC-20 tokens on Base blockchain with:\n\n` +
      `✅ Instant deployment\n` +
      `✅ Automatic Uniswap V3 liquidity\n` +
      `✅ Fixed max supply (100B tokens)\n` +
      `✅ Permanent liquidity lock\n` +
      `✅ Creator fee rewards (0.4% volume)\n\n` +
      `Learn more: https://clanker.world`
    );
    return true;
  }

  // How to deploy
  if (text.includes('how do i deploy') || text.includes('how to deploy')) {
    await replyToCast(
      castHash,
      `📝 How to Deploy a Token:\n\n` +
      `1. Mention me with:\n` +
      `   @warpdeploy deploy token name [YOUR_NAME] symbol [SYMBOL]\n\n` +
      `2. (Optional) Attach an image for token logo\n\n` +
      `3. Wait 1-2 minutes for deployment\n\n` +
      `4. Get your Clanker link!\n\n` +
      `Example:\n` +
      `@warpdeploy deploy token name PEPE symbol PEPE\n` +
      `[Attach: logo.png]`
    );
    return true;
  }

  // Pricing
  if (text.includes('cost') || text.includes('price') || text.includes('how much')) {
    await replyToCast(
      castHash,
      `💰 Deployment Cost:\n\n` +
      `Gas Fee: ~0.001 ETH (~$2-3)\n` +
      `Bot Fee: FREE\n` +
      `Network: Base (cheap L2)\n\n` +
      `You only pay blockchain gas fees!\n\n` +
      `Note: I need ETH in my wallet for deployment. Make sure to have sufficient balance.`
    );
    return true;
  }

  // Unknown command
  if (text.includes('@warpdeploy') && !text.includes('deploy token')) {
    await replyToCast(
      castHash,
      `🤔 I didn't understand that command.\n\n` +
      `Try:\n` +
      `• help - Show available commands\n` +
      `• deploy token name X symbol Y - Deploy a token\n` +
      `• status - Check bot status\n\n` +
      `Need help? Type: @warpdeploy help`
    );
    return true;
  }

  return false;
}

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log('📨 Webhook received:', type);

    if (type === 'cast.created') {
      const castText = data.text;
      const castTextLower = castText.toLowerCase();
      const castHash = data.hash;
      const authorUsername = data.author.username;

      console.log(`💬 Cast from @${authorUsername}: ${castText}`);

      // Skip if already processed
      if (processedCasts.has(castHash)) {
        console.log('⏭️  Cast already processed, skipping...');
        return res.status(200).json({ success: true, message: 'Already processed' });
      }

      // Mark as processed
      processedCasts.add(castHash);

      // Check for commands first
      const commandHandled = await handleCommand(castHash, castText, authorUsername);
      
      if (commandHandled) {
        return res.status(200).json({ success: true });
      }

      // Check for deploy command
      if (castTextLower.includes('deploy') && castTextLower.includes('token')) {
        const command = parseDeployCommand(castText);

        if (command) {
          console.log('✅ Valid deploy command detected');
          console.log('   Token Name:', command.name);
          console.log('   Token Symbol:', command.symbol);

          // Check for image
          const imageUrl = extractImageFromCast(data);
          
          if (imageUrl) {
            console.log('🖼️  Image found in cast:', imageUrl);
          }

          // Reply with processing message
          const processingMsg = imageUrl 
            ? `🚀 Deploying token ${command.name} (${command.symbol}) with your image on Base... Please wait!`
            : `🚀 Deploying token ${command.name} (${command.symbol}) on Base... Please wait!`;
          
          await replyToCast(castHash, processingMsg);

          // Upload image if present
          let ipfsUrl = null;
          if (imageUrl) {
            ipfsUrl = await uploadImageToIPFS(imageUrl);
            if (!ipfsUrl) {
              await replyToCast(
                castHash,
                `⚠️ Warning: Failed to upload image to IPFS. Deploying token without image...`
              );
            }
          }

          // Deploy token
          const result = await deployToken(command.name, command.symbol, ipfsUrl);

          if (result.success) {
            const successMsg = result.hasImage
              ? `✅ Token ${command.name} deployed successfully with image!\n\n🔗 Clanker: ${result.clankerLink}\n📜 Contract: ${result.tokenAddress}\n⛓️ TX: https://basescan.org/tx/${result.txHash}\n🖼️ Image: Uploaded to IPFS`
              : `✅ Token ${command.name} deployed successfully!\n\n🔗 Clanker: ${result.clankerLink}\n📜 Contract: ${result.tokenAddress}\n⛓️ TX: https://basescan.org/tx/${result.txHash}`;
            
            await replyToCast(castHash, successMsg);
          } else {
            await replyToCast(
              castHash,
              `❌ Failed to deploy token: ${result.error || 'Unknown error'}\n\nTry again or check bot status: @warpdeploy status`
            );
          }
        } else {
          await replyToCast(
            castHash,
            `⚠️ Invalid command format.\n\n✅ Correct usage:\ndeploy token name [NAME] symbol [SYMBOL]\n\nExample:\n@warpdeploy deploy token name PEPE symbol PEPE\n\nType '@warpdeploy help' for more info.`
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
    mode: 'smart-qa',
    features: ['image-upload', 'ipfs', 'commands', 'q&a'],
    bot: '@warpdeploy',
    wallet: account.address,
    deployments: deploymentHistory.length,
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('');
  console.log('🎯 Bot server running on port', PORT);
  console.log('📍 Webhook: http://localhost:' + PORT + '/webhook');
  console.log('🏥 Health: http://localhost:' + PORT + '/health');
  console.log('');
  console.log('✨ Features:');
  console.log('   🖼️  Image upload & IPFS');
  console.log('   🧠 Smart Q&A commands');
  console.log('   📊 Deployment history');
  console.log('   💬 English responses only');
  console.log('');
  console.log('📝 Available Commands:');
  console.log('   • @warpdeploy deploy token name X symbol Y');
  console.log('   • @warpdeploy help');
  console.log('   • @warpdeploy status');
  console.log('   • @warpdeploy history');
  console.log('   • @warpdeploy about');
  console.log('');
});
