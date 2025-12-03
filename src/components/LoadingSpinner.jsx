import React from 'react';

const LoadingSpinner = ({ fullPage = false, size = 'md', message = 'Loading...' }) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizes[size]} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`} />
      {message && <p className="mt-4 text-secondary-600 text-sm">{message}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">{spinner}</div>;
  }

  return <div className="flex items-center justify-center p-8">{spinner}</div>;
};

export default LoadingSpinner;


