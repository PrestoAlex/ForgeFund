import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Code, Shield, ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-btc-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-btc-500/20 bg-btc-500/5 text-btc-400 text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-btc-500 animate-pulse" />
            Bitcoin Layer 1 · OP_NET Powered
          </motion.div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
            <span className="text-white">Fund Ideas.</span>
            <br />
            <span className="gradient-text">Forge the Future.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Decentralized crowdfunding meets trustless task payments. 
            Launch projects, set milestones, and pay developers — all secured by Bitcoin smart contracts.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/create-project"
              className="btn-primary flex items-center gap-2 text-base !py-3.5 !px-8"
            >
              <Rocket size={18} />
              Launch a Project
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/projects"
              className="btn-secondary flex items-center gap-2 text-base !py-3.5 !px-8"
            >
              Explore Projects
            </Link>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {[
              { label: 'Total Funded', value: '12.4 BTC' },
              { label: 'Projects', value: '24' },
              { label: 'Tasks Completed', value: '156' },
              { label: 'Developers', value: '89' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-btc-400 mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-3 mt-16"
        >
          {[
            { icon: Rocket, text: 'Crowdfunding' },
            { icon: Code, text: 'Task Marketplace' },
            { icon: Shield, text: 'Trustless Escrow' },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-surface-500 bg-surface-800/50 text-sm text-gray-300"
            >
              <item.icon size={14} className="text-btc-500" />
              {item.text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
