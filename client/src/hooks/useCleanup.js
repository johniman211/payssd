import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage cleanup of intervals, timeouts, and event listeners
 * Helps prevent memory leaks that can cause white screen issues
 */
export const useCleanup = () => {
  const timeoutsRef = useRef(new Set());
  const intervalsRef = useRef(new Set());
  const listenersRef = useRef(new Set());

  // Enhanced setTimeout that auto-cleans up
  const safeSetTimeout = (callback, delay) => {
    const timeoutId = setTimeout(() => {
      timeoutsRef.current.delete(timeoutId);
      callback();
    }, delay);
    timeoutsRef.current.add(timeoutId);
    return timeoutId;
  };

  // Enhanced setInterval that auto-cleans up
  const safeSetInterval = (callback, delay) => {
    const intervalId = setInterval(callback, delay);
    intervalsRef.current.add(intervalId);
    return intervalId;
  };

  // Enhanced addEventListener that auto-cleans up
  const safeAddEventListener = (element, event, handler, options) => {
    element.addEventListener(event, handler, options);
    const listener = { element, event, handler, options };
    listenersRef.current.add(listener);
    return () => {
      element.removeEventListener(event, handler, options);
      listenersRef.current.delete(listener);
    };
  };

  // Manual cleanup functions
  const clearSafeTimeout = (timeoutId) => {
    clearTimeout(timeoutId);
    timeoutsRef.current.delete(timeoutId);
  };

  const clearSafeInterval = (intervalId) => {
    clearInterval(intervalId);
    intervalsRef.current.delete(intervalId);
  };

  // Cleanup all on unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts
      timeoutsRef.current.forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
      timeoutsRef.current.clear();

      // Clear all intervals
      intervalsRef.current.forEach(intervalId => {
        clearInterval(intervalId);
      });
      intervalsRef.current.clear();

      // Remove all event listeners
      listenersRef.current.forEach(({ element, event, handler, options }) => {
        try {
          element.removeEventListener(event, handler, options);
        } catch (error) {
          console.warn('Failed to remove event listener:', error);
        }
      });
      listenersRef.current.clear();
    };
  }, []);

  return {
    safeSetTimeout,
    safeSetInterval,
    safeAddEventListener,
    clearSafeTimeout,
    clearSafeInterval,
  };
};

export default useCleanup;