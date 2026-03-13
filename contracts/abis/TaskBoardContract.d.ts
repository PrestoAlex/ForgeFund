import { Address, AddressMap, ExtendedAddressMap, SchnorrSignature } from '@btc-vision/transaction';
import { CallResult, OPNetEvent, IOP_NETContract } from 'opnet';

// ------------------------------------------------------------------
// Event Definitions
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// Call Results
// ------------------------------------------------------------------

/**
 * @description Represents the result of the createTask function call.
 */
export type CreateTask = CallResult<
    {
        taskId: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the assignTask function call.
 */
export type AssignTask = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the completeTask function call.
 */
export type CompleteTask = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getTaskBoardInfo function call.
 */
export type GetTaskBoardInfo = CallResult<
    {
        totalTasks: bigint;
        completedTasks: bigint;
        totalRewards: bigint;
    },
    OPNetEvent<never>[]
>;

// ------------------------------------------------------------------
// ITaskBoardContract
// ------------------------------------------------------------------
export interface ITaskBoardContract extends IOP_NETContract {
    createTask(reward: bigint, deadline: bigint): Promise<CreateTask>;
    assignTask(taskId: bigint): Promise<AssignTask>;
    completeTask(taskId: bigint): Promise<CompleteTask>;
    getTaskBoardInfo(): Promise<GetTaskBoardInfo>;
}
