import { motion } from 'framer-motion';
import { Bitcoin, Clock, User, Tag } from 'lucide-react';
import { Task } from '../types';

interface Props {
  task: Task;
  index?: number;
  onClaim?: (task: Task) => void;
  onComplete?: (task: Task) => void;
}

export default function TaskCard({ task, index = 0, onClaim, onComplete }: Props) {
  const daysLeft = Math.max(0, Math.ceil((task.deadline - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="glass-card rounded-2xl p-6 hover:border-btc-500/30 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className={`badge-${task.status} text-xs font-medium px-2.5 py-1 rounded-full`}>
          {task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
        <div className="flex items-center gap-1 text-btc-400 font-bold text-sm">
          <Bitcoin size={14} />
          {task.reward} BTC
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="text-base font-bold text-white mb-2">{task.title}</h3>
      <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
        {task.description}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {task.skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-surface-600 text-gray-300 border border-surface-500"
          >
            <Tag size={10} />
            {skill}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{daysLeft}d left</span>
          </div>
          {task.assignee && (
            <div className="flex items-center gap-1">
              <User size={12} />
              <span>{task.assignee.slice(0, 8)}...</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {task.status === 'open' && onClaim && (
            <button
              onClick={() => onClaim(task)}
              className="btn-primary text-xs !py-1.5 !px-3"
            >
              Claim Task
            </button>
          )}
          {task.status === 'assigned' && onComplete && (
            <button
              onClick={() => onComplete(task)}
              className="btn-secondary text-xs !py-1.5 !px-3"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
