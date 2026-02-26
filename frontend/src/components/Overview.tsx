
import React from 'react';

const Overview: React.FC = () => {
  const roadmapItems = [
    {
      phase: 'Phase 1: Foundation (Architectural Core)',
      status: 'Completed',
      items: [
        'Multi-Tenant Identity Architecture (Admin/Agent/Supplier)',
        'Django REST Framework (DRF) Endpoint Blueprint',
        'PostgreSQL Relational Schema with ACID Integrity',
        'SimpleJWT Auth Flow with Token Blacklisting'
      ],
      color: 'bg-emerald-500'
    },
    {
      phase: 'Phase 2: Security & Market (Current)',
      status: 'Active Deployment',
      items: [
        'Identity Masking Logic (Supplier Circumvention Protection)',
        '12-Stage Order Fulfillment Pipeline State Machine',
        'Supplier Self-Management Portal (17-Field Master Record)',
        'Masked Market Demand Search for Verified Suppliers'
      ],
      color: 'bg-blue-500'
    },
    {
      phase: 'Phase 3: Automation & Settlement',
      status: 'Q3 2024 Schedule',
      items: [
        'Automated PDF Invoice & Bill of Lading Generation',
        'Regional Agent Performance Tracking & Leaderboards',
        'Push Notification Service for Order Status Transitions',
        'Commission Ledger & Financial Settlement Automation'
      ],
      color: 'bg-indigo-500'
    },
    {
      phase: 'Phase 4: Scaling & Intelligence',
      status: 'Q4 2024 Vision',
      items: [
        'Real-time Multi-Currency Settlement Hub',
        'AI-Driven Regional Demand Forecasting',
        'Dubai/African Port Logistics API Integrations',
        'Advanced Regional Audit Hub for Transparency'
      ],
      color: 'bg-slate-800'
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="mb-10">
        <h2 className="text-4xl font-black text-slate-900 leading-none uppercase tracking-tighter mb-4">
          Project <span className="text-blue-600">Blueprint</span>
        </h2>
        <div className="h-1.5 w-24 bg-blue-600 rounded-full mb-6"></div>
        <p className="text-lg text-slate-600 leading-relaxed max-w-2xl font-medium">
          The AFRO ARAB platform is a mission-critical B2B bridge connecting Indian supply networks with African enterprise demand. 
          Built on a hardened <strong>Django + Flutter</strong> stack.
        </p>
      </div>

      {/* COMPLETED ARCHITECTURE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl shadow-slate-900/20">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
            <i className="fa-solid fa-shield-halved text-xl"></i>
          </div>
          <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">Security Protocol</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Our <strong>Identity Masking</strong> engine ensures Suppliers cannot bypass the platform. 
            Buyer contact details are cryptographically hidden until the MOU is signed.
          </p>
          <div className="flex gap-2">
            <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase text-blue-300 border border-white/10">JWT Auth</span>
            <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase text-blue-300 border border-white/10">Masking</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
            <i className="fa-solid fa-network-wired text-xl"></i>
          </div>
          <h3 className="text-xl font-bold mb-4 text-slate-900 uppercase tracking-tight">Supply Logic</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            The 12-stage fulfillment pipeline tracks every handshake from Quotation to Commission, 
            providing regional Agents with full oversight of cross-border trade.
          </p>
          <div className="flex gap-2">
            <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black uppercase text-slate-600">DRF State Machine</span>
            <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black uppercase text-slate-600">Multi-Role</span>
          </div>
        </div>
      </div>

      {/* DETAILED ROADMAP */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-10 px-2">
          <div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Technical Roadmap</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Platform Evolution & Milestones</p>
          </div>
        </div>

        <div className="space-y-8 relative ml-4">
          <div className="absolute left-[-16px] top-4 bottom-4 w-0.5 bg-slate-100"></div>
          {roadmapItems.map((phase, idx) => (
            <div key={idx} className="relative group">
              <div className={`absolute left-[-22px] top-6 w-3 h-3 rounded-full ring-4 ring-white transition-all duration-500 group-hover:scale-125 ${phase.color} shadow-lg shadow-blue-500/20`}></div>
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm group-hover:border-blue-200 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">{phase.phase}</h4>
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border ${
                    phase.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse'
                  }`}>
                    {phase.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {phase.items.map(item => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="mt-1 w-4 h-4 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                        <i className={`fa-solid fa-check text-[8px] ${phase.status === 'Completed' ? 'text-emerald-500' : 'text-blue-500 opacity-30'}`}></i>
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 leading-tight">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TECH STACK VISUALIZATION */}
      <div className="bg-blue-600 p-10 rounded-[4rem] text-white shadow-2xl shadow-blue-600/30 overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
             <div className="w-1.5 h-8 bg-blue-300 rounded-full"></div>
             <h3 className="text-2xl font-black uppercase tracking-tight italic">Production Stack</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: 'Frontend', tech: 'Flutter 3.x', desc: 'Single-base Native' },
              { label: 'Backend', tech: 'Django 4.2', desc: 'Robust DRF Core' },
              { label: 'Database', tech: 'PostgreSQL', desc: 'ACID Transactions' },
              { label: 'Caching', tech: 'Redis', desc: 'State Management' }
            ].map(s => (
              <div key={s.tech} className="space-y-1">
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">{s.label}</p>
                <p className="text-md font-black">{s.tech}</p>
                <p className="text-[9px] text-blue-100 font-medium opacity-60 uppercase">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <i className="fa-solid fa-microchip text-white/5 text-[15rem] absolute -bottom-20 -right-20"></i>
      </div>
    </div>
  );
};

export default Overview;
