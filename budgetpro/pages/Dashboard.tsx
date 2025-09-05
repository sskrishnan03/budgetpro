import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { GoogleGenAI } from '@google/genai';
import type { Transaction, BudgetCategory, SavingsGoal } from '../types';
import StatCard from '../components/StatCard';
import { TrendUpIcon } from '../components/icons/TrendUpIcon';
import { TrendDownIcon } from '../components/icons/TrendDownIcon';
import { DollarIcon } from '../components/icons/DollarIcon';
import { TargetIcon } from '../components/icons/TargetIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { LightbulbIcon } from '../components/icons/LightbulbIcon';
import { CATEGORY_COLORS } from '../constants';


interface DashboardProps {
  transactions: Transaction[];
  budget: BudgetCategory[];
  savingsGoals: SavingsGoal[];
  monthlyIncome: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const Dashboard: React.FC<DashboardProps> = ({ transactions, budget, savingsGoals, monthlyIncome }) => {
  const [insights, setInsights] = useState<string>('');
  const [isLoadingInsights, setIsLoadingInsights] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const { totalIncome, totalExpenses, remainingBudget, savingsProgress, expenseByCategory, incomeByCategory } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const remaining = monthlyIncome - expenses;
    
    const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    const progress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    const byCategory = transactions
      .filter(t => t.type === 'Expense')
      .reduce((acc, t) => {
        if (!acc[t.category]) {
          acc[t.category] = { name: t.category, value: 0 };
        }
        acc[t.category].value += t.amount;
        return acc;
      }, {} as { [key: string]: { name: string, value: number } });

    const categoryData = Object.values(byCategory).map(c => {
        const budgetCategory = budget.find(b => b.name === c.name);
        return {...c, color: budgetCategory?.color || '#8884d8'};
    });
    
    const byIncomeCategory = transactions
      .filter(t => t.type === 'Income' && t.category)
      .reduce((acc, t) => {
        if (!acc[t.category]) {
          acc[t.category] = { name: t.category, value: 0 };
        }
        acc[t.category].value += t.amount;
        return acc;
      }, {} as { [key: string]: { name: string, value: number } });

    const incomeCategoryData = Object.values(byIncomeCategory).map((c, index) => ({
      ...c,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
    }));

    return {
      totalIncome: income,
      totalExpenses: expenses,
      remainingBudget: remaining,
      savingsProgress: progress,
      expenseByCategory: categoryData,
      incomeByCategory: incomeCategoryData,
    };
  }, [transactions, budget, savingsGoals, monthlyIncome]);

  const monthlyOverviewData = useMemo(() => {
    const months: { [key: string]: { name: string; income: number; expenses: number; year: number; month: number; } } = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    transactions.forEach(t => {
        const date = new Date(t.date);
        if (isNaN(date.getTime())) {
          return; // Skip transactions with invalid dates
        }
        const year = date.getFullYear();
        const month = date.getMonth();
        const key = `${year}-${month}`;
        
        if (!months[key]) {
            const shortYear = year.toString().slice(-2);
            months[key] = { name: `${monthNames[month]} '${shortYear}`, income: 0, expenses: 0, year, month };
        }
        
        if (t.type === 'Income') {
            months[key].income += t.amount;
        } else {
            months[key].expenses += t.amount;
        }
    });

    const sortedData = Object.values(months).sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      return a.month - b.month;
    });
    
    return sortedData.map(({name, income, expenses}) => ({name, income, expenses}));
}, [transactions]);


  const getFinancialInsights = async () => {
    setIsLoadingInsights(true);
    setError('');
    setInsights('');
    try {
      // Safely check for API key to prevent a ReferenceError in browser environments where `process` is not defined.
      if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `
          You are a friendly financial advisor. Analyze the following financial data and provide 3-5 brief, actionable insights. 
          Focus on spending habits, budget adherence, and progress towards savings goals. Format the response as a simple text paragraph or bullet points using '*' for each point.
          
          Data:
          - Monthly Income: ${formatCurrency(monthlyIncome)}
          - Budget Categories: ${JSON.stringify(budget.map(b => ({ name: b.name, allocated: b.amount })))}
          - Recent Transactions: ${JSON.stringify(transactions.slice(0, 20).map(t => ({ description: t.description, amount: t.amount, category: t.category, type: t.type, date: t.date })))}
          - Savings Goals: ${JSON.stringify(savingsGoals.map(g => ({ title: g.title, current: g.currentAmount, target: g.targetAmount })))}
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        // Safely extract text from the response to prevent crashes on unexpected API results.
        const text = response.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
        setInsights(text);
      } else {
        throw new Error("API key is not configured for this environment.");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to fetch insights. Please try again later.');
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="font-bold">{`${payload[0].name}: ${formatCurrency(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
        <p className="mt-1 text-gray-600">Track your budget, expenses, and savings goals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Income" value={formatCurrency(totalIncome)} icon={<DollarIcon />} trend={<TrendUpIcon />} />
        <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} icon={<DollarIcon />} trend={<TrendDownIcon />} />
        <StatCard title="Remaining Budget" value={formatCurrency(remainingBudget)} icon={<DollarIcon />} />
        <StatCard title="Savings Progress" value={`${savingsProgress.toFixed(1)}%`} icon={<TargetIcon />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <ClockIcon />
            <span className="ml-2">Expense Categories</span>
          </h2>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {expenseByCategory.map((entry) => (
              <div key={entry.name} className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
                <span className="text-gray-600">{entry.name}:</span>
                <span className="font-medium ml-1 text-gray-800">{formatCurrency(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <TrendUpIcon />
            <span className="ml-2">Income Categories</span>
          </h2>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={incomeByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#82ca9d" paddingAngle={5}>
                  {incomeByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {incomeByCategory.map((entry) => (
              <div key={entry.name} className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
                <span className="text-gray-600">{entry.name}:</span>
                <span className="font-medium ml-1 text-gray-800">{formatCurrency(entry.value)}</span>
              </div>
            ))}
             {incomeByCategory.length === 0 && <p className="col-span-2 text-gray-500 text-center">No categorized income this period.</p>}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">Monthly Overview</h2>
        <div className="h-80 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyOverviewData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip cursor={{fill: 'rgba(243, 244, 246, 0.5)'}} contentStyle={{backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem'}} />
              <Legend iconType="circle" />
              <Bar dataKey="income" fill="#14b8a6" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#ec4899" name="Expenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <LightbulbIcon />
            <span className="ml-2">Financial Insights</span>
          </h2>
          <div className="mt-4">
            {isLoadingInsights ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              </div>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : insights ? (
              <div className="text-gray-600 whitespace-pre-wrap space-y-2">
                {(insights || '').split('*').map((item, index) => item.trim() && <p key={index} className="flex items-start"><span className="mr-2 mt-1 text-teal-500 font-bold">&bull;</span>{item.trim()}</p>)}
              </div>
            ) : (
              <p className="text-gray-500">Click the button to get personalized financial insights from our AI assistant.</p>
            )}
            <button onClick={getFinancialInsights} disabled={isLoadingInsights} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:bg-teal-300 transition-colors">
              {isLoadingInsights ? 'Analyzing...' : 'Get Smart Insights'}
            </button>
          </div>
        </div>
    </div>
  );
};

export default Dashboard;