import type { Page } from './types';

export const NAV_LINKS: { name: Page; href: string }[] = [
  { name: 'Dashboard', href: '#dashboard' },
  { name: 'Budget', href: '#budget' },
  { name: 'Expenses', href: '#expenses' },
  { name: 'Savings', href: '#savings' },
];

export const CATEGORY_COLORS = [
  '#16a34a', // green-600
  '#3b82f6', // blue-500
  '#ec4899', // pink-500
  '#f97316', // orange-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#6b7280', // gray-500
  '#ef4444', // red-500
  '#eab308', // yellow-500
];

export const SAVINGS_GOAL_CATEGORIES = ['Emergency', 'Travel', 'Transportation', 'Home', 'Investment', 'Other'];

export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gifts', 'Other'];
