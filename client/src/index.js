import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Global error handlers to prevent white screen issues
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  if (process.env.NODE_ENV === 'production') {
    event.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  if (process.env.NODE_ENV === 'production') {
    event.preventDefault();
  }
});

// Add performance monitoring
if ('performance' in window) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'measure' && entry.duration > 1000) {
        console.warn(`Slow operation detected: ${entry.name} took ${entry.duration}ms`);
      }
    }
  });
  
  try {
    observer.observe({ entryTypes: ['measure', 'navigation'] });
  } catch (error) {
    console.warn('Performance observer not supported:', error);
  }
}

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app
// Note: Temporarily disable StrictMode to avoid double-invoking effects while diagnosing white screen issues.
// Consider re-enabling once effects are idempotent.
root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);
