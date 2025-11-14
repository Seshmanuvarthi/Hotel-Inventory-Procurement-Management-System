import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, color = 'primary', subtitle, trend }) => {
  const colorClasses = {
    primary: 'bg-primary text-card',
    secondary: 'bg-secondary text-primary',
    accent: 'bg-accent text-card',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-red-500 text-white',
  };

  return (
    <div className="bg-card rounded-xl shadow-luxury hover:shadow-luxury-lg transition-all duration-300 p-6 border border-secondary/10 hover:border-secondary/20">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-accent uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold text-text-dark mt-2">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-text-dark/70 mt-1">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                trend.type === 'positive' ? 'text-green-600' :
                trend.type === 'negative' ? 'text-red-600' : 'text-text-dark/70'
              }`}>
                {trend.value}
              </span>
              <span className="text-sm text-text-dark/70 ml-1">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]} shadow-luxury`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
