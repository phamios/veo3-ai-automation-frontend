import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Checkout from './components/Checkout';
import AdminDashboard from './components/AdminDashboard';
import { User, UserRole, Package } from './types';
import { authService } from './services/mockApi';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'LANDING' | 'DASHBOARD' | 'CHECKOUT' | 'ADMIN'>('LANDING');
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isSessionInvalid, setIsSessionInvalid] = useState(false);

  // Initialize: Check if user is already logged in
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setCurrentView(currentUser.role === UserRole.ADMIN ? 'ADMIN' : 'DASHBOARD');
    }
  }, []);

  // Single Session Check: Every 30 seconds
  useEffect(() => {
    if (!user) return;

    const checkSession = async () => {
      const isValid = await authService.checkSessionValidity();
      if (!isValid) {
        setIsSessionInvalid(true);
        setUser(null);
        setCurrentView('LANDING');
        authService.logout(); // Clear local storage
      }
    };

    const intervalId = setInterval(checkSession, 30000); // 30 seconds
    return () => clearInterval(intervalId);
  }, [user]);

  const handleLogin = async (asAdmin: boolean = false) => {
    const loggedInUser = await authService.login(asAdmin);
    setUser(loggedInUser);
    setCurrentView(loggedInUser.role === UserRole.ADMIN ? 'ADMIN' : 'DASHBOARD');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentView('LANDING');
  };

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setCurrentView('CHECKOUT');
  };

  const handleCheckoutSuccess = () => {
    setCurrentView('DASHBOARD');
    setSelectedPackage(null);
  };

  // Render View Logic
  const renderContent = () => {
    if (currentView === 'ADMIN') {
      return <AdminDashboard onLogout={handleLogout} />;
    }

    if (currentView === 'CHECKOUT' && user && selectedPackage) {
      return (
        <Checkout 
          user={user} 
          pkg={selectedPackage} 
          onBack={() => setCurrentView('DASHBOARD')}
          onSuccess={handleCheckoutSuccess}
        />
      );
    }

    if (currentView === 'DASHBOARD' && user) {
      return (
        <Dashboard 
          user={user} 
          onLogout={handleLogout} 
          onSelectPackage={handleSelectPackage}
        />
      );
    }

    return <LandingPage onStart={() => handleLogin(false)} />;
  };

  return (
    <>
      {renderContent()}

      {/* Session Invalid Modal */}
      {isSessionInvalid && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center border border-slate-700 shadow-2xl">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Phiên đăng nhập hết hạn</h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Tài khoản của bạn đã được đăng nhập trên một thiết bị khác. 
              <br />
              Vui lòng đăng nhập lại để tiếp tục sử dụng.
            </p>
            <button 
              onClick={() => {
                setIsSessionInvalid(false);
                handleLogin(false); // Quick re-login for demo, or just close to stay on landing
              }}
              className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/25"
            >
              Đăng nhập lại
            </button>
            <button 
              onClick={() => setIsSessionInvalid(false)}
              className="mt-4 text-slate-500 hover:text-white text-sm"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      )}
      
      {/* Dev Tool: Login as Admin Helper */}
      {!user && (
        <div className="fixed bottom-4 right-4 opacity-50 hover:opacity-100 transition-opacity">
          <button 
            onClick={() => handleLogin(true)} 
            className="bg-slate-800 text-xs text-slate-500 px-3 py-1 rounded border border-slate-700"
          >
            Dev: Login Admin
          </button>
        </div>
      )}
    </>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);