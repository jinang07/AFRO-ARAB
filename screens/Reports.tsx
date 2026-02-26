import React, { useEffect, useState } from 'react';
import { User, Order } from '../types';
import { api } from '../services/api';

const Reports: React.FC<{ user: User }> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user.role === 'ADMIN') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [oData, uData] = await Promise.all([
        api.get('/orders/'),
        api.get('/users/')
      ]);
      setOrders(oData);
      setAgents(uData.filter((u: any) => u.role === 'AGENT'));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (user.role !== 'ADMIN') return (
    <div className="p-8 text-center text-rose-500 font-bold uppercase tracking-widest text-xs">
      Unauthorized Access
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#224194]"></div>
      </div>
    );
  }

  // 1. Pipeline Status
  const activeOrders = orders.filter(o =>
    !['DELIVERED', 'ORDER_COMPLETED', 'CANCELLED'].includes(o.status)
  ).length;

  const completedOrders = orders.filter(o =>
    ['DELIVERED', 'ORDER_COMPLETED'].includes(o.status)
  ).length;

  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;
  const totalProcessed = completedOrders + cancelledOrders;
  const conversionRate = totalProcessed > 0 ? ((completedOrders / totalProcessed) * 100).toFixed(1) : '0.0';

  // 2. Agent Leaderboard
  const agentPerformance = agents.map(agent => {
    const agentOrders = orders.filter(o => o.assignedAgent === agent.id);
    const volume = agentOrders.reduce((sum, o) => sum + parseFloat(o.amount || '0'), 0);
    return {
      name: agent.username || 'Unknown',
      orders: agentOrders.length,
      volume: `₹${(volume / 1000).toFixed(1)}k`,
      growth: agentOrders.length > 0 ? '+5%' : '0%', // Mocked growth
      color: 'bg-[#224194]'
    };
  }).sort((a, b) => b.orders - a.orders).slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Intelligence Hub</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time Platform Analytics</p>
      </div>

      {/* 1. Global Order Status Distribution */}
      <section className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <i className="fa-solid fa-diagram-predecessor text-[#224194]"></i>
          Order Pipeline Status
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-3xl border border-blue-100">
            <p className="text-[9px] font-black text-[#224194] uppercase tracking-widest mb-1">Active / Pending</p>
            <div className="text-2xl font-black text-blue-900">{activeOrders}</div>
            <p className="text-[8px] text-blue-400 mt-1 font-bold italic">Processing & Quoted</p>
          </div>
          <div className="p-4 bg-[#2e9782]/10 rounded-3xl border border-emerald-100">
            <p className="text-[9px] font-black text-[#2e9782] uppercase tracking-widest mb-1">Completed</p>
            <div className="text-2xl font-black text-emerald-900">{completedOrders}</div>
            <p className="text-[8px] text-emerald-400 mt-1 font-bold italic">Delivered Successfully</p>
          </div>
          <div className="p-4 bg-rose-50 rounded-3xl border border-rose-100">
            <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">Cancelled</p>
            <div className="text-2xl font-black text-rose-900">{cancelledOrders}</div>
            <p className="text-[8px] text-rose-400 mt-1 font-bold italic">Failed or Disputed</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Conversion Rate</p>
            <div className="text-2xl font-black text-slate-900">{conversionRate}%</div>
            <p className="text-[8px] text-slate-400 mt-1 font-bold italic">Order confirmation ratio</p>
          </div>
        </div>
      </section>

      {/* 2. Agent Performance Leaderboard */}
      <section className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-trophy text-amber-500"></i>
            Agent Leaderboard
          </div>
          <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-1 rounded-lg uppercase tracking-widest font-black">All Time</span>
        </h3>
        <div className="space-y-4">
          {agentPerformance.length > 0 ? agentPerformance.map((agent, idx) => (
            <div key={agent.name + idx} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl ${agent.color} text-white flex items-center justify-center text-[10px] font-black uppercase`}>
                  {agent.name.substring(0, 2)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{agent.name}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{agent.orders} Orders Handled</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-900">{agent.volume}</p>
                <p className={`text-[9px] font-bold ${agent.growth.startsWith('+') ? 'text-[#2e9782]/100' : 'text-rose-500'}`}>{agent.growth}</p>
              </div>
            </div>
          )) : (
            <p className="text-xs text-slate-400 font-bold italic">No active agents to display.</p>
          )}
        </div>
      </section>

      {/* 3. Regional Volume Analytics */}
      <section className="bg-slate-900 p-8 rounded-[3rem] text-white overflow-hidden relative shadow-2xl shadow-blue-900/20">
        <div className="relative z-10">
          <h3 className="font-bold text-white mb-6 flex items-center gap-2">
            <i className="fa-solid fa-earth-africa text-blue-400"></i>
            Geographical Market Share
          </h3>
          <div className="space-y-6">
            {[
              { label: 'West Africa (ECOWAS)', percentage: 45, color: 'bg-[#224194]', count: '1,204 Deals' },
              { label: 'East Africa (EAC)', percentage: 30, color: 'bg-indigo-400', count: '842 Deals' },
              { label: 'Central Africa (CEMAC)', percentage: 15, color: 'bg-slate-600', count: '312 Deals' },
              { label: 'Indo-Arab Corridor', percentage: 10, color: 'bg-slate-700', count: '198 Deals' }
            ].map(r => (
              <div key={r.label}>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{r.label}</span>
                    <p className="text-[9px] text-slate-500 font-bold">{r.count}</p>
                  </div>
                  <span className="text-sm font-black text-blue-400">{r.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`${r.color} h-full transition-all duration-1000`} style={{ width: `${r.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <i className="fa-solid fa-chart-pie text-white/5 text-9xl absolute -bottom-10 -right-10 rotate-12"></i>
      </section>

      {/* 4. Export Suite */}
      <div className="grid grid-cols-1 gap-3">
        <button className="w-full py-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between px-6 group active:scale-[0.98] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#224194] flex items-center justify-center">
              <i className="fa-solid fa-file-pdf"></i>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900">Regional Performance PDF</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Ready for export</p>
            </div>
          </div>
          <i className="fa-solid fa-chevron-right text-slate-300 text-[10px] group-hover:translate-x-1 transition-transform"></i>
        </button>
      </div>
    </div>
  );
};

export default Reports;
