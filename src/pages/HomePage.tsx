import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Zap } from 'lucide-react';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import ProjectCard from '../components/ProjectCard';
import TaskCard from '../components/TaskCard';
import { useApp } from '../context/AppContext';

export default function HomePage() {
  const { projects, tasks } = useApp();
  const featuredProjects = projects.slice(0, 3);
  const featuredTasks = tasks.filter(t => t.status === 'open').slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Hero />
      <HowItWorks />

      {/* Featured Projects */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-btc-500" />
                <span className="text-sm font-medium text-btc-400 uppercase tracking-wider">Trending</span>
              </div>
              <h2 className="text-3xl font-bold text-white">Featured Projects</h2>
            </div>
            <Link
              to="/projects"
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tasks */}
      <section className="py-20 relative border-t border-surface-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={18} className="text-btc-500" />
                <span className="text-sm font-medium text-btc-400 uppercase tracking-wider">Open Tasks</span>
              </div>
              <h2 className="text-3xl font-bold text-white">Task Marketplace</h2>
            </div>
            <Link
              to="/tasks"
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              Browse Tasks <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTasks.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-btc-500/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Build on Bitcoin?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Launch your project, fund development, and pay contributors — all trustlessly on Bitcoin Layer 1.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/create-project" className="btn-primary flex items-center gap-2 !py-3.5 !px-8">
              Start a Project <ArrowRight size={16} />
            </Link>
            <Link to="/tasks" className="btn-secondary flex items-center gap-2 !py-3.5 !px-8">
              Find Work
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
