
export type Page = 'Dashboard' | 'Budget' | 'Expenses' | 'Savings';

export type TransactionType = 'Income' | 'Expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: string;
  date: string;
  tags?: string[];
}

export interface BudgetCategory {
  id: string;
  name: string;
  amount: number;
  color: string;
}

export interface SavingsGoal {
  id:string;
  title: string;
  category: string;
  currentAmount: number;
  targetAmount: number;
  deadline: string;
  color: string;
}

export interface BudgetGoal {
  id: string;
  categoryId: string;
  title: string;
  targetAmount: number;
  deadline: string;
}