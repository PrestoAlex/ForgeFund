export interface Project {
  id: string;
  title: string;
  description: string;
  owner: string;
  fundingGoal: number;
  fundsRaised: number;
  deadline: number;
  createdAt: number;
  status: ProjectStatus;
  milestones: Milestone[];
  tasks: Task[];
  category: string;
  txHash?: string; // Blockchain transaction hash
  imageUrl?: string;
}

export enum ProjectStatus {
  Active = 'active',
  Funded = 'funded',
  Completed = 'completed',
  Expired = 'expired',
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: MilestoneStatus;
  approvals: number;
  requiredApprovals: number;
}

export enum MilestoneStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Approved = 'approved',
  Released = 'released',
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  reward: number;
  status: TaskStatus;
  creator: string;
  assignee: string | null;
  deadline: number;
  skills: string[];
  milestoneId: string;
}

export enum TaskStatus {
  Open = 'open',
  Assigned = 'assigned',
  InReview = 'in_review',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: number;
}
