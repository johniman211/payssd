import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  Link2, 
  Key, 
  CheckCircle, 
  DollarSign, 
  Bell, 
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoSvg from '@/assets/logo-ssd.svg';

const Sidebar = ({ onSignOut }) => {
  const location = useLocation();
  const { profile, userType } = useAuth();

  const merchantNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: CreditCard },
    { name: 'Payment Links', path: '/payment-links', icon: Link2 },
    { name: 'API Keys', path: '/api-keys', icon: Key },
    { name: 'Verification', path: '/verification', icon: CheckCircle },
    { name: 'Payouts', path: '/payouts', icon: DollarSign },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Merchants', path: '/admin/merchants', icon: User },
    { name: 'Transactions', path: '/admin/transactions', icon: CreditCard },
    { name: 'Payouts', path: '/admin/payouts', icon: DollarSign },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const navigation = userType === 'admin' ? adminNav : merchantNav;

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return profile?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-primary-600 to-primary-800 text-white">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src={logoSvg} alt="PaySSD" className="h-6 w-6 rounded-lg shadow-inner" />
          <div>
            <div className="text-xl font-bold">PaySSD</div>
            <div className="text-xs text-white/70">Payment Gateway</div>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center text-lg font-bold border-2 border-white/20">
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">
              {profile?.first_name || 'User'}
            </div>
            <div className="text-xs text-white/70 truncate">
              {profile?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${isActive 
                  ? 'bg-white text-primary-600 shadow-lg' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full
                     text-white/80 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;


