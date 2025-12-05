import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PaymentCheckout from './pages/PaymentCheckout';

// Merchant Pages
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import PaymentLinks from './pages/PaymentLinks';
import ApiKeys from './pages/ApiKeys';
import ApiDocs from './pages/ApiDocs';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Refund from './pages/Refund';
import KycAml from './pages/KycAml';
import Cookies from './pages/Cookies';
import Security from './pages/Security';
import About from './pages/About';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import Integration from './pages/Integration';
import Verification from './pages/Verification';
import Payouts from './pages/Payouts';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMerchants from './pages/admin/AdminMerchants';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminPayouts from './pages/admin/AdminPayouts';
import AdminApiMonitoring from './pages/admin/AdminApiMonitoring';
import AdminSystemHealth from './pages/admin/AdminSystemHealth';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogin from './pages/admin/AdminLogin';
import QuickAdminSetup from './pages/admin/QuickAdminSetup';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner fullPage />;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner fullPage />;
  if (user) return <Navigate to="/dashboard" replace />;
  
  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const { user, userType, loading } = useAuth();
  if (loading) return <LoadingSpinner fullPage />;
  if (!user || userType !== 'admin') return <Navigate to="/admin/login" replace />;
  return children;
};

const AdminPublicRoute = ({ children }) => {
  const { userType, loading } = useAuth();
  if (loading) return <LoadingSpinner fullPage />;
  if (userType === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/checkout/:linkCode" element={<PaymentCheckout />} />
          <Route path="/pricing" element={<Pricing />} />
          
          {/* Onboarding - Protected but accessible */}
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          
          {/* Merchant Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/payment-links" element={<ProtectedRoute><PaymentLinks /></ProtectedRoute>} />
          <Route path="/api-keys" element={<ProtectedRoute><ApiKeys /></ProtectedRoute>} />
          <Route path="/api-docs" element={<ApiDocs />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refunds" element={<Refund />} />
          <Route path="/kyc-aml" element={<KycAml />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/security" element={<Security />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/integration" element={<Integration />} />
          <Route path="/verification" element={<ProtectedRoute><Verification /></ProtectedRoute>} />
          <Route path="/payouts" element={<ProtectedRoute><Payouts /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          
          <Route path="/admin/login" element={<AdminPublicRoute><AdminLogin /></AdminPublicRoute>} />
          <Route path="/admin/setup" element={<AdminPublicRoute><QuickAdminSetup /></AdminPublicRoute>} />
          <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/admin/merchants" element={<AdminProtectedRoute><AdminMerchants /></AdminProtectedRoute>} />
          <Route path="/admin/transactions" element={<AdminProtectedRoute><AdminTransactions /></AdminProtectedRoute>} />
          <Route path="/admin/payouts" element={<AdminProtectedRoute><AdminPayouts /></AdminProtectedRoute>} />
          <Route path="/admin/api-monitoring" element={<AdminProtectedRoute><AdminApiMonitoring /></AdminProtectedRoute>} />
          <Route path="/admin/system-health" element={<AdminProtectedRoute><AdminSystemHealth /></AdminProtectedRoute>} />
          <Route path="/admin/notifications" element={<AdminProtectedRoute><AdminNotifications /></AdminProtectedRoute>} />
          <Route path="/admin/settings" element={<AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>} />
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
