import { Address, AddressMap, ExtendedAddressMap, SchnorrSignature } from '@btc-vision/transaction';
import { CallResult, OPNetEvent, IOP_NETContract } from 'opnet';

// ------------------------------------------------------------------
// Event Definitions
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// Call Results
// ------------------------------------------------------------------

/**
 * @description Represents the result of the deposit function call.
 */
export type Deposit = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the release function call.
 */
export type Release = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the refund function call.
 */
export type Refund = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getEscrowInfo function call.
 */
export type GetEscrowInfo = CallResult<
    {
        deposited: bigint;
        released: bigint;
        refunded: bigint;
    },
    OPNetEvent<never>[]
>;

// ------------------------------------------------------------------
// IEscrowEngineContract
// ------------------------------------------------------------------
export interface IEscrowEngineContract extends IOP_NETContract {
    deposit(taskId: bigint, amount: bigint): Promise<Deposit>;
    release(taskId: bigint, amount: bigint): Promise<Release>;
    refund(taskId: bigint, amount: bigint): Promise<Refund>;
    getEscrowInfo(): Promise<GetEscrowInfo>;
}
