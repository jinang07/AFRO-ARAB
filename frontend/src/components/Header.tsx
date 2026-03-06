
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  unreadCount?: number;
  onMarkAllRead?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, unreadCount = 0, onMarkAllRead }) => {
  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="bg-white w-10 h-10 rounded-xl shadow-sm border border-slate-50 flex items-center justify-center relative p-1.5 overflow-visible">
          <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-contain rounded-lg" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="hidden xs:block">
          <h1 className="text-sm font-bold text-slate-900 leading-none uppercase tracking-tight">AFRO ARAB</h1>
          <span className="text-[10px] text-slate-500 font-medium">B2B Platform</span>
        </div>
      </div>

      {unreadCount > 0 && onMarkAllRead && (
        <button
          onClick={onMarkAllRead}
          className="bg-blue-50 text-[#224194] px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-100 active:scale-95 transition-all whitespace-nowrap"
        >
          Mark all as read
        </button>
      )}

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs font-bold text-slate-900">
            {(user.firstName || user.name || user.username).split(' ')[0]}
          </p>
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase border ${user.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-[#224194]/10 text-[#224194] border-[#224194]/20'
            }`}>
            {user.role}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <i className="fa-solid fa-right-from-bracket text-xs"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
