import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';
import { Capacitor } from '@capacitor/core';

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const isPendingSupplier = user.role === 'SUPPLIER' && user.status === 'PENDING';

  const [stats, setStats] = useState({
    activePipeline: 0,
    pendingSync: 0,
    networkCount: 0,
    demandCount: 0,
    transitCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPendingSupplier) {
      fetchStats();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const [ordersRes, buyersRes, suppliersRes] = await Promise.all([
        api.get('/orders/'),
        api.get('/buyers/'),
        api.get('/suppliers/')
      ]);

      const activeOrders = ordersRes.filter((o: any) =>
        !['DELIVERED', 'ORDER_COMPLETED', 'CANCELLED'].includes(o.status)
      ).length;

      const transitOrders = ordersRes.filter((o: any) => o.status === 'SHIPPED').length;

      const pendingOrders = ordersRes.filter((o: any) =>
        ['QUOTATION_SENT', 'QUOTATION_APPROVED'].includes(o.status)
      ).length;

      setStats({
        activePipeline: activeOrders,
        pendingSync: pendingOrders,
        networkCount: suppliersRes.length,
        demandCount: buyersRes.length,
        transitCount: transitOrders,
      });

      setRecentOrders(ordersRes.slice(0, 5));

    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#224194] p-8 rounded-[3rem] text-white shadow-xl shadow-[#224194]/20 overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-1"> Hello, {(user.firstName || user.name || user.username).split(' ')[0]} 👋</h2>
          <p className="text-white/60 text-sm mb-8 font-medium italic">Global trade, localized intelligence.</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-[2rem] border border-white/20">
              <div className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">Active Pipeline</div>
              <div className="text-2xl font-black">{isPendingSupplier ? '0' : stats.activePipeline}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-[2rem] border border-white/20">
              <div className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">Pending Sync</div>
              <div className="text-2xl font-black">{isPendingSupplier ? '0' : stats.pendingSync}</div>
            </div>
          </div>
        </div>
        <i className="fa-solid fa-earth-africa text-white/5 text-9xl absolute -bottom-10 -right-10"></i>
      </div>


      {isPendingSupplier && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2.5rem] flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <i className="fa-solid fa-hourglass-half animate-spin-slow"></i>
          </div>
          <div>
            <h3 className="font-black text-rose-900 uppercase tracking-tight">Onboarding in Progress</h3>
            <p className="text-xs text-rose-600 font-bold mt-1 leading-relaxed">Your registration is currently being verified by our regional compliance team. Features will unlock upon approval.</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#224194]"></div></div>
      ) : (
        <section>
          <div className="flex items-center justify-between mb-5 px-2">
            <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Ecosystem Pulse</h3>
            <button className="text-[#f49022] text-[10px] font-black uppercase tracking-widest">Global View</button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Network', count: stats.networkCount, icon: 'fa-box', color: 'text-[#224194]', bg: 'bg-[#224194]/5' },
              { label: 'Demand', count: stats.demandCount, icon: 'fa-users', color: 'text-[#2e9782]', bg: 'bg-[#2e9782]/5' },
              { label: 'Transit', count: stats.transitCount, icon: 'fa-truck', color: 'text-[#f49022]', bg: 'bg-[#f49022]/5' }
            ].map((stat) => (
              <div key={stat.label} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center shadow-sm">
                <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-2xl flex items-center justify-center mb-3 shadow-inner`}>
                  <i className={`fa-solid ${stat.icon} text-xs`}></i>
                </div>
                <div className="text-xl font-black text-slate-900 leading-tight mb-1">{stat.count}</div>
                <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!isPendingSupplier && recentOrders.length > 0 && (
        <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          <div className="flex items-center justify-between mb-5 px-2">
            <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Recent Orders</h3>
            <button className="text-[#224194] text-[10px] font-black uppercase tracking-widest">See All</button>
          </div>

          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="bg-white p-4 rounded-[1.5rem] border border-slate-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    <i className="fa-solid fa-file-invoice text-xs"></i>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-none mb-1">Order #{order.id}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {new Date(order.createdAt || order.created_at).toLocaleDateString()} • {order.buyerName || 'Global Buyer'}
                    </p>
                  </div>
                </div>
                <div className={`text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${order.status === 'SHIPPED' ? 'bg-amber-50 text-amber-600' :
                  order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-slate-50 text-slate-400'
                  }`}>
                  {order.status.replace(/_/g, ' ')}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default Dashboard;

