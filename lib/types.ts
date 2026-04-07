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
