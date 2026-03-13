import { u256 } from '@btc-vision/as-bignum/assembly';
import {
  Blockchain,
  BytesWriter,
  Calldata,
  EMPTY_POINTER,
  OP_NET,
  Revert,
  StoredU256,
  U256_BYTE_LENGTH,
} from '@btc-vision/btc-runtime/runtime';

declare function method(...args: any[]): any;
declare function returns(...args: any[]): any;
declare function view(...args: any[]): any;
declare const ABIDataTypes: any;

// Storage pointers
const LOCKED_FUNDS_POINTER: u16 = Blockchain.nextPointer;
const RELEASED_FUNDS_POINTER: u16 = Blockchain.nextPointer;
const MILESTONE_APPROVED_POINTER: u16 = Blockchain.nextPointer;
const MILESTONE_COUNT_POINTER: u16 = Blockchain.nextPointer;

/**
 * MilestoneVaultContract — Vault для блокування та випуску коштів по мілейстоунах
 * 
 * Функції:
 *   - lockFunds(amount) — блокує кошти в vault
 *   - approveMilestone(milestoneId) — затверджує мілейстоун
 *   - releaseFunds(milestoneId, amount) — випускає кошти за затвердженим мілейстоуном
 *   - getVaultInfo() — view інформація про vault
 */
export class MilestoneVaultContract extends OP_NET {
  private lockedFunds: StoredU256;
  private releasedFunds: StoredU256;
  private milestoneApproved: StoredU256;
  private milestoneCount: StoredU256;

  public constructor() {
    super();
    this.lockedFunds = new StoredU256(LOCKED_FUNDS_POINTER, EMPTY_POINTER);
    this.releasedFunds = new StoredU256(RELEASED_FUNDS_POINTER, EMPTY_POINTER);
    this.milestoneApproved = new StoredU256(MILESTONE_APPROVED_POINTER, EMPTY_POINTER);
    this.milestoneCount = new StoredU256(MILESTONE_COUNT_POINTER, EMPTY_POINTER);
  }

  public onDeployment(_calldata: Calldata): void {
    super.onDeployment(_calldata);
    this.lockedFunds.set(u256.Zero);
    this.releasedFunds.set(u256.Zero);
    this.milestoneApproved.set(u256.Zero);
    this.milestoneCount.set(u256.Zero);
  }

  // ── LOCK FUNDS ──

  @method({ name: 'amount', type: ABIDataTypes.UINT256 })
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public lockFunds(calldata: Calldata): BytesWriter {
    const amount = calldata.readU256();

    if (u256.eq(amount, u256.Zero)) {
      throw new Revert('Amount must be greater than zero');
    }

    const current = this.lockedFunds.value;
    const newLocked = u256.add(current, amount);
    this.lockedFunds.set(newLocked);

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  // ── APPROVE MILESTONE ──

  @method({ name: 'milestoneId', type: ABIDataTypes.UINT256 })
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public approveMilestone(calldata: Calldata): BytesWriter {
    const milestoneId = calldata.readU256();

    // Increment approved count
    const current = this.milestoneApproved.value;
    const newApproved = u256.add(current, u256.One);
    this.milestoneApproved.set(newApproved);

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  // ── RELEASE FUNDS ──

  @method(
    { name: 'milestoneId', type: ABIDataTypes.UINT256 },
    { name: 'amount', type: ABIDataTypes.UINT256 },
  )
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public releaseFunds(calldata: Calldata): BytesWriter {
    const milestoneId = calldata.readU256();
    const amount = calldata.readU256();

    // Check if enough locked funds
    if (u256.gt(amount, this.lockedFunds.value)) {
      throw new Revert('Insufficient locked funds');
    }

    // Update balances
    const currentLocked = this.lockedFunds.value;
    const newLocked = u256.sub(currentLocked, amount);
    this.lockedFunds.set(newLocked);

    const currentReleased = this.releasedFunds.value;
    const newReleased = u256.add(currentReleased, amount);
    this.releasedFunds.set(newReleased);

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  // ── VIEW METHODS ──

  @view()
  @method()
  @returns(
    { name: 'locked', type: ABIDataTypes.UINT256 },
    { name: 'released', type: ABIDataTypes.UINT256 },
    { name: 'approved', type: ABIDataTypes.UINT256 },
    { name: 'total', type: ABIDataTypes.UINT256 },
  )
  public getVaultInfo(_calldata: Calldata): BytesWriter {
    const writer = new BytesWriter(U256_BYTE_LENGTH * 4);
    writer.writeU256(this.lockedFunds.value);
    writer.writeU256(this.releasedFunds.value);
    writer.writeU256(this.milestoneApproved.value);
    writer.writeU256(this.milestoneCount.value);
    return writer;
  }
}
