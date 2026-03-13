import { motion } from 'framer-motion';
import { Rocket, Shield, Sparkles, Wallet, CheckCircle, ArrowRight } from 'lucide-react';

const highlights = [
  {
    icon: <Rocket size={18} />,
    title: 'Bitcoin-Layer Native',
    description: 'ForgeFund operates entirely on Bitcoin Layer 1 via OP_NET smart contracts, so every milestone is transparent and censorship-resistant.'
  },
  {
    icon: <Shield size={18} />,
    title: 'Milestone-Driven Security',
    description: 'Funds are locked in MilestoneVault and released only after on-chain approvals, dramatically lowering rug risk for backers.'
  },
  {
    icon: <Sparkles size={18} />,
    title: 'One Platform for Builders & Talent',
    description: 'Project creation, milestone funding, task management, and escrowed payouts live in one seamless workflow.'
  }
];

const steps = [
  {
    title: '1. Launch a project',
    items: [
      'Connect your OP_NET-compatible wallet and click “Create Project”.',
      'Set the funding goal, timeline, and milestone structure (each milestone holds its own budget).',
      'Publish to immediately appear in the Projects marketplace with transparent metadata.'
    ]
  },
  {
    title: '2. Fund & lock capital',
    items: [
      'Supporters choose a project, enter an amount, and submit one transaction.',
      'ForgeFund automatically records the contribution, locks funds inside MilestoneVault, and mirrors the deposit in EscrowEngine.',
      'Smart contracts keep a live tally of total locked vs. released capital for public inspection.'
    ]
  },
  {
    title: '3. Execute work via TaskBoard',
    items: [
      'Founders create granular tasks tied to specific milestones and rewards.',
      'Contributors browse the Tasks marketplace, claim open work, and deliver on-chain proofs of completion.',
      'TaskBoard keeps immutable status updates (open, assigned, completed) synced with the project page.'
    ]
  },
  {
    title: '4. Release or refund on-chain',
    items: [
      'Once deliverables are met, stakeholders approve the milestone and trigger MilestoneVault → EscrowEngine release.',
      'If requirements are not satisfied, escrowed funds can be refunded back to supporters with a single click.',
      'Every payout is notarized on Bitcoin Layer 1, creating a verifiable compliance trail.'
    ]
  }
];

const instructions = [
  {
    icon: <Wallet size={18} />,
    label: 'Wallet Setup',
    text: 'Use an OP_NET-enabled wallet (ForgeWallet, Unisat OP mode, etc.). Keep a small BTC balance for fees; all interactions are regular transactions.'
  },
  {
    icon: <ArrowRight size={18} />,
    label: 'Testing vs. Production',
    text: '“Test Contracts” page remains available for dry runs. Once confident, operate from the main UI to keep the workflow intuitive for end users.'
  },
  {
    icon: <CheckCircle size={18} />,
    label: 'Best Practices',
    text: 'Always confirm milestone IDs, reward amounts (18 decimals), and wallet addresses before signing. Use the toast notifications for immediate feedback.'
  }
];

export default function GuidePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="py-12"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <section className="text-center space-y-6">
          <p className="text-xs tracking-[0.3em] text-gray-400 uppercase">ForgeFund Playbook</p>
          <h1 className="text-4xl font-black text-white">Guide: Why ForgeFund Wins</h1>
          <p className="text-gray-300 max-w-3xl mx-auto">
            ForgeFund merges crowdfunding, milestone governance, and task coordination into one Bitcoin-native stack.
            Here is how investors, founders, and contributors can collaborate trustlessly without leaving the OP_NET ecosystem.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="glass-card rounded-2xl p-6 h-full flex flex-col gap-3"
            >
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <span className="text-btc-400">{item.icon}</span>
                {item.title}
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </section>

        <section className="glass-card rounded-3xl p-8 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Workflow</p>
            <h2 className="text-2xl font-bold text-white">Step-by-step instructions</h2>
          </div>
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.title} className="bg-surface-800/40 rounded-2xl border border-surface-700/60 p-6">
                <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
                <ul className="space-y-2 text-sm text-gray-300 list-disc pl-5">
                  {step.items.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {instructions.map((item) => (
            <div key={item.label} className="rounded-2xl border border-surface-700/70 bg-surface-900/60 p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className="text-btc-400">{item.icon}</span>
                {item.label}
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="glass-card rounded-2xl p-6 border border-btc-500/20 text-center">
          <p className="text-sm text-gray-400 uppercase tracking-[0.4em] mb-2">Vision</p>
          <h3 className="text-2xl font-bold text-white mb-3">ForgeFund is the coordination layer Bitcoin was missing.</h3>
          <p className="text-gray-300 max-w-3xl mx-auto mb-6">
            We are building a playbook where builders receive milestone-based capital, contributors earn verifiable BTC bounties,
            and supporters monitor progress from a single unified interface. Every interaction is notarized on-chain,
            making ForgeFund the default venue for serious OP_NET-native teams.
          </p>
          <button className="btn-primary text-sm !px-6 !py-3">Return to App</button>
        </section>
      </div>
    </motion.div>
  );
}
