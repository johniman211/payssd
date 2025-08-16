import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { TokenStorage } from '../utils/security';

// Error boundary for RealtimeContext
class RealtimeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('RealtimeContext error:', error, errorInfo);
    // Don't show error to user, just log it
  }

  render() {
    if (this.state.hasError) {
      // Return children without realtime functionality
      return this.props.children;
    }

    return this.props.children;
  }
}

const RealtimeContext = createContext();

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

const RealtimeProviderInner = ({ children }) => {
  const { user, setUser } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  const socketRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const lastUpdateRef = useRef(null);
  
  // Add error state
  const [hasError, setHasError] = useState(false);
  
  // Error handler
  const handleError = (error, context = '') => {
    console.error(`RealtimeContext error (${context}):`, error);
    setHasError(true);
    // Reset error state after 5 seconds
    setTimeout(() => setHasError(false), 5000);
  };

  // Initialize Socket.IO connection
  const initializeSocket = () => {
    try {
      if (socketRef.current?.connected) return;
      
      const token = TokenStorage.getToken();
      if (!token) {
        console.log('❌ No token available for socket connection');
        return;
      }

      console.log('🔌 Initializing socket connection...');
      
      socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        maxReconnectionAttempts: 3
      });

      const socket = socketRef.current;

      // Connection events
      socket.on('connect', () => {
        console.log('✅ Real-time connection established');
        setIsConnected(true);
        setConnectionStatus('connected');
        clearTimeout(reconnectTimeoutRef.current);
        
        // Request initial user data
        socket.emit('requestUserUpdate');
        
        // Start heartbeat
        startHeartbeat();
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ Real-time connection lost:', reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Start fallback polling
        startFallbackPolling();
        
        // Attempt reconnection
        scheduleReconnect();
      });

      socket.on('connect_error', (error) => {
        console.error('🔌 Connection error:', error.message);
        setConnectionStatus('error');
        
        // Check if it's a token-related error
        if (error.message?.includes('token') || error.message?.includes('auth')) {
          console.log('🔑 Token-related error detected');
          
          // Only clear session after multiple failed attempts for auth errors
          if (typeof error.attempts === 'undefined') {
            error.attempts = 1;
          } else {
            error.attempts++;
          }
          
          if (error.attempts >= 3) {
            console.log('🔑 Token-related error persists after retries, clearing session...');
            TokenStorage.removeToken();
            setUser(null);
            return;
          } else {
            console.log(`🔑 Auth error attempt ${error.attempts}/3, retrying...`);
          }
        }
        
        // Start fallback polling
        startFallbackPolling();
        
        // Schedule reconnect
        scheduleReconnect();
      });
      
      // User update events
      socket.on('userUpdate', (data) => {
        console.log('📡 Received user update:', data.type);
        handleUserUpdate(data);
      });

      // Heartbeat response
      socket.on('pong', (data) => {
        console.log('💓 Heartbeat received');
      });
      
    } catch (error) {
      handleError(error, 'initializeSocket');
      setConnectionStatus('error');
      startFallbackPolling();
    }
  };

  // Handle user updates from real-time events
  const handleUserUpdate = (data) => {
    try {
      const { type, user: updatedUser, message } = data;
      
      // Prevent duplicate updates
      if (lastUpdateRef.current === data.timestamp) return;
      lastUpdateRef.current = data.timestamp;

      // Update user state
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      // Show appropriate notifications
      switch (type) {
        case 'EMAIL_VERIFICATION_UPDATE':
          if (data.isEmailVerified) {
            toast.success('🎉 Email verified successfully! Your account is now fully activated.');
            // Trigger a page refresh for components that depend on verification status
            window.dispatchEvent(new CustomEvent('emailVerified', { detail: updatedUser }));
          }
          break;
        case 'KYC_UPDATE':
          toast.success('📋 KYC status updated');
          break;
        case 'USER_DATA':
          // Silent update for initial data
          break;
        default:
          if (message) {
            toast.success(message);
          }
      }
    } catch (error) {
      handleError(error, 'handleUserUpdate');
    }
  };

  // Heartbeat to keep connection alive
  const startHeartbeat = () => {
    // Clear existing heartbeat if any
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    heartbeatIntervalRef.current = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('ping');
      } else {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    }, 30000); // Every 30 seconds
  };

  // Fallback polling when WebSocket is unavailable
  const startFallbackPolling = () => {
    if (pollingIntervalRef.current) return; // Already polling
    
    console.log('🔄 Starting fallback polling...');
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const token = TokenStorage.getToken();
        if (!token) {
          console.log('❌ No token available for polling, stopping...');
          stopFallbackPolling();
          return;
        }
        
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const profileUser = data?.user || data; // Support both { user: {...} } and direct user object
          
          // Check if user data has changed
          const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
          if (JSON.stringify(currentUser) !== JSON.stringify(profileUser)) {
            handleUserUpdate({
              type: 'POLLING_UPDATE',
              user: profileUser,
              timestamp: new Date().toISOString()
            });
          }
        } else if (response.status === 401) {
          console.log('🔑 Authentication failed during polling, clearing session...');
          TokenStorage.removeToken();
          setUser(null);
          stopFallbackPolling();
        }
      } catch (error) {
        console.error('Polling error:', error);
        // Don't stop polling for network errors, only for auth errors
      }
    }, 15000); // Every 15 seconds (reduced frequency)
  };



  // Stop fallback polling
  const stopFallbackPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log('⏹️ Stopped fallback polling');
    }
  };

  // Schedule reconnection attempt
  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) return;
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (!socketRef.current?.connected && user) {
        console.log('🔄 Attempting to reconnect...');
        cleanup();
        initializeSocket();
      }
    }, 5000); // Retry after 5 seconds
  };

  // Manual refresh function
  const refreshUserData = async () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('requestUserUpdate');
    } else {
      // Fallback to API call
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${TokenStorage.getToken()}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const profileUser = data?.user || data; // Support both { user: {...} } and direct user object
          handleUserUpdate({
            type: 'MANUAL_REFRESH',
            user: profileUser,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Manual refresh error:', error);
        toast.error('Failed to refresh user data');
      }
    }
  };

  // Cleanup function
  const cleanup = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    clearTimeout(reconnectTimeoutRef.current);
    reconnectTimeoutRef.current = null;
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    
    stopFallbackPolling();
    setIsConnected(false);
    setConnectionStatus('disconnected');
  };

  // Initialize when user logs in
  useEffect(() => {
    if (user && !socketRef.current) {
      initializeSocket();
    } else if (!user && socketRef.current) {
      cleanup();
    }

    return () => {
      cleanup();
    };
  }, [user]);

  // Token validation effect to prevent white screen
  useEffect(() => {
    if (!user) return;

    let validationAttempts = 0;
    const maxRetries = 3;

    const validateToken = () => {
      try {
        const token = TokenStorage.getToken();
        if (!token && user) {
          validationAttempts++;
          
          // Only clear session after multiple failed attempts
          if (validationAttempts >= maxRetries) {
            console.log('🔑 Token expired after multiple validation attempts, logging out user...');
            setUser(null);
            localStorage.removeItem('user');
            cleanup();
          } else {
            console.warn(`Token validation failed (attempt ${validationAttempts}/${maxRetries}), retrying...`);
          }
        } else if (token && validationAttempts > 0) {
          // Reset attempts if token is valid
          validationAttempts = 0;
        }
      } catch (error) {
        handleError(error, 'tokenValidation');
        validationAttempts++;
        
        // Only clear session after multiple failed attempts and not for network errors
        if (validationAttempts >= maxRetries && !error.message?.includes('network')) {
          try {
            console.log('Token validation failed multiple times, clearing session');
            setUser(null);
            localStorage.removeItem('user');
            cleanup();
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
          }
        }
      }
    };

    // Check token validity every 60 seconds (reduced frequency)
    const tokenCheckInterval = setInterval(validateToken, 60000);

    return () => {
      try {
        clearInterval(tokenCheckInterval);
      } catch (error) {
        console.error('Error clearing token validation interval:', error);
      }
    };
  }, [user, setUser]);

  // Browser tab visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        // Tab became visible, refresh data
        setTimeout(() => {
          refreshUserData();
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user' && e.newValue) {
        const newUser = JSON.parse(e.newValue);
        setUser(newUser);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setUser]);

  // If there's an error, provide minimal context
  if (hasError) {
    return (
      <RealtimeContext.Provider value={{
        isConnected: false,
        connectionStatus: 'error',
        refreshUserData: () => {},
        debug: { socketId: null, transport: null }
      }}>
        {children}
      </RealtimeContext.Provider>
    );
  }

  const value = {
    isConnected,
    connectionStatus,
    refreshUserData,
    // Expose connection info for debugging
    debug: {
      socketId: socketRef.current?.id,
      transport: socketRef.current?.io?.engine?.transport?.name
    }
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

// Export with error boundary
export const RealtimeProvider = ({ children }) => {
  return (
    <RealtimeErrorBoundary>
      <RealtimeProviderInner>{children}</RealtimeProviderInner>
    </RealtimeErrorBoundary>
  );
};