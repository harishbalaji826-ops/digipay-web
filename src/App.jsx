import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPortal from './pages/LoginPortal';
import DashboardPortal from './pages/DashboardPortal';
import { fetchUserProfile } from './services/api';

export default function App() {
  const [page, setPage] = useState('loading'); // 'loading' | 'landing' | 'login' | 'dashboard'
  const [token, setToken] = useState('');
  const [role, setRole] = useState('');
  const [name, setName] = useState('');

  // Attempt to restore session on mount
  useEffect(() => {
    const checkSession = async () => {
      const savedToken = localStorage.getItem('digipay_token');
      if (!savedToken) {
        setPage('landing');
        return;
      }

      try {
        // Fetch current profile directly using our api service client
        const data = await fetchUserProfile();
        
        setToken(savedToken);
        setRole(data.role || 'customer');
        setName(data.full_name || (data.role === 'admin' ? 'Global Administrator' : 'Merchant Store'));
        setPage('dashboard');
      } catch (err) {
        // Token invalid or expired
        localStorage.removeItem('digipay_token');
        setPage('landing');
      }
    };

    checkSession();
  }, []);

  const handleLoginSuccess = (userToken, userRole, userName) => {
    setToken(userToken);
    setRole(userRole);
    setName(userName);
    setPage('dashboard');
  };

  const handleLogout = () => {
    setToken('');
    setRole('');
    setName('');
    setPage('landing');
  };

  if (page === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-500 font-sans">
        <div className="w-8 h-8 border-2 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin"></div>
        <p className="text-xs font-semibold tracking-wider">Verifying session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans flex flex-col">
      {page === 'landing' && (
        <LandingPage onGoToLogin={() => setPage('login')} />
      )}
      {page === 'login' && (
        <LoginPortal 
          onLoginSuccess={handleLoginSuccess} 
          onGoBack={() => setPage('landing')} 
        />
      )}
      {page === 'dashboard' && (
        <DashboardPortal 
          token={token} 
          role={role} 
          name={name} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
}
