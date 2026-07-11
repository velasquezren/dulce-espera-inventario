'use client';

import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import PWAInstallBanner from './components/PWAInstallBanner';

// Import modules
import Login from './components/Modules/Login';
import Dashboard from './components/Modules/Dashboard';
import Inventory from './components/Modules/Inventory';
import ProductDetail from './components/Modules/ProductDetail';
import RequestForm from './components/Modules/RequestForm';
import MyRequests from './components/Modules/MyRequests';
import Reception from './components/Modules/Reception';
import History from './components/Modules/History';
import Profile from './components/Modules/Profile';
import ManageProducts from './components/Modules/ManageProducts';
import WhatsAppDispatch from './components/Modules/WhatsAppDispatch';

export default function Home() {
  const { user, activeModule, isLoading, isSidebarCollapsed } = useApp();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeModule]);

  // If initial load is running, show a clean clinic launcher spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] text-center p-6">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo.svg" alt="Clinica Montalvo Logo" className="w-16 h-16" />
          <div className="animate-pulse-subtle">
            <h2 className="text-[#006156] font-bold text-sm tracking-widest uppercase">CLÍNICA MONTALVO</h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">Iniciando inventario...</p>
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated or at login page
  if (!user || activeModule === 'login') {
    return <Login />;
  }

  // Render the selected view/module
  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'detail':
        return <ProductDetail />;
      case 'request-form':
        return <RequestForm />;
      case 'requests':
        return <MyRequests />;
      case 'receptions':
        return <Reception />;
      case 'history':
        return <History />;
      case 'profile':
        return <Profile />;
      case 'manage-products':
        return <ManageProducts />;
      case 'whatsapp-dispatch':
        return <WhatsAppDispatch />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-[100dvh] bg-[#f8fafc]">
      {/* Persistent Sidebar on Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-[100dvh] min-w-0 transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
      }`}>
        {/* Header containing search, notifications and network state */}
        <Header />

        {/* PWA Install Promo Banner */}
        <PWAInstallBanner />

        {/* Scrollable Container */}
        <main key={activeModule} className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8 animate-view-enter min-w-0">
          {renderModule()}
        </main>

        {/* Mobile bottom navigation bar */}
        <BottomNav />
      </div>
    </div>
  );
}


