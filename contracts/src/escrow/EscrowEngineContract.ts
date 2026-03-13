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
const TOTAL_DEPOSITED_POINTER: u16 = Blockchain.nextPointer;
const TOTAL_RELEASED_POINTER: u16 = Blockchain.nextPointer;
const TOTAL_REFUNDED_POINTER: u16 = Blockchain.nextPointer;

/**
 * EscrowEngineContract — Escrow engine для безпечних BTC виплат
 * 
 * Функції:
 *   - deposit(taskId, amount) — депозит коштів в escrow
 *   - release(taskId, amount) — випуск коштів розробнику
 *   - refund(taskId, amount) — повернення коштів замовнику
 *   - getEscrowInfo() — view інформація про escrow
 */
export class EscrowEngineContract extends OP_NET {
  private totalDeposited: StoredU256;
  private totalReleased: StoredU256;
  private totalRefunded: StoredU256;

  public constructor() {
    super();
    this.totalDeposited = new StoredU256(TOTAL_DEPOSITED_POINTER, EMPTY_POINTER);
    this.totalReleased = new StoredU256(TOTAL_RELEASED_POINTER, EMPTY_POINTER);
    this.totalRefunded = new StoredU256(TOTAL_REFUNDED_POINTER, EMPTY_POINTER);
  }

  public onDeployment(_calldata: Calldata): void {
    super.onDeployment(_calldata);
    this.totalDeposited.set(u256.Zero);
    this.totalReleased.set(u256.Zero);
    this.totalRefunded.set(u256.Zero);
  }

  // ── DEPOSIT ──

  @method(
    { name: 'taskId', type: ABIDataTypes.UINT256 },
    { name: 'amount', type: ABIDataTypes.UINT256 },
  )
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public deposit(calldata: Calldata): BytesWriter {
    const taskId = calldata.readU256();
    const amount = calldata.readU256();

    if (u256.eq(amount, u256.Zero)) {
      throw new Revert('Amount must be greater than zero');
    }

    const current = this.totalDeposited.value;
    const newDeposited = u256.add(current, amount);
    this.totalDeposited.set(newDeposited);

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  // ── RELEASE ──

  @method(
    { name: 'taskId', type: ABIDataTypes.UINT256 },
    { name: 'amount', type: ABIDataTypes.UINT256 },
  )
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public release(calldata: Calldata): BytesWriter {
    const taskId = calldata.readU256();
    const amount = calldata.readU256();

    if (u256.eq(amount, u256.Zero)) {
      throw new Revert('Amount must be greater than zero');
    }

    // Check available balance
    const deposited = this.totalDeposited.value;
    const released = this.totalReleased.value;
    const refunded = this.totalRefunded.value;
    const available = u256.sub(deposited, u256.add(released, refunded));

    if (u256.gt(amount, available)) {
      throw new Revert('Insufficient escrow balance');
    }

    const current = this.totalReleased.value;
    const newReleased = u256.add(current, amount);
    this.totalReleased.set(newReleased);

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  // ── REFUND ──

  @method(
    { name: 'taskId', type: ABIDataTypes.UINT256 },
    { name: 'amount', type: ABIDataTypes.UINT256 },
  )
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public refund(calldata: Calldata): BytesWriter {
    const taskId = calldata.readU256();
    const amount = calldata.readU256();

    if (u256.eq(amount, u256.Zero)) {
      throw new Revert('Amount must be greater than zero');
    }

    // Check available balance
    const deposited = this.totalDeposited.value;
    const released = this.totalReleased.value;
    const refunded = this.totalRefunded.value;
    const available = u256.sub(deposited, u256.add(released, refunded));

    if (u256.gt(amount, available)) {
      throw new Revert('Insufficient escrow balance');
    }

    const current = this.totalRefunded.value;
    const newRefunded = u256.add(current, amount);
    this.totalRefunded.set(newRefunded);

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  // ── VIEW METHODS ──

  @view()
  @method()
  @returns(
    { name: 'deposited', type: ABIDataTypes.UINT256 },
    { name: 'released', type: ABIDataTypes.UINT256 },
    { name: 'refunded', type: ABIDataTypes.UINT256 },
  )
  public getEscrowInfo(_calldata: Calldata): BytesWriter {
    const writer = new BytesWriter(U256_BYTE_LENGTH * 3);
    writer.writeU256(this.totalDeposited.value);
    writer.writeU256(this.totalReleased.value);
    writer.writeU256(this.totalRefunded.value);
    return writer;
  }
}
