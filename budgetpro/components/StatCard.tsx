
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className="flex flex-col items-end">
        <div className="text-teal-500">{icon}</div>
        {trend && <div className="mt-2">{trend}</div>}
      </div>
    </div>
  );
};

export default StatCard;
