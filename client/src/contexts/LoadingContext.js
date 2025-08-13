import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});

  // Set loading state for a specific key
  const setLoading = (key, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  };

  // Get loading state for a specific key
  const isLoading = (key) => {
    return loadingStates[key] || false;
  };

  // Check if any loading state is active
  const isAnyLoading = () => {
    return Object.values(loadingStates).some(loading => loading);
  };

  // Clear all loading states
  const clearAllLoading = () => {
    setLoadingStates({});
  };

  // Clear specific loading state
  const clearLoading = (key) => {
    setLoadingStates(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  const value = {
    setLoading,
    isLoading,
    isAnyLoading,
    clearAllLoading,
    clearLoading,
    loadingStates
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingContext;