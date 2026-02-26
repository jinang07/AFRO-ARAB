
import React, { useState, useEffect } from 'react';
import { AppScreen, User } from './types';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import Suppliers from './screens/Suppliers';
import Buyers from './screens/Buyers';
import Orders from './screens/Orders';
import Reports from './screens/Reports';
import Profile from './screens/Profile';
import Agents from './screens/Agents';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import CodeExplorer from './components/CodeExplorer';
import { api } from './services/api';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeScreen, setActiveScreen] = useState<AppScreen>(AppScreen.Dashboard);
  const [showCode, setShowCode] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const userData = await api.get('/users/me/');
          setUser(userData);
        } catch (err) {
          console.error('Failed to restore session', err);
          api.setToken(null);
        }
      }
      setIsInitializing(false);
    };

    const handleUnauthorized = () => {
      setUser(null);
      api.setToken(null);
    };

    initAuth();
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setActiveScreen(AppScreen.Dashboard);
  };

  const handleLogout = () => {
    setUser(null);
    api.setToken(null);
    setActiveScreen(AppScreen.Dashboard);
    setShowCode(false);
  };

  if (isInitializing) {
    return (
      <div className="h-[100dvh] bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderScreen = () => {
    if (showCode) return <CodeExplorer />;

    switch (activeScreen) {
      case AppScreen.Dashboard: return <Dashboard user={user} />;
      case AppScreen.Suppliers: return <Suppliers user={user} />;
      case AppScreen.Buyers: return <Buyers user={user} />;
      case AppScreen.Orders: return <Orders user={user} />;
      case AppScreen.Reports: return <Reports user={user} />;
      case AppScreen.Agents: return <Agents user={user} />;
      case AppScreen.Profile: return <Profile user={user} onLogout={handleLogout} />;
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <div className="h-[100dvh] bg-slate-50 flex flex-col overflow-hidden">
      <Header
        user={user}
        onLogout={handleLogout}
        showCode={showCode}
        toggleCode={() => setShowCode(!showCode)}
      />

      <main className="flex-1 overflow-y-auto p-4 w-full max-w-lg mx-auto pb-32">
        {renderScreen()}
      </main>

      <BottomNav
        activeScreen={activeScreen}
        setActiveScreen={(s) => { setActiveScreen(s); setShowCode(false); }}
        userRole={user.role}
      />
    </div>
  );
};

export default App;
