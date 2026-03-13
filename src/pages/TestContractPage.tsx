import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TestTube, Rocket, AlertCircle, CheckCircle, Layers, Kanban, Scale } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { projectFactoryService } from '../services/projectFactoryService';
import { milestoneVaultService } from '../services/milestoneVaultService';
import { taskBoardService } from '../services/taskBoardService';
import { escrowEngineService } from '../services/escrowEngineService';
import { CONTRACT_ADDRESSES } from '../config/contracts';

export default function TestContractPage() {
  const { wallet, showToast } = useApp();
  const [projectCount, setProjectCount] = useState<string>('0');
  const [totalFunded, setTotalFunded] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [vaultInfo, setVaultInfo] = useState({ locked: '0', released: '0', approved: '0', total: '0' });
  const [vaultInputs, setVaultInputs] = useState({ amount: '0.05', milestoneId: '1' });
  const [taskBoardInfo, setTaskBoardInfo] = useState({ totalTasks: '0', completedTasks: '0', totalRewards: '0' });
  const [taskInputs, setTaskInputs] = useState({ reward: '0.02', deadline: '1', taskId: '1' });
  const [escrowInfo, setEscrowInfo] = useState({ deposited: '0', released: '0', refunded: '0' });
  const [escrowInputs, setEscrowInputs] = useState({ taskId: '1', amount: '0.03' });

  useEffect(() => {
    if (wallet.connected) {
      projectFactoryService.setSenderAddress(wallet.address!);
      milestoneVaultService.setSenderAddress(wallet.address!);
      taskBoardService.setSenderAddress(wallet.address!);
      escrowEngineService.setSenderAddress(wallet.address!);
      loadContractData();
      loadVaultInfo();
      loadTaskBoardInfo();
      loadEscrowInfo();
    }
  }, [wallet]);

  const loadContractData = async () => {
    try {
      const count = await projectFactoryService.getProjectCount();
      const total = await projectFactoryService.getTotalFunded();
      setProjectCount(count);
      setTotalFunded(total);
    } catch (error) {
      console.error('Error loading contract data:', error);
      showToast('Failed to load contract data', 'error');
    }
  };

  const loadEscrowInfo = async () => {
    try {
      const info = await escrowEngineService.getEscrowInfo();
      setEscrowInfo(info);
      addTestResult('Escrow info refreshed', true);
    } catch (error) {
      console.error('Failed to load escrow info', error);
      addTestResult('Failed to load escrow info', false);
    }
  };

  const testCreateTask = async () => {
    setLoading(true);
    try {
      addTestResult('Creating task...', true);
      const tx = await taskBoardService.createTask(taskInputs.reward || '0', Number(taskInputs.deadline || '1'));
      addTestResult(`createTask success! TX: ${tx}`, true);
      await loadTaskBoardInfo();
    } catch (error) {
      console.error('Create task failed', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      addTestResult(`createTask failed: ${msg}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testAssignTask = async () => {
    setLoading(true);
    try {
      addTestResult(`Assigning task #${taskInputs.taskId}...`, true);
      const tx = await taskBoardService.assignTask(taskInputs.taskId || '0');
      addTestResult(`assignTask success! TX: ${tx}`, true);
      await loadTaskBoardInfo();
    } catch (error) {
      console.error('Assign task failed', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      addTestResult(`assignTask failed: ${msg}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testCompleteTask = async () => {
    setLoading(true);
    try {
      addTestResult(`Completing task #${taskInputs.taskId}...`, true);
      const tx = await taskBoardService.completeTask(taskInputs.taskId || '0');
      addTestResult(`completeTask success! TX: ${tx}`, true);
      await loadTaskBoardInfo();
    } catch (error) {
      console.error('Complete task failed', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      addTestResult(`completeTask failed: ${msg}`, false);
    } finally {
      setLoading(false);
    }
  };

  const addTestResult = (message: string, success: boolean) => {
    const icon = success ? '✅' : '❌';
    setTestResults(prev => [...prev, `${icon} ${message}`]);
  };

  const loadVaultInfo = async () => {
    try {
      const info = await milestoneVaultService.getVaultInfo();
      setVaultInfo(info);
      addTestResult('Vault info refreshed', true);
    } catch (error) {
      console.error('Failed to load vault info', error);
      addTestResult('Failed to load vault info', false);
    }
  };

  const loadTaskBoardInfo = async () => {
    try {
      const info = await taskBoardService.getTaskBoardInfo();
      setTaskBoardInfo(info);
      addTestResult('TaskBoard info refreshed', true);
    } catch (error) {
      console.error('Failed to load task board info', error);
      addTestResult('Failed to load task board info', false);
    }
  };

  const handleVaultInputChange = (field: 'amount' | 'milestoneId', value: string) => {
    setVaultInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleTaskInputChange = (field: 'reward' | 'deadline' | 'taskId', value: string) => {
    setTaskInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleEscrowInputChange = (field: 'taskId' | 'amount', value: string) => {
    setEscrowInputs(prev => ({ ...prev, [field]: value }));
  };

  const testLockFunds = async () => {
    setLoading(true);
    try {
      addTestResult('Locking funds in vault...', true);
      const tx = await milestoneVaultService.lockFunds(vaultInputs.amount || '0');
      addTestResult(`lockFunds success! TX: ${tx}`, true);
      await loadVaultInfo();
    } catch (error) {
      console.error('Lock funds failed', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      addTestResult(`lockFunds failed: ${msg}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testApproveMilestone = async () => {
    setLoading(true);
    try {
      addTestResult(`Approving milestone #${vaultInputs.milestoneId}...`, true);
      const tx = await milestoneVaultService.approveMilestone(vaultInputs.milestoneId || '0');
      addTestResult(`approveMilestone success! TX: ${tx}`, true);
      await loadVaultInfo();
    } catch (error) {
      console.error('Approve milestone failed', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      addTestResult(`approveMilestone failed: ${msg}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testReleaseFunds = async () => {
    setLoading(true);
    try {
      addTestResult(`Releasing funds for milestone #${vaultInputs.milestoneId}...`, true);
      const tx = await milestoneVaultService.releaseFunds(vaultInputs.milestoneId || '0', vaultInputs.amount || '0');
      addTestResult(`releaseFunds success! TX: ${tx}`, true);
      await loadVaultInfo();
    } catch (error) {
      console.error('Release funds failed', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      addTestResult(`releaseFunds failed: ${msg}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testDepositEscrow = async () => {
    setLoading(true);
    try {
      addTestResult(`Depositing ${escrowInputs.amount} BTC for task #${escrowInputs.taskId}...`, true);
      const tx = await escrowEngineService.deposit(escrowInputs.taskId || '0', escrowInputs.amount || '0');
      addTestResult(`deposit success! TX: ${tx}`, true);
      await loadEscrowInfo();
    } catch (error) {
      console.error('Deposit failed', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      addTestResult(`deposit failed: ${msg}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testReleaseEscrow = async () => {
    setLoading(true);
    try {
      addTestResult(`Releasing ${escrowInputs.amount} BTC for task #${escrowInputs.taskId}...`, true);
      const tx = await escrowEngineService.release(escrowInputs.taskId || '0', escrowInputs.amount || '0');
      addTestResult(`release success! TX: ${tx}`, true);
      await loadEscrowInfo();
    } catch (error) {
      console.error('Escrow release failed', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      addTestResult(`release failed: ${msg}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testRefundEscrow = async () => {
    setLoading(true);
    try {
      addTestResult(`Refunding ${escrowInputs.amount} BTC for task #${escrowInputs.taskId}...`, true);
      const tx = await escrowEngineService.refund(escrowInputs.taskId || '0', escrowInputs.amount || '0');
      addTestResult(`refund success! TX: ${tx}`, true);
      await loadEscrowInfo();
    } catch (error) {
      console.error('Escrow refund failed', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      addTestResult(`refund failed: ${msg}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testCreateProject = async () => {
    setLoading(true);
    try {
      addTestResult('Starting createProject test...', true);
      
      const fundingGoal = '0.1';
      const deadline = Math.floor(Date.now() / 1000 / 600) + 144; // 1 day from now
      
      const txHash = await projectFactoryService.createProject(fundingGoal, deadline);
      addTestResult(`Project created successfully! TX: ${txHash}`, true);
      
      // Refresh data
      await loadContractData();
      addTestResult('Contract data refreshed', true);
      
    } catch (error) {
      console.error('Test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addTestResult(`Test failed: ${errorMessage}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testRecordFunding = async () => {
    setLoading(true);
    try {
      addTestResult('Starting recordFunding test...', true);
      
      const amount = '0.05';
      const txHash = await projectFactoryService.recordFunding(amount);
      addTestResult(`Funding recorded successfully! TX: ${txHash}`, true);
      
      // Refresh data
      await loadContractData();
      addTestResult('Contract data refreshed', true);
      
    } catch (error) {
      console.error('Test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addTestResult(`Test failed: ${errorMessage}`, false);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-surface-700 border border-surface-500 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-btc-500/50 transition-colors';
  const buttonClass = 'px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-12"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <TestTube className="w-10 h-10 text-btc-500" />
            Contract Testing
          </h1>
          <p className="text-gray-400">Test the ProjectFactory, MilestoneVault, TaskBoard & EscrowEngine smart contracts</p>
        </div>

        {/* Contract Info */}
        <div className="bg-surface-800 rounded-2xl p-6 mb-8 border border-surface-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Contract Information
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Contract Address:</span>
              <span className="text-white font-mono text-xs">{CONTRACT_ADDRESSES.projectFactory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Network:</span>
              <span className="text-white">OP_NET Testnet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Project Count:</span>
              <span className="text-white font-mono">{projectCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Funded:</span>
              <span className="text-white font-mono">{totalFunded} wei</span>
            </div>
          </div>
        </div>

        {/* ProjectFactory Test Controls */}
        <div className="bg-surface-800 rounded-2xl p-6 mb-8 border border-surface-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-btc-500" />
            Test Functions
          </h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={testCreateProject}
                disabled={!wallet.connected || loading}
                className={`${buttonClass} ${
                  wallet.connected && !loading
                    ? 'bg-btc-500 hover:bg-btc-600 text-white'
                    : 'bg-surface-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Create Test Project
              </button>
              
              <button
                onClick={testRecordFunding}
                disabled={!wallet.connected || loading}
                className={`${buttonClass} ${
                  wallet.connected && !loading
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-surface-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Record Test Funding
              </button>
              
              <button
                onClick={clearResults}
                className={`${buttonClass} bg-surface-600 hover:bg-surface-500 text-white`}
              >
                Clear Results
              </button>
            </div>
            
            {!wallet.connected && (
              <div className="flex items-center gap-2 text-yellow-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                Please connect your wallet to test contract functions
              </div>
            )}
            
            {loading && (
              <div className="flex items-center gap-2 text-btc-500 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-btc-500 border-t-transparent"></div>
                Processing transaction...
              </div>
            )}
          </div>
        </div>

        {/* MilestoneVault Controls */}
        <div className="bg-surface-800 rounded-2xl p-6 mb-8 border border-surface-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            MilestoneVault Functions
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Amount (BTC)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={vaultInputs.amount}
                  onChange={(e) => handleVaultInputChange('amount', e.target.value)}
                  className={inputClass}
                  placeholder="0.05"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Milestone ID</label>
                <input
                  type="number"
                  min="0"
                  value={vaultInputs.milestoneId}
                  onChange={(e) => handleVaultInputChange('milestoneId', e.target.value)}
                  className={inputClass}
                  placeholder="1"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={testLockFunds}
                disabled={!wallet.connected || loading}
                className={`${buttonClass} ${wallet.connected && !loading ? 'bg-btc-500 hover:bg-btc-600 text-white' : 'bg-surface-600 text-gray-400 cursor-not-allowed'}`}
              >
                Lock Funds
              </button>

              <button
                onClick={testApproveMilestone}
                disabled={!wallet.connected || loading}
                className={`${buttonClass} ${wallet.connected && !loading ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'bg-surface-600 text-gray-400 cursor-not-allowed'}`}
              >
                Approve Milestone
              </button>

              <button
                onClick={testReleaseFunds}
                disabled={!wallet.connected || loading}
                className={`${buttonClass} ${wallet.connected && !loading ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-surface-600 text-gray-400 cursor-not-allowed'}`}
              >
                Release Funds
              </button>

              <button
                onClick={loadVaultInfo}
                disabled={loading}
                className={`${buttonClass} bg-surface-600 hover:bg-surface-500 text-white`}
              >
                Refresh Vault Info
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-surface-900 rounded-xl p-4">
                <p className="text-gray-400 text-xs">Locked</p>
                <p className="text-white font-mono text-lg break-all">{vaultInfo.locked}</p>
              </div>
              <div className="bg-surface-900 rounded-xl p-4">
                <p className="text-gray-400 text-xs">Released</p>
                <p className="text-white font-mono text-lg break-all">{vaultInfo.released}</p>
              </div>
              <div className="bg-surface-900 rounded-xl p-4">
                <p className="text-gray-400 text-xs">Approved</p>
                <p className="text-white font-mono text-lg break-all">{vaultInfo.approved}</p>
              </div>
              <div className="bg-surface-900 rounded-xl p-4">
                <p className="text-gray-400 text-xs">Total Milestones</p>
                <p className="text-white font-mono text-lg break-all">{vaultInfo.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* TaskBoard Controls */}
        <div className="bg-surface-800 rounded-2xl p-6 mb-8 border border-surface-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Kanban className="w-5 h-5 text-emerald-400" />
            TaskBoard Functions
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400">Reward (BTC)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={taskInputs.reward}
                  onChange={(e) => handleTaskInputChange('reward', e.target.value)}
                  className={inputClass}
                  placeholder="0.02"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Deadline (days)</label>
                <input
                  type="number"
                  min="1"
                  value={taskInputs.deadline}
                  onChange={(e) => handleTaskInputChange('deadline', e.target.value)}
                  className={inputClass}
                  placeholder="1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Task ID</label>
                <input
                  type="number"
                  min="1"
                  value={taskInputs.taskId}
                  onChange={(e) => handleTaskInputChange('taskId', e.target.value)}
                  className={inputClass}
                  placeholder="1"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={testCreateTask}
                disabled={!wallet.connected || loading}
                className={`${buttonClass} ${wallet.connected && !loading ? 'bg-btc-500 hover:bg-btc-600 text-white' : 'bg-surface-600 text-gray-400 cursor-not-allowed'}`}
              >
                Create Task
              </button>

              <button
                onClick={testAssignTask}
                disabled={!wallet.connected || loading}
                className={`${buttonClass} ${wallet.connected && !loading ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-surface-600 text-gray-400 cursor-not-allowed'}`}
              >
                Assign Task
              </button>

              <button
                onClick={testCompleteTask}
                disabled={!wallet.connected || loading}
                className={`${buttonClass} ${wallet.connected && !loading ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-surface-600 text-gray-400 cursor-not-allowed'}`}
              >
                Complete Task
              </button>

              <button
                onClick={loadTaskBoardInfo}
                disabled={loading}
                className={`${buttonClass} bg-surface-600 hover:bg-surface-500 text-white`}
              >
                Refresh TaskBoard Info
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-surface-900 rounded-xl p-4">
                <p className="text-gray-400 text-xs">Total Tasks</p>
                <p className="text-white font-mono text-lg break-all">{taskBoardInfo.totalTasks}</p>
              </div>
              <div className="bg-surface-900 rounded-xl p-4">
                <p className="text-gray-400 text-xs">Completed Tasks</p>
                <p className="text-white font-mono text-lg break-all">{taskBoardInfo.completedTasks}</p>
              </div>
              <div className="bg-surface-900 rounded-xl p-4">
                <p className="text-gray-400 text-xs">Total Rewards</p>
                <p className="text-white font-mono text-lg break-all">{taskBoardInfo.totalRewards}</p>
              </div>
            </div>
          </div>
        </div>

        {/* EscrowEngine Controls */}
        <div className="bg-surface-800 rounded-2xl p-6 mb-8 border border-surface-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-rose-400" />
            EscrowEngine Functions
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Task ID</label>
                <input
                  type="number"
                  min="1"
                  value={escrowInputs.taskId}
                  onChange={(e) => handleEscrowInputChange('taskId', e.target.value)}
                  className={inputClass}
                  placeholder="1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Amount (BTC)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={escrowInputs.amount}
                  onChange={(e) => handleEscrowInputChange('amount', e.target.value)}
                  className={inputClass}
                  placeholder="0.03"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={testDepositEscrow}
                disabled={!wallet.connected || loading}
                className={`${buttonClass} ${wallet.connected && !loading ? 'bg-btc-500 hover:bg-btc-600 text-white' : 'bg-surface-600 text-gray-400 cursor-not-allowed'}`}
              >
                Deposit
              </button>

              <button
                onClick={testReleaseEscrow}
                disabled={!wallet.connected || loading}
                className={`${buttonClass} ${wallet.connected && !loading ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-surface-600 text-gray-400 cursor-not-allowed'}`}
              >
                Release
              </button>

              <button
                onClick={testRefundEscrow}
                disabled={!wallet.connected || loading}
                className={`${buttonClass} ${wallet.connected && !loading ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-surface-600 text-gray-400 cursor-not-allowed'}`}
              >
                Refund
              </button>

              <button
                onClick={loadEscrowInfo}
                disabled={loading}
                className={`${buttonClass} bg-surface-600 hover:bg-surface-500 text-white`}
              >
                Refresh Escrow Info
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-surface-900 rounded-xl p-4">
                <p className="text-gray-400 text-xs">Deposited</p>
                <p className="text-white font-mono text-lg break-all">{escrowInfo.deposited}</p>
              </div>
              <div className="bg-surface-900 rounded-xl p-4">
                <p className="text-gray-400 text-xs">Released</p>
                <p className="text-white font-mono text-lg break-all">{escrowInfo.released}</p>
              </div>
              <div className="bg-surface-900 rounded-xl p-4">
                <p className="text-gray-400 text-xs">Refunded</p>
                <p className="text-white font-mono text-lg break-all">{escrowInfo.refunded}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-surface-800 rounded-2xl p-6 border border-surface-700">
            <h2 className="text-xl font-semibold text-white mb-4">Test Results</h2>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono text-gray-300 bg-surface-900 rounded-lg p-3">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
