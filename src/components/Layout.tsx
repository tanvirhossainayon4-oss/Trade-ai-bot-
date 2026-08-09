import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, LineChart, ActivitySquare, Bell, Menu, X } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Markets', path: '/markets', icon: LineChart },
    { name: 'Analysis', path: '/analysis', icon: ActivitySquare },
  ];

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100 font-sans md:overflow-hidden flex-col md:flex-row">
      {/* Mobile Header (Android-like App Bar) */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 bg-neutral-900 border-b border-neutral-800 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <LineChart className="w-5 h-5 text-indigo-500" />
          <h1 className="text-lg font-bold tracking-tight text-white">AI Market</h1>
        </div>
        <button className="p-2 text-neutral-400 hover:text-white relative active:bg-neutral-800 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-neutral-900"></span>
        </button>
      </header>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 bg-neutral-900 border-r border-neutral-800 flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <LineChart className="w-6 h-6 text-indigo-500" />
            AI Market
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-indigo-500/10 text-indigo-400 font-medium' 
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-16 md:pb-0">
        {/* Desktop Topbar */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 bg-neutral-900/50 border-b border-neutral-800">
          <h2 className="text-lg font-medium capitalize">
            {location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1)}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-neutral-400 hover:text-white transition-colors relative rounded-full hover:bg-neutral-800">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 overscroll-y-none">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation (Android style) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-neutral-900 border-t border-neutral-800 flex items-center justify-around z-20 px-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative active:bg-neutral-800/50 rounded-xl transition-colors ${
                isActive ? 'text-indigo-400' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <div className={`p-1 rounded-full transition-colors ${isActive ? 'bg-indigo-500/20' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
