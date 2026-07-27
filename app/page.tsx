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
import ComprasView from './components/Modules/ComprasView';

export default function Home() {
  const { user, activeModule, isLoading, isSidebarCollapsed } = useApp();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeModule]);

  // Spinner loader
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] text-center p-6 font-sans">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo.svg" alt="Clínica Montalvo Logo" className="w-16 h-16 animate-pulse" />
          <div className="animate-pulse-subtle">
            <h2 className="text-[#006156] font-bold text-sm tracking-widest uppercase">CLÍNICA MONTALVO</h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">Iniciando PWA de Inventario de Cocina...</p>
          </div>
        </div>
      </div>
    );
  }

  // Dedicated custom full-screen view for Compras role / module
  if (user && (activeModule === 'compras' || user.role === 'compras')) {
    return <ComprasView />;
  }

  // If user is not authenticated or at login page
  if (!user || activeModule === 'login') {
    return <Login />;
  }

  // Render module
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
        return <Inventory />;
    }
  };

  return (
    <div className="flex min-h-[100dvh] bg-[#f8fafc] font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-[100dvh] min-w-0 transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
      }`}>
        <Header />
        <PWAInstallBanner />

        <main key={activeModule} className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-8 animate-view-enter min-w-0">
          {renderModule()}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
