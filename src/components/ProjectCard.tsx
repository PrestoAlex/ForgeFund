import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, Target } from 'lucide-react';
import { Project } from '../types';
import ProgressBar from './ProgressBar';

interface Props {
  project: Project;
  index?: number;
}

export default function ProjectCard({ project, index = 0 }: Props) {
  const progress = (project.fundsRaised / project.fundingGoal) * 100;
  const daysLeft = Math.max(0, Math.ceil((project.deadline - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/project/${project.id}`}
        className="block glass-card rounded-2xl p-6 group hover:border-btc-500/30 transition-all"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <span className={`badge-${project.status} text-xs font-medium px-2.5 py-1 rounded-full`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
          <span className="text-xs text-gray-500 bg-surface-700 px-2 py-1 rounded-md">
            {project.category}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-btc-400 transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-400">
              <span className="text-btc-400 font-semibold">{project.fundsRaised} BTC</span> raised
            </span>
            <span className="text-gray-500">{project.fundingGoal} BTC goal</span>
          </div>
          <ProgressBar value={progress} />
        </div>

        {/* Footer stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{daysLeft}d left</span>
          </div>
          <div className="flex items-center gap-1">
            <Target size={12} />
            <span>{project.milestones.length} milestones</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={12} />
            <span>{Math.floor(progress / 10)} backers</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
