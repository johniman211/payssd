import React from 'react';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue,
  color = 'blue',
  gradient = 'from-blue-400 to-blue-600'
}) => {
  const colorClasses = {
    blue: 'from-blue-400 to-blue-600',
    green: 'from-green-400 to-green-600',
    purple: 'from-purple-400 to-purple-600',
    orange: 'from-orange-400 to-orange-600',
    indigo: 'from-indigo-400 to-indigo-600',
    pink: 'from-pink-400 to-pink-600',
  };

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-6 
      bg-gradient-to-br ${colorClasses[color] || gradient}
      shadow-stripe-lg
      transform transition-all duration-300 hover:scale-105 hover:shadow-stripe-xl
      animate-fade-in-up
    `}>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 opacity-10">
        {Icon && <Icon size={120} strokeWidth={1} />}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            {Icon && <Icon size={24} className="text-white" />}
          </div>
          {trend && (
            <div className={`text-sm font-medium ${
              trend === 'up' ? 'text-white' : 'text-white/80'
            }`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </div>
          )}
        </div>
        
        <div className="text-3xl font-bold text-white mb-1">
          {value}
        </div>
        <div className="text-white/90 text-sm font-medium">
          {title}
        </div>
      </div>
    </div>
  );
};

export default StatCard;


