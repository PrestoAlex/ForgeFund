import { Address, AddressMap, ExtendedAddressMap, SchnorrSignature } from '@btc-vision/transaction';
import { CallResult, OPNetEvent, IOP_NETContract } from 'opnet';

// ------------------------------------------------------------------
// Event Definitions
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// Call Results
// ------------------------------------------------------------------

/**
 * @description Represents the result of the createProject function call.
 */
export type CreateProject = CallResult<
    {
        projectId: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the recordFunding function call.
 */
export type RecordFunding = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getProjectCount function call.
 */
export type GetProjectCount = CallResult<
    {
        count: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getTotalFunded function call.
 */
export type GetTotalFunded = CallResult<
    {
        total: bigint;
    },
    OPNetEvent<never>[]
>;

// ------------------------------------------------------------------
// IProjectFactoryContract
// ------------------------------------------------------------------
export interface IProjectFactoryContract extends IOP_NETContract {
    createProject(fundingGoal: bigint, deadline: bigint): Promise<CreateProject>;
    recordFunding(amount: bigint): Promise<RecordFunding>;
    getProjectCount(): Promise<GetProjectCount>;
    getTotalFunded(): Promise<GetTotalFunded>;
}
