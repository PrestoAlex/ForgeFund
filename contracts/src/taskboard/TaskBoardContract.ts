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
const TASK_COUNT_POINTER: u16 = Blockchain.nextPointer;
const TOTAL_REWARDS_POINTER: u16 = Blockchain.nextPointer;
const COMPLETED_TASKS_POINTER: u16 = Blockchain.nextPointer;

/**
 * TaskBoardContract — Task board для управління завданнями
 * 
 * Функції:
 *   - createTask(reward, deadline) — створює нове завдання
 *   - assignTask(taskId) — призначає завдання розробнику
 *   - completeTask(taskId) — позначає завдання як виконане
 *   - getTaskBoardInfo() — view інформація про task board
 */
export class TaskBoardContract extends OP_NET {
  private taskCount: StoredU256;
  private totalRewards: StoredU256;
  private completedTasks: StoredU256;

  public constructor() {
    super();
    this.taskCount = new StoredU256(TASK_COUNT_POINTER, EMPTY_POINTER);
    this.totalRewards = new StoredU256(TOTAL_REWARDS_POINTER, EMPTY_POINTER);
    this.completedTasks = new StoredU256(COMPLETED_TASKS_POINTER, EMPTY_POINTER);
  }

  public onDeployment(_calldata: Calldata): void {
    super.onDeployment(_calldata);
    this.taskCount.set(u256.Zero);
    this.totalRewards.set(u256.Zero);
    this.completedTasks.set(u256.Zero);
  }

  // ── CREATE TASK ──

  @method(
    { name: 'reward', type: ABIDataTypes.UINT256 },
    { name: 'deadline', type: ABIDataTypes.UINT256 },
  )
  @returns({ name: 'taskId', type: ABIDataTypes.UINT256 })
  public createTask(calldata: Calldata): BytesWriter {
    const reward = calldata.readU256();
    const deadline = calldata.readU256();

    if (u256.eq(reward, u256.Zero)) {
      throw new Revert('Reward must be greater than zero');
    }

    const currentBlock = Blockchain.block.number;
    if (u256.le(deadline, u256.fromU64(currentBlock))) {
      throw new Revert('Deadline must be in the future');
    }

    // Increment task count
    const current = this.taskCount.value;
    const newTaskId = u256.add(current, u256.One);
    this.taskCount.set(newTaskId);

    // Add to total rewards
    const currentRewards = this.totalRewards.value;
    const newRewards = u256.add(currentRewards, reward);
    this.totalRewards.set(newRewards);

    const writer = new BytesWriter(U256_BYTE_LENGTH);
    writer.writeU256(newTaskId);
    return writer;
  }

  // ── ASSIGN TASK ──

  @method({ name: 'taskId', type: ABIDataTypes.UINT256 })
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public assignTask(calldata: Calldata): BytesWriter {
    const taskId = calldata.readU256();

    // Validate task exists
    if (u256.gt(taskId, this.taskCount.value)) {
      throw new Revert('Task does not exist');
    }

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  // ── COMPLETE TASK ──

  @method({ name: 'taskId', type: ABIDataTypes.UINT256 })
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public completeTask(calldata: Calldata): BytesWriter {
    const taskId = calldata.readU256();

    // Validate task exists
    if (u256.gt(taskId, this.taskCount.value)) {
      throw new Revert('Task does not exist');
    }

    // Increment completed count
    const current = this.completedTasks.value;
    const newCompleted = u256.add(current, u256.One);
    this.completedTasks.set(newCompleted);

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  // ── VIEW METHODS ──

  @view()
  @method()
  @returns(
    { name: 'totalTasks', type: ABIDataTypes.UINT256 },
    { name: 'completedTasks', type: ABIDataTypes.UINT256 },
    { name: 'totalRewards', type: ABIDataTypes.UINT256 },
  )
  public getTaskBoardInfo(_calldata: Calldata): BytesWriter {
    const writer = new BytesWriter(U256_BYTE_LENGTH * 3);
    writer.writeU256(this.taskCount.value);
    writer.writeU256(this.completedTasks.value);
    writer.writeU256(this.totalRewards.value);
    return writer;
  }
}
