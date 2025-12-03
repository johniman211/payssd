import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X, Moon, Sun } from 'lucide-react';
import logoSvg from '@/assets/logo-ssd.svg';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/supabase/supabaseClient';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!profile?.id) return;
      const { data } = await supabase
        .from('notifications')
        .select('id')
        .eq('merchant_id', profile.id)
        .eq('is_read', false);
      setUnread((data || []).length);
    };
    load();
    if (!profile?.id) return;
    const channel = supabase.channel('merchant_header_' + profile.id)
      .on('postgres_changes', { event: 'insert', schema: 'public', table: 'notifications', filter: `merchant_id=eq.${profile.id}` }, () => load())
      .on('postgres_changes', { event: 'update', schema: 'public', table: 'notifications', filter: `merchant_id=eq.${profile.id}` }, () => load())
      .subscribe();
    const interval = setInterval(load, 10000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [profile?.id]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-secondary-50 overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 w-64 z-50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static
        `}
      >
        <Sidebar onSignOut={handleSignOut} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-secondary-200 h-16 flex items-center justify-between px-4 lg:px-8 z-30">
          {/* Left: Mobile Menu + Search */}
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <a href="/" className="hidden md:flex items-center gap-2">
              <img src={logoSvg} alt="PaySSD" className="h-6 w-6" />
              <span className="text-secondary-900 font-semibold">PaySSD</span>
            </a>

            <div className="hidden md:flex items-center gap-2 bg-secondary-50 rounded-xl px-4 py-2 flex-1 max-w-md">
              <Search size={20} className="text-secondary-400" />
              <input
                type="text"
                placeholder="Search here..."
                className="bg-transparent border-none outline-none w-full text-sm"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button className="relative p-2 hover:bg-secondary-100 rounded-lg transition-colors" onClick={() => navigate('/notifications')}>
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-5 px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>

            <button className="hidden sm:flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors">
              <span className="text-sm font-medium">Generate Report</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;


