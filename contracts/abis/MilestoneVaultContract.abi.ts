import { ABIDataTypes, BitcoinAbiTypes, OP_NET_ABI } from 'opnet';

export const MilestoneVaultContractEvents = [];

export const MilestoneVaultContractAbi = [
    {
        name: 'lockFunds',
        inputs: [{ name: 'amount', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'approveMilestone',
        inputs: [{ name: 'milestoneId', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'releaseFunds',
        inputs: [
            { name: 'milestoneId', type: ABIDataTypes.UINT256 },
            { name: 'amount', type: ABIDataTypes.UINT256 },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getVaultInfo',
        constant: true,
        inputs: [],
        outputs: [
            { name: 'locked', type: ABIDataTypes.UINT256 },
            { name: 'released', type: ABIDataTypes.UINT256 },
            { name: 'approved', type: ABIDataTypes.UINT256 },
            { name: 'total', type: ABIDataTypes.UINT256 },
        ],
        type: BitcoinAbiTypes.Function,
    },
    ...MilestoneVaultContractEvents,
    ...OP_NET_ABI,
];

export default MilestoneVaultContractAbi;
