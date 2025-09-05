
import React from 'react';
import type { Page } from '../types';
import { NAV_LINKS } from '../constants';
import { LogoIcon } from './icons/LogoIcon';
import { DashboardIcon } from './icons/DashboardIcon';
import { BudgetIcon } from './icons/BudgetIcon';
import { ExpensesIcon } from './icons/ExpensesIcon';
import { SavingsIcon } from './icons/SavingsIcon';

interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const NavIcon: React.FC<{ name: Page }> = ({ name }) => {
  switch (name) {
    case 'Dashboard':
      return <DashboardIcon />;
    case 'Budget':
      return <BudgetIcon />;
    case 'Expenses':
      return <ExpensesIcon />;
    case 'Savings':
      return <SavingsIcon />;
    default:
      return null;
  }
};

const Header: React.FC<HeaderProps> = ({ activePage, setActivePage }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <LogoIcon />
            <span className="text-xl font-bold text-teal-600">BudgetPro</span>
          </div>
          <nav className="flex space-x-2 sm:space-x-4">
            {NAV_LINKS.map((link) => (
              <button
                key={link.name}
                onClick={() => setActivePage(link.name)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activePage === link.name
                    ? 'bg-teal-50 text-teal-600'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <NavIcon name={link.name} />
                <span>{link.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
