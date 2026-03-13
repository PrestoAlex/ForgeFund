# ForgeFund Smart Contracts

OP_NET smart contracts для ForgeFund — децентралізованої краудфандингової платформи на Bitcoin Layer 1.

## Архітектура

### Контракти

1. **ProjectFactory** — створення нових проектів
2. **MilestoneVault** — блокування та випуск коштів по мілейстоунах
3. **TaskBoard** — управління завданнями
4. **EscrowEngine** — безпечні BTC виплати

## Встановлення

```bash
npm install
```

## Компіляція

```bash
# Компіляція всіх контрактів
npm run build:all

# Компіляція окремих контрактів
npm run build:factory
npm run build:milestone
npm run build:taskboard
npm run build:escrow
```

## Деплой

1. Створіть `.env` файл на основі `.env.example`
2. Додайте свій MNEMONIC (12 слів)
3. Запустіть деплой:

```bash
# Деплой окремих контрактів
npm run deploy:factory
npm run deploy:milestone
npm run deploy:taskboard
npm run deploy:escrow
```

## Структура

```
contracts/
├── src/
│   ├── factory/          # ProjectFactory
│   ├── milestone/        # MilestoneVault
│   ├── taskboard/        # TaskBoard
│   └── escrow/           # EscrowEngine
├── build/                # Скомпільовані WASM файли
├── deploy.ts             # Deployment скрипт
└── package.json
```

## Функції контрактів

### ProjectFactory
- `createProject(fundingGoal, deadline)` → projectId
- `recordFunding(amount)` → success
- `getProjectCount()` → count
- `getTotalFunded()` → total

### MilestoneVault
- `lockFunds(amount)` → success
- `approveMilestone(milestoneId)` → success
- `releaseFunds(milestoneId, amount)` → success
- `getVaultInfo()` → (locked, released, approved, total)

### TaskBoard
- `createTask(reward, deadline)` → taskId
- `assignTask(taskId)` → success
- `completeTask(taskId)` → success
- `getTaskBoardInfo()` → (totalTasks, completedTasks, totalRewards)

### EscrowEngine
- `deposit(taskId, amount)` → success
- `release(taskId, amount)` → success
- `refund(taskId, amount)` → success
- `getEscrowInfo()` → (deposited, released, refunded)
