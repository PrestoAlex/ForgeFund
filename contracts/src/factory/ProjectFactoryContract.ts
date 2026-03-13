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
const PROJECT_COUNT_POINTER: u16 = Blockchain.nextPointer;
const TOTAL_FUNDED_POINTER: u16 = Blockchain.nextPointer;

/**
 * ProjectFactoryContract — Factory для створення краудфандингових проектів
 * 
 * Функції:
 *   - createProject(fundingGoal, deadline) — створює новий проект
 *   - getProjectCount() — view кількість проектів
 *   - getTotalFunded() — view загальна сума зібраних коштів
 */
export class ProjectFactoryContract extends OP_NET {
  private projectCount: StoredU256;
  private totalFunded: StoredU256;

  public constructor() {
    super();
    this.projectCount = new StoredU256(PROJECT_COUNT_POINTER, EMPTY_POINTER);
    this.totalFunded = new StoredU256(TOTAL_FUNDED_POINTER, EMPTY_POINTER);
  }

  public onDeployment(_calldata: Calldata): void {
    super.onDeployment(_calldata);
    this.projectCount.set(u256.Zero);
    this.totalFunded.set(u256.Zero);
  }

  // ── CREATE PROJECT ──

  @method(
    { name: 'fundingGoal', type: ABIDataTypes.UINT256 },
    { name: 'deadline', type: ABIDataTypes.UINT256 },
  )
  @returns({ name: 'projectId', type: ABIDataTypes.UINT256 })
  public createProject(calldata: Calldata): BytesWriter {
    const fundingGoal = calldata.readU256();
    const deadline = calldata.readU256();

    // Validate inputs
    if (u256.eq(fundingGoal, u256.Zero)) {
      throw new Revert('Funding goal must be greater than zero');
    }

    const currentBlock = Blockchain.block.number;
    if (u256.le(deadline, u256.fromU64(currentBlock))) {
      throw new Revert('Deadline must be in the future');
    }

    // Increment project count
    const current = this.projectCount.value;
    const newProjectId = u256.add(current, u256.One);
    this.projectCount.set(newProjectId);

    const writer = new BytesWriter(U256_BYTE_LENGTH);
    writer.writeU256(newProjectId);
    return writer;
  }

  // ── RECORD FUNDING ──

  @method({ name: 'amount', type: ABIDataTypes.UINT256 })
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public recordFunding(calldata: Calldata): BytesWriter {
    const amount = calldata.readU256();

    const current = this.totalFunded.value;
    const newTotal = u256.add(current, amount);
    this.totalFunded.set(newTotal);

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  // ── VIEW METHODS ──

  @view()
  @method()
  @returns({ name: 'count', type: ABIDataTypes.UINT256 })
  public getProjectCount(_calldata: Calldata): BytesWriter {
    const writer = new BytesWriter(U256_BYTE_LENGTH);
    writer.writeU256(this.projectCount.value);
    return writer;
  }

  @view()
  @method()
  @returns({ name: 'total', type: ABIDataTypes.UINT256 })
  public getTotalFunded(_calldata: Calldata): BytesWriter {
    const writer = new BytesWriter(U256_BYTE_LENGTH);
    writer.writeU256(this.totalFunded.value);
    return writer;
  }
}
