export type Family = {
  id: string;
  name: string;
  created_at: string;
};

export type User = {
  id: string;
  family_id: string;
  role: "parent" | "child";
  name: string;
  pin: string | null;
  created_at: string;
};

export type Task = {
  id: string;
  family_id: string;
  title: string;
  description: string | null;
  reward_amount: number;
  recurrence: "once" | "daily" | "weekly";
  assigned_child_id: string | null;
  is_active: boolean;
  created_at: string;
};

export type TaskLog = {
  id: string;
  task_id: string;
  child_id: string;
  status: "pending" | "approved" | "rejected";
  completed_at: string;
  approved_at: string | null;
  approved_by: string | null;
  // joined
  task?: Task;
  child?: User;
};

export type Wallet = {
  id: string;
  child_id: string;
  spending_balance: number;
  saving_balance: number;
  split_ratio: number;
  updated_at: string;
};

export type Transaction = {
  id: string;
  wallet_id: string;
  type: "earn" | "spend" | "save";
  amount: number;
  description: string | null;
  task_log_id: string | null;
  created_at: string;
};

export type SpendRequest = {
  id: string;
  child_id: string;
  wallet_id: string;
  amount: number;
  purpose: string;
  status: "pending" | "approved" | "rejected";
  reject_reason: string | null;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
  // joined
  child?: User;
};

export type Badge = {
  id: string;
  child_id: string;
  badge_type: string;
  earned_at: string;
};

export type SavingGoal = {
  id: string;
  child_id: string;
  title: string;
  target_amount: number;
  is_achieved: boolean;
  created_at: string;
};
