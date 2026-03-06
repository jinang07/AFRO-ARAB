
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
import { api } from './services/api';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeScreen, setActiveScreen] = useState<AppScreen>(AppScreen.Dashboard);
  const [isInitializing, setIsInitializing] = useState(true);

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const userData = await api.get('/users/me/');
          setUser(userData);
          fetchNotifications();
          initPush();
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

    // Request notification permissions
    LocalNotifications.requestPermissions();

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

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

      // Check for new unread notifications
      const unreadCount = data.filter((n: any) => !n.isRead).length;
      const prevUnreadCount = notifications.filter((n: any) => !n.isRead).length;

      if (unreadCount > prevUnreadCount) {
        const newest = data.find((n: any) => !n.isRead);
        if (newest) {
          await LocalNotifications.schedule({
            notifications: [
              {
                title: 'New Notification',
                body: newest.message,
                id: Math.floor(Math.random() * 10000),
                schedule: { at: new Date(Date.now() + 1000) },
                sound: 'default'
              }
            ]
          });
        }
      }

      setNotifications(data);
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

  const initPush = async () => {
    if (Capacitor.getPlatform() === 'web') return;

    try {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.warn('Push notification permission denied');
        return;
      }

      await PushNotifications.register();

      PushNotifications.addListener('registration', async (data) => {
        try {
          await api.post('/fcm-tokens/', { token: data.value });
          console.log('FCM token registered successfully');
        } catch (err) {
          console.error('Failed to register FCM token', err);
        }
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Push registration error: ', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ', notification);
        fetchNotifications();
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('Push action performed: ', action);
        setActiveScreen(AppScreen.Dashboard);
      });

    } catch (e) {
      console.error('Error initializing push notifications', e);
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setActiveScreen(AppScreen.Dashboard);
    setTimeout(initPush, 500);
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
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <div className="h-[100dvh] bg-slate-50 flex flex-col overflow-hidden">
      <Header
        user={user}
        onLogout={handleLogout}
        unreadCount={notifications.filter(n => !n.is_read).length}
        onMarkAllRead={markAllAsRead}
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
