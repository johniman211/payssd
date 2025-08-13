import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ui/ThemeToggle';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  UserGroupIcon,
  DocumentCheckIcon,
  CreditCardIcon,
  BanknotesIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Failed to logout');
    }
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: HomeIcon
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: UserGroupIcon
    },
    {
      name: 'KYC Management',
      href: '/admin/kyc',
      icon: DocumentCheckIcon
    },
    {
      name: 'Transactions',
      href: '/admin/transactions',
      icon: CreditCardIcon
    },
    {
      name: 'Payouts',
      href: '/admin/payouts',
      icon: BanknotesIcon
    },
    {
      name: 'Blog Management',
      href: '/admin/blog',
      icon: DocumentTextIcon
    },
    {
      name: 'Jobs Management',
      href: '/admin/jobs',
      icon: BriefcaseIcon
    },
    {
      name: 'System Settings',
      href: '/admin/settings',
      icon: CogIcon
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg transition-colors">
      <Navbar />
      <div className="flex">
        <Sidebar isAdmin={true} />
        <main className="flex-1 ml-64 pt-20 p-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="bg-white/80 supports-[backdrop-filter]:bg-white/60 dark:bg-dark-card/60 backdrop-blur rounded-2xl shadow-elevated border border-gray-200 dark:border-dark-border p-6">
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;