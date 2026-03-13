import { CONTRACT_ADDRESSES, OPNET_CONFIG } from '../config/contracts';

type AbiEntry = {
  type: string;
  name: string;
  inputs?: { name: string; type: string }[];
  outputs?: { name: string; type: string }[];
};

export const TASK_BOARD_ABI: AbiEntry[] = [
  {
    type: 'function',
    name: 'createTask',
    inputs: [
      { name: 'reward', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
    outputs: [{ name: 'taskId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'assignTask',
    inputs: [{ name: 'taskId', type: 'uint256' }],
    outputs: [{ name: 'success', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'completeTask',
    inputs: [{ name: 'taskId', type: 'uint256' }],
    outputs: [{ name: 'success', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'getTaskBoardInfo',
    inputs: [],
    outputs: [
      { name: 'totalTasks', type: 'uint256' },
      { name: 'completedTasks', type: 'uint256' },
      { name: 'totalRewards', type: 'uint256' },
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

export async function getTaskBoardContract() {
  const { getContract, JSONRpcProvider } = await loadSDK();
  const btcNetwork = await resolveNetwork('testnet');

  const provider = new JSONRpcProvider({
    url: OPNET_CONFIG.rpcUrl,
    network: btcNetwork,
  });

  const normalizedAbi = await normalizeAbi(TASK_BOARD_ABI);

  return getContract(
    CONTRACT_ADDRESSES.taskBoard,
    normalizedAbi,
    provider,
    btcNetwork,
  );
}

export class TaskBoardService {
  private senderAddress: string | null = null;
  private contractAddress: string;

  constructor() {
    this.contractAddress = CONTRACT_ADDRESSES.taskBoard;
  }

  setSenderAddress(address: string) {
    this.senderAddress = address;
  }

  async createTask(reward: string, deadlineDays: number): Promise<string | null> {
    if (!this.senderAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = await getTaskBoardContract();
      const rewardBigInt = BigInt(Math.floor(parseFloat(reward || '0') * 1e18));
      const currentBlock = Math.floor(Date.now() / 1000 / 600);
      const deadline = currentBlock + Number(deadlineDays || 1) * 144;
      const deadlineBigInt = BigInt(deadline);

      const simulation = await contract.createTask(rewardBigInt, deadlineBigInt);
      const btcNetwork = await resolveNetwork('testnet');

      const receipt = await simulation.sendTransaction({
        refundTo: this.senderAddress,
        feeRate: 5,
        maximumAllowedSatToSpend: 100000n,
        network: btcNetwork,
      });

      return receipt.id;
    } catch (error) {
      console.error('❌ Error creating task:', error);
      throw error;
    }
  }

  async assignTask(taskId: string): Promise<string | null> {
    if (!this.senderAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = await getTaskBoardContract();
      const taskIdBigInt = BigInt(taskId || '0');

      const simulation = await contract.assignTask(taskIdBigInt);
      const btcNetwork = await resolveNetwork('testnet');

      const receipt = await simulation.sendTransaction({
        refundTo: this.senderAddress,
        feeRate: 5,
        maximumAllowedSatToSpend: 100000n,
        network: btcNetwork,
      });

      return receipt.id;
    } catch (error) {
      console.error('❌ Error assigning task:', error);
      throw error;
    }
  }

  async completeTask(taskId: string): Promise<string | null> {
    if (!this.senderAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = await getTaskBoardContract();
      const taskIdBigInt = BigInt(taskId || '0');

      const simulation = await contract.completeTask(taskIdBigInt);
      const btcNetwork = await resolveNetwork('testnet');

      const receipt = await simulation.sendTransaction({
        refundTo: this.senderAddress,
        feeRate: 5,
        maximumAllowedSatToSpend: 100000n,
        network: btcNetwork,
      });

      return receipt.id;
    } catch (error) {
      console.error('❌ Error completing task:', error);
      throw error;
    }
  }

  async getTaskBoardInfo() {
    try {
      const contract = await getTaskBoardContract();
      const result = await contract.getTaskBoardInfo();
      return {
        totalTasks: result.totalTasks?.toString() || '0',
        completedTasks: result.completedTasks?.toString() || '0',
        totalRewards: result.totalRewards?.toString() || '0',
      };
    } catch (error) {
      console.error('❌ Error fetching task board info:', error);
      throw error;
    }
  }
}

export const taskBoardService = new TaskBoardService();
