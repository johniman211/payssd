import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Wallet, 
  Activity, 
  Server, 
  Bell, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { supabase } from '@/supabase/supabaseClient';

const AdminLayout = ({ children, activePage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('id')
        .eq('recipient_type', 'admin')
        .eq('is_read', false);
      setUnread((data || []).length);
    };
    load();
    const channel = supabase.channel('admin_header')
      .on('postgres_changes', { event: 'insert', schema: 'public', table: 'notifications', filter: 'recipient_type=eq.admin' }, () => load())
      .on('postgres_changes', { event: 'update', schema: 'public', table: 'notifications', filter: 'recipient_type=eq.admin' }, () => load())
      .subscribe();
    const interval = setInterval(load, 10000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Merchants', href: '/admin/merchants', icon: Users },
    { name: 'Transactions', href: '/admin/transactions', icon: CreditCard },
    { name: 'Payouts', href: '/admin/payouts', icon: Wallet },
    { name: 'API Monitoring', href: '/admin/api-monitoring', icon: Activity },
    { name: 'System Health', href: '/admin/system-health', icon: Server },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-slate-900/90 backdrop-blur-xl border-r border-white/10 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <img src={logoSvg} alt="PaySSD" className="h-5 w-5 rounded-lg shadow-inner" />
              <div>
                <h1 className="text-xl font-bold text-white">PaySSD</h1>
                <p className="text-xs text-cyan-400">Admin Portal</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/70 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.name.toLowerCase().replace(' ', '-');
              
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-white' : 'text-white/70 group-hover:text-cyan-400'} />
                  <span className="font-medium">{item.name}</span>
                </a>
              );
            })}
          </nav>

          {/* Logout */}
          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200 mt-4"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-slate-900/50 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-white/70 hover:text-white"
            >
              <Menu size={24} />
            </button>
            
            <div className="flex-1 lg:flex-none">
              <h2 className="text-xl font-bold text-white capitalize">
                {activePage?.replace('-', ' ')}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-green-400 font-medium">System Online</span>
              </div>
              <button
                onClick={() => { window.location.href = '/admin/notifications'; }}
                className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
                title="Notifications"
              >
                <Bell size={20} />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-5 px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;


import logoSvg from '@/assets/logo-ssd.svg'
