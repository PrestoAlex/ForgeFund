import { ABIDataTypes, BitcoinAbiTypes, OP_NET_ABI } from 'opnet';

export const EscrowEngineContractEvents = [];

export const EscrowEngineContractAbi = [
    {
        name: 'deposit',
        inputs: [
            { name: 'taskId', type: ABIDataTypes.UINT256 },
            { name: 'amount', type: ABIDataTypes.UINT256 },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'release',
        inputs: [
            { name: 'taskId', type: ABIDataTypes.UINT256 },
            { name: 'amount', type: ABIDataTypes.UINT256 },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'refund',
        inputs: [
            { name: 'taskId', type: ABIDataTypes.UINT256 },
            { name: 'amount', type: ABIDataTypes.UINT256 },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getEscrowInfo',
        constant: true,
        inputs: [],
        outputs: [
            { name: 'deposited', type: ABIDataTypes.UINT256 },
            { name: 'released', type: ABIDataTypes.UINT256 },
            { name: 'refunded', type: ABIDataTypes.UINT256 },
        ],
        type: BitcoinAbiTypes.Function,
    },
    ...EscrowEngineContractEvents,
    ...OP_NET_ABI,
];

export default EscrowEngineContractAbi;
