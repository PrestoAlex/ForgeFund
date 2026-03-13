import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Rocket } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Project, ProjectStatus, MilestoneStatus } from '../types';
import { PROJECT_CATEGORIES } from '../data/constants';
import { projectFactoryService } from '../services/projectFactoryService';

interface MilestoneForm {
  title: string;
  description: string;
  amount: string;
}

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const { wallet, showToast, addProject } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Infrastructure');
  const [fundingGoal, setFundingGoal] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('30');
  const [milestones, setMilestones] = useState<MilestoneForm[]>([
    { title: '', description: '', amount: '' },
  ]);

  const addMilestone = () => {
    setMilestones([...milestones, { title: '', description: '', amount: '' }]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length === 1) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof MilestoneForm, value: string) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet.connected) {
      showToast('Connect your wallet first', 'warning');
      return;
    }

    if (!title || !description || !fundingGoal || milestones.some(m => !m.title || !m.amount)) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      // Set sender address for contract service
      projectFactoryService.setSenderAddress(wallet.address!);

      // Calculate deadline (current block + deadline days)
      const currentBlock = Math.floor(Date.now() / 1000 / 600); // ~10 min per block
      const deadline = currentBlock + Number(deadlineDays) * 144; // ~144 blocks per day

      // Call contract to create project
      showToast('Creating project on blockchain...', 'info');
      const txHash = await projectFactoryService.createProject(fundingGoal, deadline);

      // Create local project object
      const project: Project = {
        id: String(Date.now()),
        title,
        description,
        owner: wallet.address || 'bc1q...demo',
        fundingGoal: Number(fundingGoal),
        fundsRaised: 0,
        deadline: Date.now() + Number(deadlineDays) * 24 * 60 * 60 * 1000,
        createdAt: Date.now(),
        status: ProjectStatus.Active,
        category,
        milestones: milestones.map((m, i) => ({
          id: `m${i + 1}`,
          title: m.title,
          description: m.description,
          amount: Number(m.amount),
          status: MilestoneStatus.Pending,
          approvals: 0,
          requiredApprovals: 3,
        })),
        tasks: [],
        txHash: txHash ?? undefined, // Add transaction hash
      };

      addProject(project);
      showToast('Project created successfully on blockchain!', 'success');
      navigate(`/project/${project.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      showToast('Failed to create project. Please try again.', 'error');
    }
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-surface-700 border border-surface-500 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-btc-500/50 transition-colors';
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-12"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Create a Project</h1>
          <p className="text-gray-400">Launch your crowdfunding campaign on Bitcoin Layer 1</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-white">Project Details</h2>

            <div>
              <label className={labelClass}>Project Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. BitVM Prover Network"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project, goals, and how funds will be used..."
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass}
                >
                  {PROJECT_CATEGORIES.filter(c => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Funding Goal (BTC) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={fundingGoal}
                  onChange={(e) => setFundingGoal(e.target.value)}
                  placeholder="e.g. 2.5"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Deadline (days from now)</label>
              <input
                type="number"
                min="1"
                max="365"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Milestones */}
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Milestones</h2>
              <button
                type="button"
                onClick={addMilestone}
                className="btn-secondary flex items-center gap-1 text-xs !py-1.5 !px-3"
              >
                <Plus size={14} />
                Add Milestone
              </button>
            </div>

            {milestones.map((ms, i) => (
              <div key={i} className="p-4 rounded-xl bg-surface-800/50 border border-surface-600/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-btc-400">Milestone {i + 1}</span>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(i)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Title *</label>
                  <input
                    type="text"
                    value={ms.title}
                    onChange={(e) => updateMilestone(i, 'title', e.target.value)}
                    placeholder="e.g. Protocol Design"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <input
                    type="text"
                    value={ms.description}
                    onChange={(e) => updateMilestone(i, 'description', e.target.value)}
                    placeholder="What will be delivered"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Amount (BTC) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={ms.amount}
                    onChange={(e) => updateMilestone(i, 'amount', e.target.value)}
                    placeholder="e.g. 0.5"
                    className={inputClass}
                  />
                </div>
              </div>
            ))}

            {/* Milestone total vs goal check */}
            {fundingGoal && (
              <div className="text-xs text-gray-500">
                Milestone total:{' '}
                <span className={
                  milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0) === Number(fundingGoal)
                    ? 'text-green-400'
                    : 'text-yellow-400'
                }>
                  {milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0).toFixed(2)} BTC
                </span>
                {' / '}{fundingGoal} BTC goal
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {wallet.connected
                ? `Creating as ${wallet.address?.slice(0, 8)}...`
                : 'Connect wallet to create project'}
            </p>
            <button
              type="submit"
              className="btn-primary flex items-center gap-2 !py-3 !px-8"
            >
              <Rocket size={16} />
              Create Project
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
