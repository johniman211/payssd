import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  text = null,
  fullScreen = false,
  variant = 'default'
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
    '2xl': 'h-16 w-16'
  };

  const colorClasses = {
    primary: 'border-primary-600 dark:border-primary-400',
    accent: 'border-accent-600 dark:border-accent-400',
    success: 'border-success-600 dark:border-success-400',
    warning: 'border-warning-600 dark:border-warning-400',
    danger: 'border-danger-600 dark:border-danger-400',
    white: 'border-white'
  };

  const renderSpinner = () => {
    if (variant === 'dots') {
      return (
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`
                rounded-full bg-current animate-pulse-soft
                ${size === 'xs' ? 'h-1 w-1' : ''}
                ${size === 'sm' ? 'h-1.5 w-1.5' : ''}
                ${size === 'md' ? 'h-2 w-2' : ''}
                ${size === 'lg' ? 'h-2.5 w-2.5' : ''}
                ${size === 'xl' ? 'h-3 w-3' : ''}
                ${size === '2xl' ? 'h-4 w-4' : ''}
                ${colorClasses[color]?.replace('border-', 'text-')}
              `}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.4s'
              }}
            />
          ))}
        </div>
      );
    }

    if (variant === 'pulse') {
      return (
        <div className={`
          rounded-full animate-pulse-soft
          ${sizeClasses[size]}
          ${colorClasses[color]?.replace('border-', 'bg-')}
          opacity-75
        `} />
      );
    }

    // Default spinner with gradient
    return (
      <div className="relative">
        <div className={`
          animate-spin rounded-full border-2 
          border-gray-200 dark:border-dark-border
          ${sizeClasses[size]}
          ${className}
        `} />
        <div className={`
          absolute inset-0 animate-spin rounded-full border-2 border-transparent
          ${sizeClasses[size]}
          ${colorClasses[color]}
          border-t-current
        `} 
        style={{
          background: `conic-gradient(from 0deg, transparent, ${color === 'primary' ? '#6366f1' : color === 'accent' ? '#8b5cf6' : '#10b981'})`
        }}
        />
      </div>
    );
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-3 animate-fade-in">
      {renderSpinner()}
      {text && (
        <p className="text-sm text-gray-600 dark:text-dark-text-secondary animate-pulse-soft font-medium">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-sm z-50 flex items-center justify-center transition-all duration-300">
        <div className="bg-white dark:bg-dark-card rounded-2xl p-8 shadow-premium border border-gray-200 dark:border-dark-border">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;