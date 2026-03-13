import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { JSONRpcProvider } from 'opnet';
import {
  AddressTypes,
  MLDSASecurityLevel,
  Mnemonic,
  TransactionFactory,
} from '@btc-vision/transaction';
import { networks } from '@btc-vision/bitcoin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const rpcUrl = process.env.RPC_URL || 'https://testnet.opnet.org';
const networkName = process.env.NETWORK || 'testnet';
const wasmPath = process.env.WASM_PATH || './build/ProjectFactory.wasm';
const feeRate = Number(process.env.FEE_RATE || 5);
const priorityFee = BigInt(process.env.PRIORITY_FEE || '0');
const gasSatFee = BigInt('100000');

const networkByName: Record<string, any> = {
  mainnet: networks.bitcoin,
  bitcoin: networks.bitcoin,
  testnet: networks.opnetTestnet,
  regtest: networks.regtest,
};

function clampFeeRate(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(888, Math.floor(value)));
}

function normalizeRawTransaction(rawTx: unknown): string {
  if (!rawTx) {
    throw new Error('Raw transaction is empty');
  }

  if (typeof rawTx === 'string') {
    const normalized = rawTx.trim();
    const noPrefix = normalized.startsWith('0x') ? normalized.slice(2) : normalized;

    if (/^[0-9a-fA-F]+$/.test(noPrefix) && noPrefix.length % 2 === 0) {
      return noPrefix;
    }

    if (/^[A-Za-z0-9+/=]+$/.test(normalized)) {
      return Buffer.from(normalized, 'base64').toString('hex');
    }

    throw new Error('Raw transaction string is neither valid hex nor base64');
  }

  if (rawTx instanceof Uint8Array) {
    return Buffer.from(rawTx).toString('hex');
  }

  if (Array.isArray(rawTx)) {
    return Buffer.from(rawTx).toString('hex');
  }

  throw new Error(`Unsupported raw transaction type: ${typeof rawTx}`);
}

async function main(): Promise<void> {
  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) {
    throw new Error('MNEMONIC is required in .env');
  }

  const btcNetwork = networkByName[networkName] || networks.opnetTestnet;
  const wallet = new Mnemonic(
    mnemonic,
    '',
    btcNetwork,
    MLDSASecurityLevel.LEVEL2,
  ).deriveOPWallet(AddressTypes.P2TR, 0);

  const provider = new JSONRpcProvider({
    url: rpcUrl,
    network: btcNetwork,
  });

  const bytecode = fs.readFileSync(path.resolve(__dirname, wasmPath));
  const challenge = await provider.getChallenge();
  const utxos = await provider.utxoManager.getUTXOs({
    address: wallet.p2tr,
    optimize: false,
  });

  if (!utxos.length) {
    throw new Error(`No UTXOs found for ${wallet.p2tr}`);
  }

  const balance = utxos.reduce((sum, utxo) => sum + utxo.value, 0n);
  const appliedFeeRate = clampFeeRate(feeRate);

  console.log('=== ForgeFund Contract Deployment ===');
  console.log(`Network: ${networkName}`);
  console.log(`RPC: ${rpcUrl}`);
  console.log(`Deployer: ${wallet.p2tr}`);
  console.log(`Balance: ${balance} sats`);
  console.log(`Fee rate: ${appliedFeeRate} sat/vB`);
  console.log(`Gas sat fee: ${gasSatFee} sats`);
  console.log(`WASM: ${wasmPath}`);

  const factory = new TransactionFactory();
  const deployment = await factory.signDeployment({
    signer: wallet.keypair,
    mldsaSigner: wallet.mldsaKeypair,
    bytecode: new Uint8Array(bytecode),
    network: btcNetwork,
    from: wallet.p2tr,
    utxos,
    feeRate: appliedFeeRate,
    challenge,
    priorityFee,
    gasSatFee,
    calldata: undefined,
    linkMLDSAPublicKeyToAddress: true,
    revealMLDSAPublicKey: true,
  });

  console.log(`Contract address: ${deployment.contractAddress}`);

  const fundingRawTx = normalizeRawTransaction(deployment.transaction[0]);
  const deployRawTx = normalizeRawTransaction(deployment.transaction[1]);

  const fundingResult = await provider.sendRawTransaction(fundingRawTx, false);
  if (!fundingResult.success) {
    throw new Error(`Funding TX broadcast failed: ${JSON.stringify(fundingResult)}`);
  }

  const fundingTxid = fundingResult.result || JSON.stringify(fundingResult);
  console.log(`Funding TX: ${fundingTxid}`);

  const deployResult = await provider.sendRawTransaction(deployRawTx, false);
  if (!deployResult.success) {
    throw new Error(`Deploy TX broadcast failed: ${JSON.stringify(deployResult)}`);
  }

  const deployTxid = deployResult.result || JSON.stringify(deployResult);
  console.log(`Deploy TX: ${deployTxid}`);
  console.log(`Contract address: ${deployment.contractAddress}`);

  console.log('\nVerifying deployment on-chain (polling every 10s, up to 5 min)...');
  let confirmed = false;
  for (let i = 0; i < 30; i++) {
    try {
      const tx: any = await (provider as any).getTransaction(deployTxid);
      if (tx && tx.failed) {
        throw new Error(`Deploy reverted on-chain: ${tx.revert || 'unknown reason'}`);
      }
      if (tx && !tx.failed) {
        confirmed = true;
        console.log(`TX confirmed at block ${tx.blockNumber || '?'}`);
        break;
      }
    } catch (e: any) {
      if (e.message.includes('reverted')) throw e;
    }
    process.stdout.write('.');
    await new Promise(r => setTimeout(r, 10000));
  }

  if (!confirmed) {
    console.warn('\nTX not confirmed after 5 min. Check explorer manually.');
  } else {
    try {
      const code = await (provider as any).getCode(deployment.contractAddress);
      if (code) {
        console.log('Bytecode verified! Contract is LIVE.');
      } else {
        console.error('No bytecode at address — deploy may have reverted.');
      }
    } catch (e: any) {
      console.warn(`getCode check failed: ${e.message}`);
    }
  }
}

main().catch((error) => {
  console.error('Deploy failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});
