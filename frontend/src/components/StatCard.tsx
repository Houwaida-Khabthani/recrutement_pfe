import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => {
  return (
    <div className="bg-white shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {change && (
            <p className="text-green-600 text-sm font-medium mt-1">
              {change}
            </p>
          )}
        </div>
        <div className="text-slate-400 text-3xl">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;