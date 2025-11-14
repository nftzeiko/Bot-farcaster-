import express from 'express';
import bodyParser from 'body-parser';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { Clanker } from 'clanker-sdk/v4';
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const neynar = new NeynarAPIClient(process.env.NEYNAR_API_KEY);

const account = privateKeyToAccount(process.env.BASE_WALLET_PRIVATE_KEY);
const publicClient = createPublicClient({ chain: base, transport: http() });
const walletClient = createWalletClient({ account, chain: base, transport: http() });
const clanker = new Clanker({ publicClient, wallet: walletClient });

console.log('🤖 Farcaster Clanker Bot - Manual Mode');
console.log('💼 Wallet:', account.address);

const deploymentHistory = [];

async function deployToken(name, symbol) {
  try {
    console.log(`🚀 Deploying: ${name} (${symbol})`);
    const { txHash, waitForTransaction, error } = await clanker.deploy({
      name,
      symbol,
      tokenAdmin: account.address,
    });

    if (error) return { success: false, error: error.message || 'Deployment failed' };

    console.log('⏳ Waiting for confirmation...');
    const result = await waitForTransaction();
    console.log('✅ Success! Token:', result.tokenAddress);

    return {
      success: true,
      txHash,
      tokenAddress: result.tokenAddress,
      clankerLink: `https://clanker.world/clanker/${result.tokenAddress}`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function replyToCast(castHash, message) {
  try {
    await neynar.publishCast(process.env.SIGNER_UUID, message, { replyTo: castHash });
    console.log('✅ Reply sent');
    return { success: true };
  } catch (error) {
    console.error('❌ Reply failed:', error.message);
    return { success: false, error: error.message };
  }
}

app.post('/api/deploy', async (req, res) => {
  try {
    const { tokenName, tokenSymbol, castHash } = req.body;
    if (!tokenName || !tokenSymbol) {
      return res.status(400).json({ success: false, error: 'Name and symbol required' });
    }

    if (castHash) {
      await replyToCast(castHash, `🚀 Deploying ${tokenName} (${tokenSymbol})...`);
    }

    const result = await deployToken(tokenName, tokenSymbol);

    if (result.success) {
      deploymentHistory.unshift({
        tokenName,
        tokenSymbol,
        ...result,
        timestamp: new Date().toISOString(),
      });

      if (castHash) {
        await replyToCast(
          castHash,
          `✅ ${tokenName} deployed!\n\n🔗 ${result.clankerLink}\n📜 ${result.tokenAddress}\n⛓️ https://basescan.org/tx/${result.txHash}`
        );
      }

      res.json({ success: true, ...result });
    } else {
      if (castHash) await replyToCast(castHash, `❌ Failed: ${result.error}`);
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/history', (req, res) => {
  res.json({ success: true, deployments: deploymentHistory });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', wallet: account.address, mode: 'manual' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
});
