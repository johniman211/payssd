import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RealtimeProvider } from './contexts/RealtimeContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import AdminLayout from './layouts/AdminLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import EnhancedEmailVerification from './components/EnhancedEmailVerification';
import EmailVerificationRequired from './components/EmailVerificationRequired';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import PaymentPage from './pages/public/PaymentPage';
import PaymentSuccessPage from './pages/public/PaymentSuccessPage';
import PaymentFailedPage from './pages/public/PaymentFailedPage';

// Static Pages
import PricingPage from './pages/static/PricingPage';
import ApiDocumentationPage from './pages/static/ApiDocumentationPage';
import IntegrationGuidePage from './pages/static/IntegrationGuidePage';
import AboutUsPage from './pages/static/AboutUsPage';
import ContactPage from './pages/static/ContactPage';
import CareersPage from './pages/static/CareersPage';
import JobDetail from './pages/static/JobDetail';
import BlogPage from './pages/static/BlogPage';
import BlogPost from './pages/static/BlogPost';
import HelpCenterPage from './pages/static/HelpCenterPage';
import DeveloperSupportPage from './pages/static/DeveloperSupportPage';
import StatusPage from './pages/static/StatusPage';
import ReportIssuePage from './pages/static/ReportIssuePage';
import PrivacyPolicyPage from './pages/static/PrivacyPolicyPage';
import TermsOfServicePage from './pages/static/TermsOfServicePage';
import CookiePolicyPage from './pages/static/CookiePolicyPage';
import CompliancePage from './pages/static/CompliancePage';
import NotFoundPage from './pages/static/NotFoundPage';

// Protected Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import PaymentLinksPage from './pages/dashboard/PaymentLinksPage';
import CreatePaymentLinkPage from './pages/dashboard/CreatePaymentLinkPage';
import TransactionsPage from './pages/dashboard/TransactionsPage';
import PayoutsPage from './pages/dashboard/PayoutsPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import KYCPage from './pages/dashboard/KYCPage';
import ProfilePage from './pages/dashboard/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import TransactionManagement from './pages/admin/TransactionManagement';
import KYCManagement from './pages/admin/KYCManagement';
import PayoutManagement from './pages/admin/PayoutManagement';
import BlogManagement from './pages/admin/BlogManagement';
import JobManagement from './pages/admin/JobManagement';
import SystemSettings from './pages/admin/SystemSettings';
import AnnouncementManager from './components/admin/AnnouncementManager';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

// Animated Page Wrapper
const AnimatedPage = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false, merchantOnly = false, requireEmailVerification = false }) => {
  const { user, loading, isEmailVerified } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-bg">
        <LoadingSpinner size="xl" text="Loading..." variant="default" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (merchantOnly && user.role !== 'merchant') {
    return <Navigate to="/admin" replace />;
  }

  // Check email verification for merchant routes that require it
  if (requireEmailVerification && merchantOnly && !isEmailVerified()) {
    return <EmailVerificationRequired />;
  }

  return <AnimatedPage>{children}</AnimatedPage>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children, allowAuthenticated = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-bg">
        <LoadingSpinner size="xl" text="Loading..." variant="default" />
      </div>
    );
  }

  // Allow access to email verification page even for authenticated users
  if (user && !allowAuthenticated && !location.pathname.startsWith('/verify-email')) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <AnimatedPage>{children}</AnimatedPage>;
};

