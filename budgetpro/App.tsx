import React, { useState } from 'react';
import type { Page, Transaction, BudgetCategory, SavingsGoal, BudgetGoal } from './types';
import { CATEGORY_COLORS, INCOME_CATEGORIES } from './constants';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Budget from './pages/Budget';
import Expenses from './pages/Expenses';
import Savings from './pages/Savings';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('Dashboard');

  // Initial state for a fresh start
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [budget, setBudget] = useState<BudgetCategory[]>([
    { id: 'default-other', name: 'Other', amount: 0, color: '#6b7280' } // gray-500
  ]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<string[]>(INCOME_CATEGORIES);

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: new Date().toISOString() };
    setTransactions(prev => [newTransaction, ...prev]);
  };
  
  const handleAddMultipleTransactions = (newTransactions: Omit<Transaction, 'id'>[]) => {
    const transactionsWithIds = newTransactions.map((transaction, index) => ({
      ...transaction,
      id: `${new Date().toISOString()}-${index}`, // Ensure unique ID for batch imports
    }));
    setTransactions(prev => [...transactionsWithIds, ...prev]);
  };

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  };
  
  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleAddSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'color'>) => {
    // Automatically assign a color by cycling through the available colors
    const nextColorIndex = savingsGoals.length % CATEGORY_COLORS.length;
    const newGoalColor = CATEGORY_COLORS[nextColorIndex];

    const newGoal: SavingsGoal = {
        ...goal,
        id: new Date().toISOString(),
        color: newGoalColor,
    };
    setSavingsGoals(prev => [...prev, newGoal]);
  };

  const handleUpdateSavingsGoal = (updatedGoal: SavingsGoal) => {
    setSavingsGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const handleDeleteSavingsGoal = (id: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleAddBudgetGoal = (goal: Omit<BudgetGoal, 'id'>) => {
    const newGoal = { ...goal, id: new Date().toISOString() };
    setBudgetGoals(prev => [...prev, newGoal]);
  };

  const handleUpdateBudgetGoal = (updatedGoal: BudgetGoal) => {
    setBudgetGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const handleDeleteBudgetGoal = (id: string) => {
    setBudgetGoals(prev => prev.filter(g => g.id !== id));
  };


  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard transactions={transactions} budget={budget} savingsGoals={savingsGoals} monthlyIncome={monthlyIncome} />;
      case 'Budget':
        return <Budget 
                  budget={budget} 
                  setBudget={setBudget} 
                  monthlyIncome={monthlyIncome} 
                  setMonthlyIncome={setMonthlyIncome} 
                  transactions={transactions}
                  budgetGoals={budgetGoals}
                  onAddGoal={handleAddBudgetGoal}
                  onUpdateGoal={handleUpdateBudgetGoal}
                  onDeleteGoal={handleDeleteBudgetGoal}
                />;
      case 'Expenses':
        return <Expenses 
                  transactions={transactions} 
                  onAddTransaction={handleAddTransaction}
                  onAddMultipleTransactions={handleAddMultipleTransactions}
                  onUpdateTransaction={handleUpdateTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  expenseCategories={budget.map(b => b.name)} 
                  incomeCategories={incomeCategories}
                />;
      case 'Savings':
        return <Savings 
                  savingsGoals={savingsGoals} 
                  onAddGoal={handleAddSavingsGoal}
                  onUpdateGoal={handleUpdateSavingsGoal}
                  onDeleteGoal={handleDeleteSavingsGoal}
                />;
      default:
        return <Dashboard transactions={transactions} budget={budget} savingsGoals={savingsGoals} monthlyIncome={monthlyIncome} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header activePage={activePage} setActivePage={setActivePage} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
