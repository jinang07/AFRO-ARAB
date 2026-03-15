
import React from 'react';
import { api } from '../services/api';
import { User, Notification } from '../types';

interface NotificationsProps {
    user: User;
    notifications: Notification[];
    fetchNotifications: () => void;
    markAllAsRead: () => void;
    clearAllNotifications: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({
    user,
    notifications,
    fetchNotifications,
    markAllAsRead,
    clearAllNotifications
}) => {
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const sortedNotifications = [...notifications].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center relative">
                            <i className="fa-solid fa-bell"></i>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Notifications</h3>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Real-time Pulse Feed</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[9px] font-black text-[#224194] uppercase tracking-widest bg-blue-50 px-3 py-2 rounded-xl active:scale-95 transition-all"
                            >
                                Mark all as read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={clearAllNotifications}
                                className="text-[9px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-2 rounded-xl active:scale-95 transition-all"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>
                <div className="min-h-[60vh] overflow-y-auto no-scrollbar">
                    {sortedNotifications.length > 0 ? (
                        sortedNotifications.map(n => (
                            <div key={n.id} className={`p-4 border-b border-slate-50 flex gap-4 items-start ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'SUCCESS' ? 'bg-emerald-500' :
                                        n.type === 'WARNING' ? 'bg-amber-500' : 'bg-[#224194]'
                                    }`}></div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-700 font-bold leading-relaxed">{n.message}</p>
                                    <p className="text-[8px] font-black text-slate-400 uppercase mt-1 tracking-tighter">
                                        {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}
                                    </p>
                                </div>
                                {!n.isRead && (
                                    <div className="w-1.5 h-1.5 bg-[#224194] rounded-full mt-1.5"></div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="py-24 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-bell-slash text-slate-200 text-2xl"></i>
                            </div>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Active Alerts</p>
                            <p className="text-[9px] text-slate-400 mt-1">You're all caught up!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
