import { CONTRACT_ADDRESSES, OPNET_CONFIG } from '../config/contracts';

type AbiEntry = {
  type: string;
  name: string;
  inputs?: { name: string; type: string }[];
  outputs?: { name: string; type: string }[];
};

const ESCROW_ENGINE_ABI: AbiEntry[] = [
  {
    type: 'function',
    name: 'deposit',
    inputs: [
      { name: 'taskId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'release',
    inputs: [
      { name: 'taskId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'refund',
    inputs: [
      { name: 'taskId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'getEscrowInfo',
    inputs: [],
    outputs: [
      { name: 'deposited', type: 'uint256' },
      { name: 'released', type: 'uint256' },
      { name: 'refunded', type: 'uint256' },
    ],
  },
];

let sdkPromise: Promise<any> | null = null;

async function loadSDK() {
  if (!sdkPromise) {
    sdkPromise = import('opnet');
  }
  return sdkPromise;
}

async function normalizeAbi(abi: AbiEntry[]): Promise<AbiEntry[]> {
  const { ABIDataTypes, BitcoinAbiTypes } = await loadSDK();
  return abi.map((entry: AbiEntry) => ({
    ...entry,
    type:
      typeof entry.type === 'string' && entry.type.toLowerCase() === 'function'
        ? BitcoinAbiTypes.Function
        : entry.type,
    inputs: (entry.inputs || []).map((input) => ({
      ...input,
      type: normalizeAbiType(input.type, ABIDataTypes),
    })),
    outputs: (entry.outputs || []).map((output) => ({
      ...output,
      type: normalizeAbiType(output.type, ABIDataTypes),
    })),
  }));
}

function normalizeAbiType(type: string, ABIDataTypes: Record<string, unknown>) {
  const map: Record<string, any> = {
    uint256: ABIDataTypes.UINT256,
    bool: ABIDataTypes.BOOL,
    address: ABIDataTypes.ADDRESS,
    string: ABIDataTypes.STRING,
    bytes: ABIDataTypes.BYTES,
  };
  return map[type] || type;
}

async function resolveNetwork(networkOverride?: string | object) {
  if (networkOverride && typeof networkOverride === 'object') {
    return networkOverride;
  }

  const { networks } = await import('@btc-vision/bitcoin');

  if (networkOverride === 'mainnet' || networkOverride === 'bitcoin') {
    return networks.bitcoin;
  }

  return networks.opnetTestnet;
}

export async function getEscrowEngineContract() {
  const { getContract, JSONRpcProvider } = await loadSDK();
  const btcNetwork = await resolveNetwork('testnet');

  const provider = new JSONRpcProvider({
    url: OPNET_CONFIG.rpcUrl,
    network: btcNetwork,
  });

  const normalizedAbi = await normalizeAbi(ESCROW_ENGINE_ABI);

  return getContract(
    CONTRACT_ADDRESSES.escrowEngine,
    normalizedAbi,
    provider,
    btcNetwork,
  );
}

export class EscrowEngineService {
  private senderAddress: string | null = null;

  setSenderAddress(address: string) {
    this.senderAddress = address;
  }

  private ensureWallet() {
    if (!this.senderAddress) {
      throw new Error('Wallet not connected');
    }
  }

  private async sendTransaction(simulation: any) {
    this.ensureWallet();
    const btcNetwork = await resolveNetwork('testnet');

    const receipt = await simulation.sendTransaction({
      refundTo: this.senderAddress!,
      feeRate: 5,
      maximumAllowedSatToSpend: 100000n,
      network: btcNetwork,
    });

    return receipt.id;
  }

  async deposit(taskId: string, amount: string) {
    this.ensureWallet();
    const contract = await getEscrowEngineContract();
    const taskIdBigInt = BigInt(taskId || '0');
    const amountBigInt = BigInt(Math.floor(parseFloat(amount || '0') * 1e18));
    const simulation = await contract.deposit(taskIdBigInt, amountBigInt);
    return this.sendTransaction(simulation);
  }

  async release(taskId: string, amount: string) {
    this.ensureWallet();
    const contract = await getEscrowEngineContract();
    const taskIdBigInt = BigInt(taskId || '0');
    const amountBigInt = BigInt(Math.floor(parseFloat(amount || '0') * 1e18));
    const simulation = await contract.release(taskIdBigInt, amountBigInt);
    return this.sendTransaction(simulation);
  }

  async refund(taskId: string, amount: string) {
    this.ensureWallet();
    const contract = await getEscrowEngineContract();
    const taskIdBigInt = BigInt(taskId || '0');
    const amountBigInt = BigInt(Math.floor(parseFloat(amount || '0') * 1e18));
    const simulation = await contract.refund(taskIdBigInt, amountBigInt);
    return this.sendTransaction(simulation);
  }

  async getEscrowInfo() {
    const contract = await getEscrowEngineContract();
    const result = await contract.getEscrowInfo();
    return {
      deposited: result.deposited?.toString() || '0',
      released: result.released?.toString() || '0',
      refunded: result.refunded?.toString() || '0',
    };
  }
}

export const escrowEngineService = new EscrowEngineService();
