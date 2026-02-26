
import React from 'react';
import { AppScreen, Role } from '../types';

interface BottomNavProps {
  activeScreen: AppScreen;
  setActiveScreen: (screen: AppScreen) => void;
  userRole: Role;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen, userRole }) => {
  const adminItems = [
    { id: AppScreen.Dashboard, label: 'Home', icon: 'fa-house' },
    { id: AppScreen.Buyers, label: 'Buyers', icon: 'fa-users' },
    { id: AppScreen.Suppliers, label: 'Vendors', icon: 'fa-box' },
    { id: AppScreen.Orders, label: 'Orders', icon: 'fa-file-invoice' },
    { id: AppScreen.Agents, label: 'Agents', icon: 'fa-user-tie' },
    { id: AppScreen.Profile, label: 'Profile', icon: 'fa-user' }
  ];

  const agentItems = [
    { id: AppScreen.Dashboard, label: 'Home', icon: 'fa-house' },
    { id: AppScreen.Buyers, label: 'Buyers', icon: 'fa-users' },
    { id: AppScreen.Suppliers, label: 'Vendors', icon: 'fa-box' },
    { id: AppScreen.Orders, label: 'Orders', icon: 'fa-file-invoice' },
    { id: AppScreen.Profile, label: 'Profile', icon: 'fa-user' }
  ];

  const supplierItems = [
    { id: AppScreen.Dashboard, label: 'Home', icon: 'fa-house' },
    { id: AppScreen.Buyers, label: 'Market', icon: 'fa-magnifying-glass-chart' },
    { id: AppScreen.Orders, label: 'My Orders', icon: 'fa-file-invoice' },
    { id: AppScreen.Profile, label: 'Profile', icon: 'fa-user' }
  ];

  const getNavItems = () => {
    if (userRole === 'ADMIN') return adminItems;
    if (userRole === 'SUPPLIER') return supplierItems;
    return agentItems;
  };

  const navItems = getNavItems();
  const isHighDensity = navItems.length > 5;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-1 py-3 z-[100] flex justify-around items-center safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveScreen(item.id)}
          className={`flex flex-col items-center gap-1 transition-all active:scale-95 touch-manipulation ${isHighDensity ? 'min-w-[44px]' : 'min-w-[64px]'
            } ${activeScreen === item.id ? 'text-[#224194]' : 'text-slate-400'
            }`}
        >
          <div className={`flex items-center justify-center rounded-xl transition-all relative ${isHighDensity ? 'w-9 h-8' : 'w-12 h-10'
            } ${activeScreen === item.id ? 'bg-[#224194]/10' : 'bg-transparent'
            }`}>
            <i className={`fa-solid ${item.icon} ${isHighDensity ? 'text-sm' : 'text-lg'}`}></i>
          </div>
          <span className={`${isHighDensity ? 'text-[7px]' : 'text-[9px]'} font-black uppercase tracking-tight`}>
            {item.label}
          </span>
          {activeScreen === item.id && (
            <div className="w-1 h-1 bg-[#224194] rounded-full mt-0.5"></div>
          )}
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
