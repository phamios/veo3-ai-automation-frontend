import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Checkout from './components/Checkout';
import AdminDashboard from './components/AdminDashboard';
import { User, UserRole, Package } from './types';
import { apiClient, authApi, ApiError } from './services/api';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'LANDING' | 'DASHBOARD' | 'CHECKOUT' | 'ADMIN'>('LANDING');
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isSessionInvalid, setIsSessionInvalid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Handle session invalidation from API client
  const handleSessionInvalid = useCallback(() => {
    setIsSessionInvalid(true);
    setUser(null);
    setCurrentView('LANDING');
    authApi.clearStoredToken();
  }, []);

  // Set up session invalid callback
  useEffect(() => {
    apiClient.setSessionInvalidCallback(handleSessionInvalid);
  }, [handleSessionInvalid]);

  // Initialize: Check if user has token and get user info
  useEffect(() => {
    const initAuth = async () => {
      // Check if we had a session before
      if (authApi.hasStoredToken()) {
        try {
          const currentUser = await authApi.getMe();
          if (currentUser) {
            setUser(currentUser);
            setCurrentView(currentUser.role === UserRole.ADMIN ? 'ADMIN' : 'DASHBOARD');
          } else {
            authApi.clearStoredToken();
          }
        } catch (error) {
          authApi.clearStoredToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Single Session Check: Every 30 seconds
  useEffect(() => {
    if (!user) return;

    const checkSession = async () => {
      const isValid = await authApi.checkSession();
      if (!isValid) {
        handleSessionInvalid();
      }
    };

    const intervalId = setInterval(checkSession, 30000); // 30 seconds
    return () => clearInterval(intervalId);
  }, [user, handleSessionInvalid]);

  const handleLogin = async (email: string, password: string) => {
    setAuthError(null);
    try {
      const loggedInUser = await authApi.login({ email, password });
      setUser(loggedInUser);
      setCurrentView(loggedInUser.role === UserRole.ADMIN ? 'ADMIN' : 'DASHBOARD');
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        setAuthError(error.message);
      } else {
        setAuthError('Có lỗi xảy ra, vui lòng thử lại');
      }
      return false;
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    setAuthError(null);
    try {
      await authApi.register({ email, password, name });
      // Auto login after register
      return await handleLogin(email, password);
    } catch (error) {
      if (error instanceof ApiError) {
        setAuthError(error.message);
      } else {
        setAuthError('Có lỗi xảy ra, vui lòng thử lại');
      }
      return false;
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tải...</p>
        </div>
      </div>
    );
  }

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

    return (
      <LandingPage
        onLogin={handleLogin}
        onRegister={handleRegister}
        authError={authError}
        clearAuthError={() => setAuthError(null)}
      />
    );
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
              onClick={() => setIsSessionInvalid(false)}
              className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/25"
            >
              Đăng nhập lại
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
