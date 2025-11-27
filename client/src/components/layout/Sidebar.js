import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  LinkIcon,
  CreditCardIcon,
  BanknotesIcon,
  DocumentCheckIcon,
  UserIcon,
  Cog6ToothIcon,
  UsersIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  LinkIcon as LinkIconSolid,
  CreditCardIcon as CreditCardIconSolid,
  BanknotesIcon as BanknotesIconSolid,
  DocumentCheckIcon as DocumentCheckIconSolid,
  UserIcon as UserIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  UsersIcon as UsersIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  MegaphoneIcon as MegaphoneIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  BriefcaseIcon as BriefcaseIconSolid
} from '@heroicons/react/24/solid';
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

const Sidebar = ({ isAdmin = false, isMobileOpen = false, onMobileClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobileOpen && onMobileClose) {
      onMobileClose();
    }
  }, [location.pathname]);

  const merchantNavItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      current: location.pathname === '/dashboard'
    },
    {
      name: 'Payment Links',
      href: '/dashboard/payment-links',
      icon: LinkIcon,
      iconSolid: LinkIconSolid,
      current: location.pathname.startsWith('/dashboard/payment-links')
    },
    {
      name: 'Transactions',
      href: '/dashboard/transactions',
      icon: CreditCardIcon,
      iconSolid: CreditCardIconSolid,
      current: location.pathname === '/dashboard/transactions'
    },
    {
      name: 'Notifications',
      href: '/dashboard/notifications',
      icon: ClipboardDocumentListIcon,
      iconSolid: ClipboardDocumentListIconSolid,
      current: location.pathname === '/dashboard/notifications'
    },
    {
      name: 'Payouts',
      href: '/dashboard/payouts',
      icon: BanknotesIcon,
      iconSolid: BanknotesIconSolid,
      current: location.pathname === '/dashboard/payouts'
    },
    {
      name: 'KYC Verification',
      href: '/dashboard/kyc',
      icon: DocumentCheckIcon,
      iconSolid: DocumentCheckIconSolid,
      current: location.pathname === '/dashboard/kyc',
      badge: user?.kycStatus === 'pending' ? 'Pending' : null,
      badgeColor: user?.kycStatus === 'pending' ? 'warning' : null
    }
  ];

  const adminNavItems = [
    {
      name: 'Admin Dashboard',
      href: '/admin',
      icon: ChartBarIcon,
      iconSolid: ChartBarIconSolid,
      current: location.pathname === '/admin'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: UsersIcon,
      iconSolid: UsersIconSolid,
      current: location.pathname === '/admin/users'
    },
    {
      name: 'Transactions',
      href: '/admin/transactions',
      icon: CreditCardIcon,
      iconSolid: CreditCardIconSolid,
      current: location.pathname === '/admin/transactions'
    },
    {
      name: 'KYC Reviews',
      href: '/admin/kyc',
      icon: ShieldCheckIcon,
      iconSolid: ShieldCheckIconSolid,
      current: location.pathname === '/admin/kyc'
    },
    {
      name: 'Payouts',
      href: '/admin/payouts',
      icon: BanknotesIcon,
      iconSolid: BanknotesIconSolid,
      current: location.pathname === '/admin/payouts'
    },
    {
      name: 'Announcements',
      href: '/admin/announcements',
      icon: MegaphoneIcon,
      iconSolid: MegaphoneIconSolid,
      current: location.pathname === '/admin/announcements'
    },
    {
      name: 'Blog Management',
      href: '/admin/blog',
      icon: DocumentTextIcon,
      iconSolid: DocumentTextIconSolid,
      current: location.pathname === '/admin/blog'
    },
    {
      name: 'Jobs Management',
      href: '/admin/jobs',
      icon: BriefcaseIcon,
      iconSolid: BriefcaseIconSolid,
      current: location.pathname === '/admin/jobs'
    }
  ];

  const settingsItems = isAdmin ? [
    {
      name: 'Profile',
      href: '/admin/profile',
      icon: UserIcon,
      iconSolid: UserIconSolid,
      current: location.pathname === '/admin/profile'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Cog6ToothIcon,
      iconSolid: Cog6ToothIconSolid,
      current: location.pathname === '/admin/settings'
    }
  ] : [
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: UserIcon,
      iconSolid: UserIconSolid,
      current: location.pathname === '/dashboard/profile'
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Cog6ToothIcon,
      iconSolid: Cog6ToothIconSolid,
      current: location.pathname === '/dashboard/settings'
    }
  ];

  const navItems = isAdmin ? adminNavItems : merchantNavItems;

  const renderNavItem = (item) => {
    const Icon = item.current ? item.iconSolid : item.icon;
    
    return (
      <Link
        key={item.name}
        to={item.href}
        className={`
          group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
          ${item.current
            ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }
        `}
      >
        <Icon
          className={`
            flex-shrink-0 h-5 w-5 mr-3 transition-colors duration-200
            ${item.current ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}
          `}
        />
        <span className="flex-1">{item.name}</span>
        {item.badge && (
          <span className={`
            inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
            ${item.badgeColor === 'warning' 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-primary-100 text-primary-800'
            }
          `}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
    <div className="hidden lg:flex lg:flex-shrink-0 lg:fixed lg:inset-y-0 lg:z-50">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border pt-20 pb-4 overflow-y-auto h-screen">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div className="ml-2">
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">PaySSD</span>
                {isAdmin && (
                  <span className="block text-xs text-gray-500 dark:text-gray-400">Admin Panel</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex-grow flex flex-col">
            <nav className="flex-1 px-3 space-y-1">
              {/* Main Navigation */}
              <div className="space-y-1">
                {navItems.map(renderNavItem)}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-6"></div>

              {/* Settings Section */}
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Account
                  </h3>
                </div>
                {settingsItems.map(renderNavItem)}
              </div>
            </nav>
          </div>

          {/* User info at bottom */}
          <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 dark:border-dark-border">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-medium text-sm">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0)}
                </span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.firstName || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            
            {/* KYC Status Indicator */}
            {!isAdmin && user?.kycStatus && (
              <div className="mt-3">
                <div className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${user.kycStatus === 'approved' 
                    ? 'bg-green-100 text-green-800'
                    : user.kycStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                  }
                `}>
                  <div className={`
                    w-1.5 h-1.5 rounded-full mr-1.5
                    ${user.kycStatus === 'approved' 
                      ? 'bg-green-400'
                      : user.kycStatus === 'pending'
                      ? 'bg-yellow-400'
                      : 'bg-red-400'
                    }
                  `}></div>
                  KYC {user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    {/* Mobile/Tablet Sidebar */}
    {isMobileOpen && (
      <div className="lg:hidden w-64 bg-white dark:bg-dark-card shadow-elevated h-screen fixed left-0 top-16 border-r border-gray-200 dark:border-dark-border overflow-y-auto transition-colors z-40">
       <div className="p-6">
        {/* User Info */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-primary-100 dark:bg-primary-600/20 rounded-full flex items-center justify-center">
              <span className="text-primary-700 dark:text-primary-300 font-medium text-lg">
                {user.firstName?.charAt(0) || user.email?.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {user.firstName || 'User'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* KYC Status for Merchants */}
          {!isAdmin && (
            <div className="mt-4">
              {user.kycStatus === 'approved' ? (
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">KYC Verified</span>
                </div>
              ) : user.kycStatus === 'pending' ? (
                <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg">
                  <ClockIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">KYC Pending</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">KYC Required</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-soft ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-elevated'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
    )}
    
    {/* Mobile Sidebar Overlay */}
    {isMobileOpen && (
      <div 
        className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 top-16"
        onClick={onMobileClose}
      />
    )}
    </>
   );
};

export default Sidebar;
