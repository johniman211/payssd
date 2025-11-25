import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Home from "@/pages/Home";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import PricingPage from "@/pages/PricingPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import ReportsPage from "@/pages/ReportsPage";
import { ContactPage } from "@/pages/ContactPage";
import { CompliancePage } from "@/pages/CompliancePage";
import { AdminDashboard } from "@/pages/AdminDashboard";

export default function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Catch all */}
          <Route path="*" element={<div className="text-center text-xl">Page Not Found</div>} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </>
  );
}
