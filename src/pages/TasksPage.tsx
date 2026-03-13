import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Zap } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import { useApp } from '../context/AppContext';
import { SKILL_TAGS } from '../data/constants';
import { Task, TaskStatus } from '../types';
import { taskBoardService } from '../services/taskBoardService';

const statusFilters = ['All', 'open', 'assigned', 'in_review', 'completed'];

export default function TasksPage() {
  const { tasks, wallet, showToast, updateTask } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [skillFilter, setSkillFilter] = useState('All');
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchSkill = skillFilter === 'All' || t.skills.includes(skillFilter);
      return matchSearch && matchStatus && matchSkill;
    });
  }, [tasks, search, statusFilter, skillFilter]);

  const handleClaim = async (task: Task) => {
    if (!wallet.connected) {
      showToast('Connect your wallet to claim tasks', 'warning');
      return;
    }

    try {
      setLoadingTaskId(task.id);
      taskBoardService.setSenderAddress(wallet.address!);
      await taskBoardService.assignTask(task.id.replace(/\D/g, '') || '1');
      updateTask(task.id, (current) => ({
        ...current,
        status: TaskStatus.Assigned,
        assignee: wallet.address,
      }));
      showToast(`Task claimed: ${task.title}`, 'success');
    } catch (error) {
      console.error('Error claiming task:', error);
      showToast('Failed to claim task', 'error');
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handleComplete = async (task: Task) => {
    if (!wallet.connected) {
      showToast('Connect your wallet to complete tasks', 'warning');
      return;
    }

    try {
      setLoadingTaskId(task.id);
      taskBoardService.setSenderAddress(wallet.address!);
      await taskBoardService.completeTask(task.id.replace(/\D/g, '') || '1');
      updateTask(task.id, (current) => ({
        ...current,
        status: TaskStatus.Completed,
      }));
      showToast(`Task completed: ${task.title}`, 'success');
    } catch (error) {
      console.error('Error completing task:', error);
      showToast('Failed to complete task', 'error');
    } finally {
      setLoadingTaskId(null);
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
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={20} className="text-btc-500" />
            <span className="text-sm font-medium text-btc-400 uppercase tracking-wider">Earn BTC</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Task Marketplace</h1>
          <p className="text-gray-400">Find tasks, complete work, and earn Bitcoin</p>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-8">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-700 border border-surface-500 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-btc-500/50 transition-colors"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <SlidersHorizontal size={14} className="text-gray-500 flex-shrink-0" />
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === s
                    ? 'bg-btc-500/20 text-btc-400 border border-btc-500/30'
                    : 'bg-surface-700 text-gray-400 border border-surface-500 hover:border-surface-400'
                }`}
              >
                {s === 'All' ? 'All Status' : s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>

          {/* Skill filter */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSkillFilter('All')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                skillFilter === 'All'
                  ? 'bg-btc-500/20 text-btc-400 border border-btc-500/30'
                  : 'bg-surface-700 text-gray-400 border border-surface-500 hover:border-surface-400'
              }`}
            >
              All Skills
            </button>
            {SKILL_TAGS.map((skill) => (
              <button
                key={skill}
                onClick={() => setSkillFilter(skill)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  skillFilter === skill
                    ? 'bg-btc-500/20 text-btc-400 border border-btc-500/30'
                    : 'bg-surface-700 text-gray-400 border border-surface-500 hover:border-surface-400'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 mb-8 text-sm text-gray-500">
          <span>{filtered.length} tasks found</span>
          <span>·</span>
          <span>{tasks.filter(t => t.status === 'open').length} open</span>
          <span>·</span>
          <span>{tasks.reduce((sum, t) => sum + t.reward, 0).toFixed(2)} BTC total bounties</span>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No tasks found</p>
            <p className="text-gray-600 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((task, i) => (
              <TaskCard
                key={task.id}
                task={loadingTaskId === task.id ? { ...task } : task}
                index={i}
                onClaim={handleClaim}
                onComplete={handleComplete}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