// Dashboard Layout Component
const DashboardLayout = ({ children }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      <Navbar 
        onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />
      <div className="flex pt-16">
        <Sidebar 
          isAdmin={isAdmin} 
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
        <main className="flex-1 lg:ml-64 transition-all duration-300 relative z-10">
          <EnhancedEmailVerification />
          <div className="p-4 sm:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Public Layout Component
const PublicLayout = ({ children, showNavbar = true, showFooter = true }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg transition-colors duration-300">
      {showNavbar && <Navbar />}
      <main className={`${showNavbar ? 'pt-16' : ''} transition-all duration-300`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

// Routes wrapper with animations
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Routes will be defined here */}
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <RealtimeProvider>
              <LoadingProvider>
              <Router>
              <>
                <div className="App min-h-screen bg-white dark:bg-dark-bg transition-colors duration-300 overflow-x-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                  <Routes>
                  {/* Public Routes */}
                  <Route
                    path="/"
                    element={
                      <PublicRoute>
                        <PublicLayout>
                          <LandingPage />
                        </PublicLayout>
                      </PublicRoute>
                    }
                  />

                  {/* Static Pages Routes */}
                  <Route
                    path="/pricing"
                    element={
                      <PublicLayout>
                        <PricingPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/api-documentation"
                    element={
                      <PublicLayout>
                        <ApiDocumentationPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/integration-guide"
                    element={
                      <PublicLayout>
                        <IntegrationGuidePage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/about"
                    element={
                      <PublicLayout>
                        <AboutUsPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/contact"
                    element={
                      <PublicLayout>
                        <ContactPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/careers"
                    element={
                      <PublicLayout>
                        <CareersPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/careers/:slug"
                    element={
                      <PublicLayout>
                        <JobDetail />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/blog"
                    element={
                      <PublicLayout>
                        <BlogPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/blog/:slug"
                    element={
                      <PublicLayout>
                        <BlogPost />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/help"
                    element={
                      <PublicLayout>
                        <HelpCenterPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/developer-support"
                    element={
                      <PublicLayout>
                        <DeveloperSupportPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/status"
                    element={
                      <PublicLayout>
                        <StatusPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/report-issue"
                    element={
                      <PublicLayout>
                        <ReportIssuePage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/privacy"
                    element={
                      <PublicLayout>
                        <PrivacyPolicyPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/terms"
                    element={
                      <PublicLayout>
                        <TermsOfServicePage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/cookies"
                    element={
                      <PublicLayout>
                        <CookiePolicyPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/compliance"
                    element={
                      <PublicLayout>
                        <CompliancePage />
                      </PublicLayout>
                    }
                  />
                  
                  {/* Authentication Routes */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <PublicLayout showNavbar={false} showFooter={false}>
                          <LoginPage />
                        </PublicLayout>
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicRoute>
                        <PublicLayout showNavbar={false} showFooter={false}>
                          <RegisterPage />
                        </PublicLayout>
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/forgot-password"
                    element={
                      <PublicRoute>
                        <PublicLayout showNavbar={false} showFooter={false}>
                          <ForgotPasswordPage />
                        </PublicLayout>
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/reset-password/:token"
                    element={
                      <PublicRoute>
                        <PublicLayout showNavbar={false} showFooter={false}>
                          <ResetPasswordPage />
                        </PublicLayout>
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/verify-email/:token"
                    element={
                      <PublicRoute>
                        <PublicLayout showNavbar={false} showFooter={false}>
                          <EmailVerificationPage />
                        </PublicLayout>
                      </PublicRoute>
                    }
                  />

                  {/* Payment Routes */}
                  <Route
                    path="/pay/:linkId"
                    element={
                      <PublicLayout showNavbar={false} showFooter={false}>
                        <PaymentPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/payment/success"
                    element={
                      <PublicLayout showNavbar={false} showFooter={false}>
                        <PaymentSuccessPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/payment/failed"
                    element={
                      <PublicLayout showNavbar={false} showFooter={false}>
                        <PaymentFailedPage />
                      </PublicLayout>
                    }
                  />

                  {/* Protected Merchant Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute merchantOnly>
                        <DashboardLayout>
                          <DashboardPage />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/payment-links"
                    element={
                      <ProtectedRoute merchantOnly requireEmailVerification>
                        <DashboardLayout>
                          <PaymentLinksPage />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/payment-links/create"
                    element={
                      <ProtectedRoute merchantOnly requireEmailVerification>
                        <DashboardLayout>
                          <CreatePaymentLinkPage />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/transactions"
                    element={
                      <ProtectedRoute merchantOnly requireEmailVerification>
                        <DashboardLayout>
                          <TransactionsPage />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/payouts"
                    element={
                      <ProtectedRoute merchantOnly requireEmailVerification>
                        <DashboardLayout>
                          <PayoutsPage />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/kyc"
                    element={
                      <ProtectedRoute merchantOnly requireEmailVerification>
                        <DashboardLayout>
                          <KYCPage />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/profile"
                    element={
                      <ProtectedRoute merchantOnly>
                        <DashboardLayout>
                          <ProfilePage />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/settings"
                    element={
                      <ProtectedRoute merchantOnly>
                        <DashboardLayout>
                          <SettingsPage />
                        </DashboardLayout>
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminLayout>
                          <AdminDashboard />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminLayout>
                          <UserManagement />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/kyc"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminLayout>
                          <KYCManagement />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/transactions"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminLayout>
                          <TransactionManagement />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/payouts"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminLayout>
                          <PayoutManagement />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/blog"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminLayout>
                          <BlogManagement />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/jobs"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminLayout>
                          <JobManagement />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/profile"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminLayout>
                          <ProfilePage />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminLayout>
                          <SystemSettings />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/announcements"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminLayout>
                          <AnnouncementManager />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Not Found Route */}
                  <Route
                    path="*"
                    element={
                      <PublicLayout>
                        <NotFoundPage />
                      </PublicLayout>
                    }
                  />
                </Routes>
                  </AnimatePresence>

                  {/* Global Toast Notifications */}
                  <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'var(--card)',
                      color: 'var(--text)',
                      borderRadius: '12px',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      fontSize: '14px',
                      boxShadow: '0 10px 30px rgba(2,6,23,0.15)',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#10b981',
                        secondary: 'white',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: 'white',
                      },
                    },
                  }}
                  />
                </div>
              </>
              </Router>
              </LoadingProvider>
            </RealtimeProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;