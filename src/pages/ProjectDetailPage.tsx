import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Target, Users, Bitcoin, CheckCircle, Circle, Loader, Lock } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import TaskCard from '../components/TaskCard';
import { useApp } from '../context/AppContext';
import { MilestoneStatus, TaskStatus, ProjectStatus, Task } from '../types';
import { projectFactoryService } from '../services/projectFactoryService';
import { milestoneVaultService } from '../services/milestoneVaultService';
import { escrowEngineService } from '../services/escrowEngineService';
import { taskBoardService } from '../services/taskBoardService';

const milestoneIcons: Record<string, typeof CheckCircle> = {
  [MilestoneStatus.Pending]: Circle,
  [MilestoneStatus.InProgress]: Loader,
  [MilestoneStatus.Approved]: CheckCircle,
  [MilestoneStatus.Released]: Lock,
};

const milestoneColors: Record<string, string> = {
  [MilestoneStatus.Pending]: 'text-gray-500',
  [MilestoneStatus.InProgress]: 'text-btc-500',
  [MilestoneStatus.Approved]: 'text-green-500',
  [MilestoneStatus.Released]: 'text-blue-500',
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { projects, tasks, wallet, showToast, updateProject, addTask } = useApp();
  const [fundAmount, setFundAmount] = useState('0.05');
  const [milestoneLoadingId, setMilestoneLoadingId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('0.05');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskReward, setTaskReward] = useState('0.02');
  const [taskDeadlineDays, setTaskDeadlineDays] = useState('7');
  const [taskMilestoneId, setTaskMilestoneId] = useState('m1');

  const project = useMemo(() => projects.find((p) => p.id === id), [projects, id]);
  const projectTasks = useMemo(() => tasks.filter((t) => t.projectId === id), [tasks, id]);

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Project Not Found</h2>
        <Link to="/projects" className="btn-secondary">Back to Projects</Link>
      </div>
    );
  }

  const progress = (project.fundsRaised / project.fundingGoal) * 100;
  const daysLeft = Math.max(0, Math.ceil((project.deadline - Date.now()) / (1000 * 60 * 60 * 24)));

  const handleFund = async () => {
    if (!wallet.connected) {
      showToast('Connect your wallet to fund this project', 'warning');
      return;
    }

    try {
      projectFactoryService.setSenderAddress(wallet.address!);
      milestoneVaultService.setSenderAddress(wallet.address!);
      escrowEngineService.setSenderAddress(wallet.address!);

      await projectFactoryService.recordFunding(fundAmount);
      await milestoneVaultService.lockFunds(fundAmount);
      await escrowEngineService.deposit(project.id, fundAmount);

      updateProject(project.id, (current) => {
        const raised = current.fundsRaised + Number(fundAmount || 0);
        return {
          ...current,
          fundsRaised: raised,
          status: raised >= current.fundingGoal ? ProjectStatus.Funded : current.status,
        };
      });

      showToast('Funding submitted and locked in vault', 'success');
    } catch (error) {
      console.error('Error funding project:', error);
      showToast('Failed to fund project', 'error');
    }
  };

  const handleApproveMilestone = async (milestoneId: string) => {
    if (!wallet.connected) {
      showToast('Connect your wallet to approve milestone', 'warning');
      return;
    }

    try {
      setMilestoneLoadingId(milestoneId);
      milestoneVaultService.setSenderAddress(wallet.address!);
      await milestoneVaultService.approveMilestone(milestoneId.replace(/\D/g, '') || '1');
      updateProject(project.id, (current) => ({
        ...current,
        milestones: current.milestones.map((ms) =>
          ms.id === milestoneId
            ? {
                ...ms,
                approvals: ms.approvals + 1,
                status: ms.approvals + 1 >= ms.requiredApprovals ? MilestoneStatus.Approved : ms.status,
              }
            : ms,
        ),
      }));
      showToast('Milestone approved', 'success');
    } catch (error) {
      console.error('Error approving milestone:', error);
      showToast('Failed to approve milestone', 'error');
    } finally {
      setMilestoneLoadingId(null);
    }
  };

  const handleReleaseMilestone = async (milestoneId: string, amount: number) => {
    if (!wallet.connected) {
      showToast('Connect your wallet to release milestone funds', 'warning');
      return;
    }

    try {
      setMilestoneLoadingId(milestoneId);
      milestoneVaultService.setSenderAddress(wallet.address!);
      escrowEngineService.setSenderAddress(wallet.address!);
      await milestoneVaultService.releaseFunds(milestoneId.replace(/\D/g, '') || '1', String(amount));
      await escrowEngineService.release(milestoneId.replace(/\D/g, '') || '1', String(amount));
      updateProject(project.id, (current) => ({
        ...current,
        milestones: current.milestones.map((ms) =>
          ms.id === milestoneId ? { ...ms, status: MilestoneStatus.Released } : ms,
        ),
      }));
      showToast('Milestone funds released', 'success');
    } catch (error) {
      console.error('Error releasing milestone:', error);
      showToast('Failed to release milestone funds', 'error');
    } finally {
      setMilestoneLoadingId(null);
    }
  };

  const handleRefundMilestone = async (milestoneId: string, amount: number) => {
    if (!wallet.connected) {
      showToast('Connect your wallet to refund escrow', 'warning');
      return;
    }

    try {
      setMilestoneLoadingId(milestoneId);
      escrowEngineService.setSenderAddress(wallet.address!);
      await escrowEngineService.refund(milestoneId.replace(/\D/g, '') || '1', String(amount));
      showToast('Escrow refunded', 'success');
    } catch (error) {
      console.error('Error refunding escrow:', error);
      showToast('Failed to refund escrow', 'error');
    } finally {
      setMilestoneLoadingId(null);
    }
  };

  const handleCreateTask = async () => {
    if (!wallet.connected) {
      showToast('Connect your wallet to create tasks', 'warning');
      return;
    }

    if (!taskTitle || !taskReward) {
      showToast('Fill in task title and reward', 'warning');
      return;
    }

    try {
      taskBoardService.setSenderAddress(wallet.address!);
      await taskBoardService.createTask(taskReward, Number(taskDeadlineDays || 1));

      const task: Task = {
        id: `t${Date.now()}`,
        projectId: project.id,
        title: taskTitle,
        description: taskDescription,
        reward: Number(taskReward),
        status: TaskStatus.Open,
        creator: wallet.address!,
        assignee: null,
        deadline: Date.now() + Number(taskDeadlineDays || 1) * 24 * 60 * 60 * 1000,
        skills: ['OP_NET'],
        milestoneId: taskMilestoneId,
      };

      addTask(task);
      setTaskTitle('');
      setTaskDescription('');
      setTaskReward('0.02');
      showToast('Task created successfully', 'success');
    } catch (error) {
      console.error('Error creating task:', error);
      showToast('Failed to create task', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} />
          Back to Projects
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className={`badge-${project.status} text-xs font-medium px-2.5 py-1 rounded-full`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
                <span className="text-xs text-gray-500 bg-surface-700 px-2 py-1 rounded-md">
                  {project.category}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{project.title}</h1>
              <p className="text-gray-400 leading-relaxed">{project.description}</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <span>by</span>
                <span className="text-btc-400 font-mono text-xs bg-surface-700 px-2 py-1 rounded">
                  {project.owner}
                </span>
              </div>
            </div>

            {/* Milestones */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Milestones</h2>
              <div className="space-y-4">
                {project.milestones.map((ms, i) => {
                  const Icon = milestoneIcons[ms.status] || Circle;
                  const color = milestoneColors[ms.status] || 'text-gray-500';
                  return (
                    <div
                      key={ms.id}
                      className="flex items-start gap-4 p-4 rounded-xl bg-surface-800/50 border border-surface-600/50"
                    >
                      <div className="flex flex-col items-center">
                        <Icon size={20} className={color} />
                        {i < project.milestones.length - 1 && (
                          <div className="w-px h-8 bg-surface-600 mt-1" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-semibold text-white">{ms.title}</h3>
                          <span className="text-xs text-btc-400 font-mono">{ms.amount} BTC</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{ms.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="capitalize">{ms.status.replace('_', ' ')}</span>
                          <span>·</span>
                          <span>{ms.approvals}/{ms.requiredApprovals} approvals</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <button
                            onClick={() => handleApproveMilestone(ms.id)}
                            disabled={!wallet.connected || milestoneLoadingId === ms.id || ms.status === MilestoneStatus.Released}
                            className="btn-secondary text-xs !py-1.5 !px-3"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReleaseMilestone(ms.id, Number(paymentAmount || ms.amount))}
                            disabled={!wallet.connected || milestoneLoadingId === ms.id || ms.status !== MilestoneStatus.Approved}
                            className="btn-primary text-xs !py-1.5 !px-3"
                          >
                            Release
                          </button>
                          <button
                            onClick={() => handleRefundMilestone(ms.id, Number(paymentAmount || ms.amount))}
                            disabled={!wallet.connected || milestoneLoadingId === ms.id}
                            className="btn-secondary text-xs !py-1.5 !px-3"
                          >
                            Refund
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Create Task</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Task title"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-700 border border-surface-500 text-white text-sm"
                />
                <select
                  value={taskMilestoneId}
                  onChange={(e) => setTaskMilestoneId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-700 border border-surface-500 text-white text-sm"
                >
                  {project.milestones.map((ms) => (
                    <option key={ms.id} value={ms.id}>{ms.title}</option>
                  ))}
                </select>
                <input
                  value={taskReward}
                  onChange={(e) => setTaskReward(e.target.value)}
                  placeholder="Reward (BTC)"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-700 border border-surface-500 text-white text-sm"
                />
                <input
                  value={taskDeadlineDays}
                  onChange={(e) => setTaskDeadlineDays(e.target.value)}
                  placeholder="Deadline days"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-700 border border-surface-500 text-white text-sm"
                />
              </div>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Task description"
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-700 border border-surface-500 text-white text-sm resize-none mb-4"
              />
              <button onClick={handleCreateTask} className="btn-primary text-sm !py-2.5 !px-5">
                Create Task
              </button>
            </div>

            {/* Project Tasks */}
            {projectTasks.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Project Tasks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projectTasks.map((task, i) => (
                    <TaskCard key={task.id} task={task} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Funding card */}
            <div className="glass-card rounded-2xl p-6 glow-orange">
              <h3 className="text-lg font-bold text-white mb-4">Funding Progress</h3>

              <div className="text-center mb-4">
                <div className="text-4xl font-black text-btc-400 mb-1">
                  {project.fundsRaised} <span className="text-lg text-gray-400">BTC</span>
                </div>
                <div className="text-sm text-gray-500">
                  of {project.fundingGoal} BTC goal
                </div>
              </div>

              <ProgressBar value={progress} size="md" />
              <p className="text-xs text-gray-500 text-right mt-1">{Math.round(progress)}%</p>

              <div className="grid grid-cols-3 gap-3 mt-6 text-center">
                <div className="bg-surface-800 rounded-lg p-3">
                  <Clock size={14} className="mx-auto text-gray-400 mb-1" />
                  <div className="text-sm font-bold text-white">{daysLeft}</div>
                  <div className="text-[10px] text-gray-500">Days Left</div>
                </div>
                <div className="bg-surface-800 rounded-lg p-3">
                  <Target size={14} className="mx-auto text-gray-400 mb-1" />
                  <div className="text-sm font-bold text-white">{project.milestones.length}</div>
                  <div className="text-[10px] text-gray-500">Milestones</div>
                </div>
                <div className="bg-surface-800 rounded-lg p-3">
                  <Users size={14} className="mx-auto text-gray-400 mb-1" />
                  <div className="text-sm font-bold text-white">{Math.floor(progress / 10)}</div>
                  <div className="text-[10px] text-gray-500">Backers</div>
                </div>
              </div>

              <button
                onClick={handleFund}
                className="w-full btn-primary flex items-center justify-center gap-2 mt-6 !py-3"
              >
                <Bitcoin size={16} />
                Fund & Lock in Vault
              </button>

              <div className="mt-4">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-700 border border-surface-500 text-white text-sm"
                />
              </div>

              <div className="mt-4">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-700 border border-surface-500 text-white text-sm"
                />
                <p className="text-[10px] text-gray-500 mt-2">
                  Escrow amount helper for milestone release/refund actions.
                </p>
              </div>
            </div>

            {/* Owner info */}
            <div className="glass-card rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-1">
              <h3 className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">Project Owner</h3>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-btc-500 to-btc-700 flex items-center justify-center text-white text-xs font-bold">
                  {project.owner.slice(-2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-mono text-gray-200 break-all leading-tight">
                    {project.owner}
                  </p>
                  <p className="text-[9px] text-gray-500 mt-0.5 uppercase tracking-widest">Project Creator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
