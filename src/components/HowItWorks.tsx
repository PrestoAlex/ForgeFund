import { motion } from 'framer-motion';
import { Lightbulb, Users, Milestone, Code, CreditCard } from 'lucide-react';

const steps = [
  {
    icon: Lightbulb,
    title: 'Create a Project',
    description: 'Submit your idea with a funding goal, milestones, and deadline. Your project goes live on-chain.',
    color: 'from-yellow-500/20 to-yellow-600/5',
    border: 'border-yellow-500/20',
  },
  {
    icon: Users,
    title: 'Crowdfund with BTC',
    description: 'Backers fund your project with Bitcoin. Funds are locked in a smart contract until milestones are met.',
    color: 'from-btc-500/20 to-btc-600/5',
    border: 'border-btc-500/20',
  },
  {
    icon: Milestone,
    title: 'Milestone Vault',
    description: 'Funds are released per milestone. Backers vote to approve each phase before BTC is unlocked.',
    color: 'from-blue-500/20 to-blue-600/5',
    border: 'border-blue-500/20',
  },
  {
    icon: Code,
    title: 'Task Marketplace',
    description: 'Project owners post tasks. Developers claim work, submit deliverables, and get reviewed.',
    color: 'from-green-500/20 to-green-600/5',
    border: 'border-green-500/20',
  },
  {
    icon: CreditCard,
    title: 'Trustless Payout',
    description: 'Upon task completion and approval, the escrow contract automatically pays the developer in BTC.',
    color: 'from-purple-500/20 to-purple-600/5',
    border: 'border-purple-500/20',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How <span className="text-btc-500">ForgeFund</span> Works
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            From idea to payout — every step is trustless, transparent, and secured by Bitcoin smart contracts.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-btc-500/20 to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative glass-card rounded-2xl p-6 border ${step.border} group hover:scale-[1.02] transition-transform`}
              >
                {/* Step number */}
                <div className="absolute -top-3 -right-2 w-7 h-7 rounded-full bg-surface-800 border border-btc-500/30 flex items-center justify-center text-xs font-bold text-btc-500">
                  {i + 1}
                </div>

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                  <step.icon size={22} className="text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
