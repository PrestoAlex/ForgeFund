import { CONTRACT_ADDRESSES, OPNET_CONFIG } from '../config/contracts';

type AbiEntry = {
  type: string;
  name: string;
  inputs?: { name: string; type: string }[];
  outputs?: { name: string; type: string }[];
};

// ProjectFactory ABI
export const PROJECT_FACTORY_ABI: AbiEntry[] = [
  {
    type: 'function',
    name: 'createProject',
    inputs: [
      { name: 'fundingGoal', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ],
    outputs: [
      { name: 'projectId', type: 'uint256' }
    ]
  },
  {
    type: 'function',
    name: 'recordFunding',
    inputs: [
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [
      { name: 'success', type: 'bool' }
    ]
  },
  {
    type: 'function',
    name: 'getProjectCount',
    inputs: [],
    outputs: [
      { name: 'count', type: 'uint256' }
    ]
  },
  {
    type: 'function',
    name: 'getTotalFunded',
    inputs: [],
    outputs: [
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

// Resolve network like StakeYourTake
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
export async function getProjectFactoryContract(senderAddress: string): Promise<any> {
  const { getContract, JSONRpcProvider } = await loadSDK();
  
  const btcNetwork = (await resolveNetwork('testnet')) as any;
  
  const provider = new JSONRpcProvider({
    url: OPNET_CONFIG.rpcUrl,
    network: btcNetwork as any,
  });

  const normalizedAbi = await normalizeAbi(PROJECT_FACTORY_ABI);
  
  return getContract(
    CONTRACT_ADDRESSES.projectFactory,
    normalizedAbi as any,
    provider,
    btcNetwork
  ) as any;
}

// Service class
export class ProjectFactoryService {
  private contractAddress: string;
  private senderAddress: string | null = null;

  constructor() {
    this.contractAddress = CONTRACT_ADDRESSES.projectFactory;
  }

  setSenderAddress(address: string) {
    this.senderAddress = address;
  }

  // Create a new project
  async createProject(fundingGoal: string, deadline: number): Promise<string | null> {
    if (!this.senderAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = (await getProjectFactoryContract(this.senderAddress)) as any;
      
      // Convert funding goal to BigInt (with 18 decimals)
      const fundingGoalBigInt = BigInt(Math.floor(parseFloat(fundingGoal) * 1e18));
      const deadlineBigInt = BigInt(deadline);

      const simulation = await contract.createProject(fundingGoalBigInt, deadlineBigInt);
      
      const btcNetwork = await resolveNetwork('testnet');
      const receipt = await simulation.sendTransaction({
        refundTo: this.senderAddress,
        feeRate: 5,
        maximumAllowedSatToSpend: 100000n,
        network: btcNetwork,
      });

      return receipt.id;
    } catch (error) {
      console.error('❌ Error creating project:', error);
      throw error;
    }
  }

  // Record funding for a project
  async recordFunding(amount: string): Promise<string | null> {
    if (!this.senderAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = (await getProjectFactoryContract(this.senderAddress)) as any;
      
      // Convert amount to BigInt (with 18 decimals)
      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 1e18));

      const simulation = await (contract as any).recordFunding(amountBigInt);
      
      const btcNetwork = await resolveNetwork('testnet');
      const receipt = await simulation.sendTransaction({
        refundTo: this.senderAddress,
        feeRate: 5,
        maximumAllowedSatToSpend: 100000n,
        network: btcNetwork,
      });

      return receipt.id;
    } catch (error) {
      console.error('❌ Error recording funding:', error);
      throw error;
    }
  }

  // Get project count (view function)
  async getProjectCount(): Promise<string> {
    try {
      const contract = (await getProjectFactoryContract(this.senderAddress || '')) as any;
      const result = await contract.getProjectCount();
      return result.toString();
    } catch (error) {
      console.error('❌ Error getting project count:', error);
      throw error;
    }
  }

  // Get total funded amount (view function)
  async getTotalFunded(): Promise<string> {
    try {
      const contract = (await getProjectFactoryContract(this.senderAddress || '')) as any;
      const result = await (contract as any).getTotalFunded();
      return result.toString();
    } catch (error) {
      console.error('❌ Error getting total funded:', error);
      throw error;
    }
  }
}

// Singleton instance
export const projectFactoryService = new ProjectFactoryService();
