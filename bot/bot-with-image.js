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
import { Readable } from 'stream';

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

console.log('🤖 Farcaster Clanker Bot initialized (WITH IMAGE SUPPORT!)');
console.log('💼 Wallet Address:', account.address);
console.log('🖼️  IPFS via Pinata: ENABLED');

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

// Extract image URL from cast embeds
function extractImageFromCast(castData) {
  if (!castData.embeds || castData.embeds.length === 0) {
    return null;
  }

  // Look for image embeds
  for (const embed of castData.embeds) {
    if (embed.url) {
      const url = embed.url;
      // Check if URL is an image
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
    
    // Download image
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    const imageBuffer = Buffer.from(response.data);
    console.log('✅ Image downloaded, size:', (imageBuffer.length / 1024).toFixed(2), 'KB');

    // Upload to Pinata
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
    console.log('   Gateway URL:', `https://gateway.pinata.cloud/ipfs/${ipfsHash}`);

    return ipfsUrl;
  } catch (error) {
    console.error('❌ Failed to upload image to IPFS:', error.message);
    return null;
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

    // Add image if provided
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

          // Check for image in cast
          const imageUrl = extractImageFromCast(data);
          
          if (imageUrl) {
            console.log('🖼️  Image found in cast:', imageUrl);
          } else {
            console.log('ℹ️  No image found in cast');
          }

          // Reply with "Processing" message
          const processingMsg = imageUrl 
            ? `🚀 Deploying token ${command.name} (${command.symbol}) with your image on Base... Please wait!`
            : `🚀 Deploying token ${command.name} (${command.symbol}) on Base... Please wait!`;
          
          await replyToCast(castHash, processingMsg);

          // Upload image to IPFS if present
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
            // Reply with success and Clanker link
            const successMsg = result.hasImage
              ? `✅ Token ${command.name} deployed successfully with image!\n\n🔗 Clanker: ${result.clankerLink}\n📜 Contract: ${result.tokenAddress}\n⛓️ TX: https://basescan.org/tx/${result.txHash}\n🖼️ Image on IPFS: ✅`
              : `✅ Token ${command.name} deployed successfully!\n\n🔗 Clanker: ${result.clankerLink}\n📜 Contract: ${result.tokenAddress}\n⛓️ TX: https://basescan.org/tx/${result.txHash}`;
            
            await replyToCast(castHash, successMsg);
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
            `⚠️ Invalid command format. Please use: deploy token name [NAME] symbol [SYMBOL]\n\nOptional: Attach an image for token logo!`
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
    features: ['image-upload', 'ipfs'],
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
  console.log('✨ NEW FEATURES:');
  console.log('   🖼️  Image upload support');
  console.log('   📤 Auto IPFS upload via Pinata');
  console.log('   🎨 Token logo from Farcaster cast');
  console.log('');
  console.log('📝 Usage:');
  console.log('   1. Mention bot: @bot deploy token name WHEN symbol WHEN');
  console.log('   2. Attach image to cast (optional)');
  console.log('   3. Bot auto-deploy with image!');
  console.log('');
});
