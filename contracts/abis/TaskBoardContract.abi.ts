import { ABIDataTypes, BitcoinAbiTypes, OP_NET_ABI } from 'opnet';

export const TaskBoardContractEvents = [];

export const TaskBoardContractAbi = [
    {
        name: 'createTask',
        inputs: [
            { name: 'reward', type: ABIDataTypes.UINT256 },
            { name: 'deadline', type: ABIDataTypes.UINT256 },
        ],
        outputs: [{ name: 'taskId', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'assignTask',
        inputs: [{ name: 'taskId', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'completeTask',
        inputs: [{ name: 'taskId', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getTaskBoardInfo',
        constant: true,
        inputs: [],
        outputs: [
            { name: 'totalTasks', type: ABIDataTypes.UINT256 },
            { name: 'completedTasks', type: ABIDataTypes.UINT256 },
            { name: 'totalRewards', type: ABIDataTypes.UINT256 },
        ],
        type: BitcoinAbiTypes.Function,
    },
    ...TaskBoardContractEvents,
    ...OP_NET_ABI,
];

export default TaskBoardContractAbi;
