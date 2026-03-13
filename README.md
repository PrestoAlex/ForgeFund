# ForgeFund

A Bitcoin Layer 1 native crowdfunding + task marketplace. ForgeFund combines project creation, milestone-backed funding, task management, and escrowed payouts in a single OP_NET-powered experience.

## Tech Stack

- **Frontend**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS, custom gradients/glassmorphism, Framer Motion animations
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Wallet**: `useOPNetWallet` hook (OP_NET provider)
- **Smart Contracts**: AssemblyScript contracts (ProjectFactory, MilestoneVault, TaskBoard, EscrowEngine) compiled to WASM

## Features

- Create projects with milestone structures and funding goals
- Fund projects and automatically lock capital in MilestoneVault + EscrowEngine
- Approve, release, or refund milestone funds directly from the UI
- Manage tasks via TaskBoard (create, claim, complete) with on-chain rewards
- Background wallet connection, toast feedback, and BTC-themed UI
- Custom guide page describing the workflow and best practices

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Lint & Typecheck
npm run lint
npm run typecheck
```

The Vite dev server runs on `http://localhost:5173` by default.

## Environment / Wallet

- Requires an OP_NET-enabled wallet injected on `window.opnet`
- Test deployments can use the `/test-contract` page to exercise contract calls manually

## Contracts

Contracts live under `contracts/` (AssemblyScript). Deploy scripts follow the `deploy.ts` pattern used across the ForgeFund suite. Key services in `src/services/*` wrap contract calls for the UI.

## Deployment

1. Push to GitHub (`main` branch)
2. Import repo into Vercel and choose the Vite preset
3. Set any required environment variables (if future contracts need them)
4. Trigger production deploy

### TL;DR GitHub push

```bash
git add .
git commit -m "Initial ForgeFund release"
git push -u origin main
```

## Assets

- Custom logo: `public/assets/logo.png`
- Background image: `public/assets/background.png`
- Background audio: `public/audio/background.mp3`

## License

Specify your desired license here (MIT, Apache-2.0, proprietary, etc.). Currently, no license file is included.
