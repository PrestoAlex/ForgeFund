import { ABIDataTypes, BitcoinAbiTypes, OP_NET_ABI } from 'opnet';

export const ProjectFactoryContractEvents = [];

export const ProjectFactoryContractAbi = [
    {
        name: 'createProject',
        inputs: [
            { name: 'fundingGoal', type: ABIDataTypes.UINT256 },
            { name: 'deadline', type: ABIDataTypes.UINT256 },
        ],
        outputs: [{ name: 'projectId', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'recordFunding',
        inputs: [{ name: 'amount', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getProjectCount',
        constant: true,
        inputs: [],
        outputs: [{ name: 'count', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getTotalFunded',
        constant: true,
        inputs: [],
        outputs: [{ name: 'total', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    ...ProjectFactoryContractEvents,
    ...OP_NET_ABI,
];

export default ProjectFactoryContractAbi;
