import { CONTRACT_ADDRESSES, OPNET_CONFIG } from '../config/contracts';

type AbiEntry = {
  type: string;
  name: string;
  inputs?: { name: string; type: string }[];
  outputs?: { name: string; type: string }[];
};

// MilestoneVault ABI
export const MILESTONE_VAULT_ABI: AbiEntry[] = [
  {
    type: 'function',
    name: 'lockFunds',
    inputs: [
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [
      { name: 'success', type: 'bool' }
    ]
  },
  {
    type: 'function',
    name: 'approveMilestone',
    inputs: [
      { name: 'milestoneId', type: 'uint256' }
    ],
    outputs: [
      { name: 'success', type: 'bool' }
    ]
  },
  {
    type: 'function',
    name: 'releaseFunds',
    inputs: [
      { name: 'milestoneId', type: 'uint256' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [
      { name: 'success', type: 'bool' }
    ]
  },
  {
    type: 'function',
    name: 'getVaultInfo',
    inputs: [],
    outputs: [
      { name: 'locked', type: 'uint256' },
      { name: 'released', type: 'uint256' },
      { name: 'approved', type: 'uint256' },
      { name: 'total', type: 'uint256' }
    ]
  }
];

// Lazy loading SDK
let sdkPromise: Promise<typeof import('opnet')> | null = null;

async function loadSDK() {
  if (!sdkPromise) {
    sdkPromise = import('opnet');
  }
  return sdkPromise;
}

// Normalize ABI for OP_NET
async function normalizeAbi(abi: AbiEntry[]): Promise<AbiEntry[]> {
  const { ABIDataTypes, BitcoinAbiTypes } = await loadSDK();
  return abi.map((entry: AbiEntry) => ({
    ...entry,
    type: typeof entry.type === 'string' && entry.type.toLowerCase() === 'function'
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

function normalizeAbiType(type: string, ABIDataTypes: Record<string, any>) {
  const typeMap: Record<string, any> = {
    uint256: ABIDataTypes.UINT256,
    bool: ABIDataTypes.BOOL,
    address: ABIDataTypes.ADDRESS,
    string: ABIDataTypes.STRING,
    bytes: ABIDataTypes.BYTES,
  };
  return typeMap[type] || type;
}

// Resolve network
async function resolveNetwork(networkOverride?: string | object): Promise<any> {
  if (networkOverride && typeof networkOverride === 'object') {
    return networkOverride;
  }

  const { networks } = await import('@btc-vision/bitcoin');

  if (networkOverride === 'mainnet' || networkOverride === 'bitcoin') {
    return networks.bitcoin;
  }

  return networks.opnetTestnet;
}

// Get contract instance
export async function getMilestoneVaultContract(senderAddress: string): Promise<any> {
  const { getContract, JSONRpcProvider } = await loadSDK();
  
  const btcNetwork = (await resolveNetwork('testnet')) as any;
  
  const provider = new JSONRpcProvider({
    url: OPNET_CONFIG.rpcUrl,
    network: btcNetwork as any,
  });

  const normalizedAbi = await normalizeAbi(MILESTONE_VAULT_ABI);
  
  return getContract(
    CONTRACT_ADDRESSES.milestoneVault,
    normalizedAbi as any,
    provider,
    btcNetwork
  ) as any;
}

// Service class
export class MilestoneVaultService {
  private contractAddress: string;
  private senderAddress: string | null = null;

  constructor() {
    this.contractAddress = CONTRACT_ADDRESSES.milestoneVault;
  }

  setSenderAddress(address: string) {
    this.senderAddress = address;
  }

  // Lock funds in vault
  async lockFunds(amount: string): Promise<string | null> {
    if (!this.senderAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = (await getMilestoneVaultContract(this.senderAddress)) as any;
      
      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 1e18));

      const simulation = await (contract as any).lockFunds(amountBigInt);
      
      const btcNetwork = await resolveNetwork('testnet');
      const receipt = await simulation.sendTransaction({
        refundTo: this.senderAddress,
        feeRate: 5,
        maximumAllowedSatToSpend: 100000n,
        network: btcNetwork,
      });

      return receipt.id;
    } catch (error) {
      console.error('❌ Error locking funds:', error);
      throw error;
    }
  }

  // Approve milestone
  async approveMilestone(milestoneId: string): Promise<string | null> {
    if (!this.senderAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = (await getMilestoneVaultContract(this.senderAddress)) as any;
      
      const milestoneIdBigInt = BigInt(milestoneId);

      const simulation = await (contract as any).approveMilestone(milestoneIdBigInt);
      
      const btcNetwork = await resolveNetwork('testnet');
      const receipt = await simulation.sendTransaction({
        refundTo: this.senderAddress,
        feeRate: 5,
        maximumAllowedSatToSpend: 100000n,
        network: btcNetwork,
      });

      return receipt.id;
    } catch (error) {
      console.error('❌ Error approving milestone:', error);
      throw error;
    }
  }

  // Release funds for milestone
  async releaseFunds(milestoneId: string, amount: string): Promise<string | null> {
    if (!this.senderAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = (await getMilestoneVaultContract(this.senderAddress)) as any;
      
      const milestoneIdBigInt = BigInt(milestoneId);
      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 1e18));

      const simulation = await (contract as any).releaseFunds(milestoneIdBigInt, amountBigInt);
      
      const btcNetwork = await resolveNetwork('testnet');
      const receipt = await simulation.sendTransaction({
        refundTo: this.senderAddress,
        feeRate: 5,
        maximumAllowedSatToSpend: 100000n,
        network: btcNetwork,
      });

      return receipt.id;
    } catch (error) {
      console.error('❌ Error releasing funds:', error);
      throw error;
    }
  }

  // Get vault info (view function)
  async getVaultInfo(): Promise<{ locked: string; released: string; approved: string; total: string }> {
    try {
      const contract = (await getMilestoneVaultContract(this.senderAddress || '')) as any;
      const result = await (contract as any).getVaultInfo();
      
      return {
        locked: result.locked?.toString() || '0',
        released: result.released?.toString() || '0',
        approved: result.approved?.toString() || '0',
        total: result.total?.toString() || '0',
      };
    } catch (error) {
      console.error('❌ Error getting vault info:', error);
      throw error;
    }
  }
}

// Singleton instance
export const milestoneVaultService = new MilestoneVaultService();
