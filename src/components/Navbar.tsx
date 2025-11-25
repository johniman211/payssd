import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xl font-bold text-gray-900">PaySSD</Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-primary-600' : 'text-gray-700 hover:text-gray-900'}`}>Home</NavLink>
            <NavLink to="/pricing" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-primary-600' : 'text-gray-700 hover:text-gray-900'}`}>Pricing</NavLink>
            <NavLink to="/reports" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-primary-600' : 'text-gray-700 hover:text-gray-900'}`}>Reports</NavLink>
            <NavLink to="/contact" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-primary-600' : 'text-gray-700 hover:text-gray-900'}`}>Contact</NavLink>
            <NavLink to="/compliance" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-primary-600' : 'text-gray-700 hover:text-gray-900'}`}>Compliance</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:inline-block text-sm font-semibold text-gray-700 hover:text-gray-900">Log in</Link>
            <Link to="/register" className="inline-block bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-700">Sign up</Link>
            <button aria-label="Toggle menu" onClick={() => setOpen(!open)} className="md:hidden p-2 text-gray-700 hover:text-gray-900">☰</button>
          </div>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-3 space-y-2">
            <NavLink to="/" onClick={() => setOpen(false)} className="block text-sm font-medium text-gray-700">Home</NavLink>
            <NavLink to="/pricing" onClick={() => setOpen(false)} className="block text-sm font-medium text-gray-700">Pricing</NavLink>
            <NavLink to="/reports" onClick={() => setOpen(false)} className="block text-sm font-medium text-gray-700">Reports</NavLink>
            <NavLink to="/contact" onClick={() => setOpen(false)} className="block text-sm font-medium text-gray-700">Contact</NavLink>
            <NavLink to="/compliance" onClick={() => setOpen(false)} className="block text-sm font-medium text-gray-700">Compliance</NavLink>
          </div>
        </div>
      )}
    </header>
  );
};

