import React, { useState, useMemo } from 'react';
import type { SavingsGoal } from '../types';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import { DollarIcon } from '../components/icons/DollarIcon';
import { TargetIcon } from '../components/icons/TargetIcon';
import { TrendUpIcon } from '../components/icons/TrendUpIcon';
import { EditIcon } from '../components/icons/EditIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { CATEGORY_COLORS, SAVINGS_GOAL_CATEGORIES } from '../constants';

interface SavingsProps {
  savingsGoals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'color'>) => void;
  onUpdateGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const AddGoalForm: React.FC<{
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'color'>) => void;
  onCancel: () => void;
}> = ({ onAddGoal, onCancel }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(SAVINGS_GOAL_CATEGORIES[0]);
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(title && parseFloat(targetAmount) > 0) {
        onAddGoal({
            title, category,
            targetAmount: parseFloat(targetAmount),
            currentAmount: parseFloat(currentAmount) || 0,
            deadline
        });
        // Clear form
        setTitle(''); setCategory(SAVINGS_GOAL_CATEGORIES[0]); setTargetAmount(''); setCurrentAmount(''); setDeadline('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Goal</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Goal title" className="p-2 border border-gray-300 rounded-md" required/>
        <select value={category} onChange={e => setCategory(e.target.value)} className="p-2 border border-gray-300 rounded-md">
            {SAVINGS_GOAL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <input type="number" step="0.01" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="Target amount" className="p-2 border border-gray-300 rounded-md" required/>
        <input type="number" step="0.01" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} placeholder="Current amount (optional)" className="p-2 border border-gray-300 rounded-md" />
        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="p-2 border border-gray-300 rounded-md md:col-span-2" required/>
        <div className="md:col-span-2 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Add Goal</button>
        </div>
      </form>
    </div>
  );
};


const Savings: React.FC<SavingsProps> = ({ savingsGoals, onAddGoal, onUpdateGoal, onDeleteGoal }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const { totalSaved, totalTarget, overallProgress } = useMemo(() => {
    const saved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
    const target = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    const progress = target > 0 ? (saved / target) * 100 : 0;
    return { totalSaved: saved, totalTarget: target, overallProgress: progress };
  }, [savingsGoals]);
  
  const handleAddGoal = (goal: Omit<SavingsGoal, 'id' | 'color'>) => {
    onAddGoal(goal);
    setShowAddForm(false);
  };
  
  const handleEditClick = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      onDeleteGoal(id);
    }
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoal) {
      onUpdateGoal(editingGoal);
      setIsEditModalOpen(false);
      setEditingGoal(null);
    }
  };

  const daysOverdue = (deadline: string) => {
    if (!deadline) return 0;

    const today = new Date();
    today.setHours(0,0,0,0);
    // Parse date string 'YYYY-MM-DD' to avoid timezone issues
    const parts = deadline.split('-').map(part => parseInt(part, 10));
    const deadDate = new Date(parts[0], parts[1] - 1, parts[2]);
    
    if (today <= deadDate) return 0;
    
    const diffTime = today.getTime() - deadDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Savings Goals</h1>
          <p className="mt-1 text-gray-600">Track your progress towards financial goals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Saved" value={formatCurrency(totalSaved)} icon={<DollarIcon />} />
          <StatCard title="Total Target" value={formatCurrency(totalTarget)} icon={<TargetIcon />} />
          <StatCard title="Overall Progress" value={`${overallProgress.toFixed(1)}%`} icon={<TrendUpIcon />} />
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Your Goals</h2>
          {!showAddForm && <button onClick={() => setShowAddForm(true)} className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700">+ Add Goal</button>}
        </div>

        {showAddForm && <AddGoalForm onAddGoal={handleAddGoal} onCancel={() => setShowAddForm(false)} />}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savingsGoals.map(goal => {
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              const overdue = daysOverdue(goal.deadline);
              const progressBarColor = overdue > 0 ? '#ef4444' : goal.color; // Use red-500 if overdue

              return (
            <div key={goal.id} className="bg-white p-6 rounded-xl shadow-sm space-y-4 flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full" style={{backgroundColor: goal.color}}></span>
                      <h3 className="font-bold text-lg text-gray-800">{goal.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{goal.category}</p>
                </div>
                <div className="flex space-x-2 text-gray-400">
                  <button onClick={() => handleEditClick(goal)} className="hover:text-gray-600"><EditIcon /></button>
                  <button onClick={() => handleDeleteClick(goal.id)} className="hover:text-red-500"><TrashIcon /></button>
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex justify-between text-sm font-medium mb-1"><span>Progress</span><span>{progress.toFixed(1)}%</span></div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%`, backgroundColor: progressBarColor }}>
                  </div>
                </div>
              </div>
              <div className="text-sm space-y-2 text-gray-600 pt-2">
                <div className="flex justify-between"><span>Current:</span> <span className="font-semibold text-gray-800">{formatCurrency(goal.currentAmount)}</span></div>
                <div className="flex justify-between"><span>Target:</span> <span className="font-semibold text-gray-800">{formatCurrency(goal.targetAmount)}</span></div>
                <div className="flex justify-between"><span>Remaining:</span> <span className="font-semibold text-gray-800">{formatCurrency(goal.targetAmount - goal.currentAmount)}</span></div>
              </div>
              {overdue > 0 && <div className="text-xs text-red-500 font-semibold text-right">{overdue} days overdue</div>}
            </div>
          )})}
        </div>
      </div>
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Savings Goal">
          {editingGoal && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
               <input type="text" value={editingGoal.title} onChange={e => setEditingGoal({...editingGoal, title: e.target.value})} placeholder="Goal title" className="w-full p-2 border border-gray-300 rounded-md" required/>
               <select value={editingGoal.category} onChange={e => setEditingGoal({...editingGoal, category: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md">
                   {SAVINGS_GOAL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
               </select>
               <input type="number" step="0.01" value={editingGoal.targetAmount} onChange={e => setEditingGoal({...editingGoal, targetAmount: parseFloat(e.target.value) || 0})} placeholder="Target amount" className="w-full p-2 border border-gray-300 rounded-md" required/>
               <input type="number" step="0.01" value={editingGoal.currentAmount} onChange={e => setEditingGoal({...editingGoal, currentAmount: parseFloat(e.target.value) || 0})} placeholder="Current amount" className="w-full p-2 border border-gray-300 rounded-md" />
               <input type="date" value={editingGoal.deadline} onChange={e => setEditingGoal({...editingGoal, deadline: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md" required/>
               <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Save Changes</button>
              </div>
            </form>
          )}
      </Modal>
    </>
  );
};

export default Savings;