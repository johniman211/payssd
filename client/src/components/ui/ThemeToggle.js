import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme, theme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-10 w-10 items-center justify-center
        rounded-xl bg-white dark:bg-dark-card
        border border-gray-200 dark:border-dark-border
        shadow-soft hover:shadow-elevated
        transition-all duration-300 ease-in-out
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        dark:focus:ring-offset-dark-bg
        group overflow-hidden
        ${className}
      `}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Background gradient animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      
      {/* Icon container with rotation animation */}
      <div className="relative z-10 transition-transform duration-500 ease-in-out group-hover:rotate-12">
        {theme === 'dark' ? (
          <SunIcon 
            className="h-5 w-5 text-amber-500 transition-all duration-300 group-hover:text-amber-400 drop-shadow-sm" 
          />
        ) : (
          <MoonIcon 
            className="h-5 w-5 text-slate-600 dark:text-slate-400 transition-all duration-300 group-hover:text-slate-500 drop-shadow-sm" 
          />
        )}
      </div>
      
      {/* Ripple effect on click */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-active:opacity-100 bg-gradient-to-r from-primary-500/20 to-accent-500/20 transition-opacity duration-150" />
    </button>
  );
};

export default ThemeToggle;