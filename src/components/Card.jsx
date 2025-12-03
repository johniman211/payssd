import React from 'react';

const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'default',
  gradient = false,
  onClick,
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-white rounded-2xl shadow-stripe border border-secondary-100
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${gradient ? 'bg-gradient-to-br from-white to-secondary-50' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;


