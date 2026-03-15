
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
import NotificationsScreen from './screens/Notifications';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import { api } from './services/api';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';
import { useRef } from 'react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeScreen, setActiveScreen] = useState<AppScreen>(AppScreen.Dashboard);
  const [isInitializing, setIsInitializing] = useState(true);

  const [notifications, setNotifications] = useState<any[]>([]);
  const shownNotificationIds = useRef<Set<number>>(new Set());

  // Initialize Crashlytics for global error reporting
  useEffect(() => {
    if (Capacitor.getPlatform() === 'web') return;

    // Log unhandled JS exceptions explicitly to native Crashlytics
    window.onerror = (message, source, lineno, colno, error) => {
      FirebaseCrashlytics.recordException({
        message: `${message} at ${source}:${lineno}:${colno}`,
      });
      return false;
    };

    window.onunhandledrejection = (event) => {
      FirebaseCrashlytics.recordException({
        message: `Unhandled promise rejection: ${event.reason}`,
      });
    };
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const userData = await api.get('/users/me/');
          setUser(userData);
          fetchNotifications();
        } catch (err) {
          console.error('Failed to restore session', err);
          api.setToken(null);
        }
      }
      setIsInitializing(false);
    };

    const initPush = async () => {
      if (Capacitor.getPlatform() === 'web') return;

      try {
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') return;

        await PushNotifications.register();

        await PushNotifications.addListener('registration', async (token) => {
          await api.post('/fcm-tokens/', { token: token.value });
        });

        await PushNotifications.addListener('pushNotificationReceived', (notification) => {
          fetchNotifications();
        });

        await LocalNotifications.requestPermissions();
      } catch (e) {
        console.error('Error initializing push notifications', e);
      }
    };

    const handleUnauthorized = () => {
      setUser(null);
      api.setToken(null);
    };

    initAuth();
    if (user) initPush();

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, [user]);

  useEffect(() => {
    let interval: any;
    if (user) {
      fetchNotifications();
      interval = setInterval(fetchNotifications, 30000);
    }
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await api.get('/notifications/');
      setNotifications(data);

      // Show local notification for new unread ones
      if (Capacitor.getPlatform() !== 'web') {
        const unread = data.filter((n: any) => !n.isRead);
        unread.forEach((n: any) => {
          if (!shownNotificationIds.current.has(n.id)) {
            LocalNotifications.schedule({
              notifications: [{
                title: 'Afro Arab',
                body: n.message,
                id: n.id,
                schedule: { at: new Date(Date.now() + 1000) },
                extra: { type: n.type },
                smallIcon: 'ic_stat_name',
              }]
            });
            shownNotificationIds.current.add(n.id);
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark_all_as_read/', {});
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await api.post('/notifications/clear_all/', {});
      fetchNotifications();
    } catch (err) {
      console.error('Failed to clear notifications', err);
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setActiveScreen(AppScreen.Dashboard);
  };

  const handleLogout = () => {
    setUser(null);
    api.setToken(null);
    setActiveScreen(AppScreen.Dashboard);
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
    switch (activeScreen) {
      case AppScreen.Dashboard: return <Dashboard user={user} />;
      case AppScreen.Suppliers: return <Suppliers user={user} />;
      case AppScreen.Buyers: return <Buyers user={user} />;
      case AppScreen.Orders: return <Orders user={user} />;
      case AppScreen.Reports: return <Reports user={user} />;
      case AppScreen.Agents: return <Agents user={user} />;
      case AppScreen.Profile: return <Profile user={user} onLogout={handleLogout} notifications={notifications} fetchNotifications={fetchNotifications} markAllAsRead={markAllAsRead} clearAllNotifications={clearAllNotifications} />;
      case AppScreen.Notifications: return <NotificationsScreen user={user} notifications={notifications} fetchNotifications={fetchNotifications} markAllAsRead={markAllAsRead} clearAllNotifications={clearAllNotifications} />;
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <div className="h-[100dvh] bg-slate-50 flex flex-col overflow-hidden">
      <Header
        user={user}
        onLogout={handleLogout}
        unreadCount={notifications.filter(n => !n.isRead).length}
        onMarkAllRead={markAllAsRead}
        onNotificationClick={() => setActiveScreen(AppScreen.Notifications)}
      />

      <main className="flex-1 overflow-y-auto p-4 w-full max-w-lg mx-auto pb-32">
        {renderScreen()}
      </main>

      <BottomNav
        activeScreen={activeScreen}
        setActiveScreen={(s) => { setActiveScreen(s); }}
        userRole={user.role}
      />
    </div>
  );
};

export default App;
