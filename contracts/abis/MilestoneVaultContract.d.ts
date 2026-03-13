import { Address, AddressMap, ExtendedAddressMap, SchnorrSignature } from '@btc-vision/transaction';
import { CallResult, OPNetEvent, IOP_NETContract } from 'opnet';

// ------------------------------------------------------------------
// Event Definitions
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// Call Results
// ------------------------------------------------------------------

/**
 * @description Represents the result of the lockFunds function call.
 */
export type LockFunds = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the approveMilestone function call.
 */
export type ApproveMilestone = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the releaseFunds function call.
 */
export type ReleaseFunds = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getVaultInfo function call.
 */
export type GetVaultInfo = CallResult<
    {
        locked: bigint;
        released: bigint;
        approved: bigint;
        total: bigint;
    },
    OPNetEvent<never>[]
>;

// ------------------------------------------------------------------
// IMilestoneVaultContract
// ------------------------------------------------------------------
export interface IMilestoneVaultContract extends IOP_NETContract {
    lockFunds(amount: bigint): Promise<LockFunds>;
    approveMilestone(milestoneId: bigint): Promise<ApproveMilestone>;
    releaseFunds(milestoneId: bigint, amount: bigint): Promise<ReleaseFunds>;
    getVaultInfo(): Promise<GetVaultInfo>;
}
