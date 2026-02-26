import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

const Agents: React.FC<{ user: User }> = ({ user }) => {
  const [agents, setAgents] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    region: '',
    country: '',
    phoneNumber: ''
  });

  useEffect(() => {
    if (user.role === 'ADMIN') {
      fetchAgents();
    }
  }, [user]);

  const fetchAgents = async () => {
    try {
      const data = await api.get('/users/');
      setAgents(data.filter((u: User) => u.role === 'AGENT'));
    } catch (err) {
      console.error('Failed to fetch agents', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
          <i className="fa-solid fa-shield-halved text-2xl"></i>
        </div>
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Access Restricted</h3>
        <p className="text-sm text-slate-500 mt-2 font-medium">Only administrators can manage the regional agent fleet.</p>
      </div>
    );
  }

  const toggleRevealPassword = (id: number) => {
    setRevealedPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openAddModal = () => {
    setEditingAgent(null);
    setFormData({ username: '', email: '', password: '', region: '', country: '', phoneNumber: '' });
    setShowPassword(true);
    setIsModalOpen(true);
  };

  const openEditModal = (a: User) => {
    setEditingAgent(a);
    setFormData({
      username: a.username,
      email: a.email || '',
      password: '',
      region: a.region || '',
      country: a.country || '',
      phoneNumber: a.phoneNumber || ''
    });
    setShowPassword(true);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        username: formData.username,
        email: formData.email,
        region: formData.region,
        country: formData.country,
        phoneNumber: formData.phoneNumber,
        role: 'AGENT' as Role
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingAgent) {
        await api.put(`/users/${editingAgent.id}/`, payload);
      } else {
        await api.post('/users/', payload);
      }
      fetchAgents();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save agent. Check if username already exists.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Permanently deactivate and remove this agent\'s access?')) {
      try {
        await api.delete(`/users/${id}/`);
        fetchAgents();
      } catch (err) {
        alert('Failed to delete agent');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#224194]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Agent Fleet</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Personnel Management</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#224194] text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-[#224194]/30 active:scale-90 transition-all"
        >
          <i className="fa-solid fa-user-plus"></i>
        </button>
      </div>

      <div className="bg-slate-900 p-5 rounded-[2.5rem] text-white flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Active Workforce</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black">{agents.length}</span>
            <span className="text-xs text-slate-400 font-bold">Regional Agents</span>
          </div>
        </div>
        <i className="fa-solid fa-earth-africa text-6xl text-white/5 absolute -right-2 -bottom-2 rotate-12"></i>
      </div>

      <div className="space-y-4">
        {agents.map(agent => (
          <div key={agent.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-4 group hover:border-blue-200 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 font-black text-lg uppercase shadow-sm">
                    {agent.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white bg-emerald-500"></div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-none mb-1.5">{agent.username}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-slate-100 text-slate-500 font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">{agent.email || 'No email'}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{agent.region || 'No region'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-1.5">
                <button onClick={() => openEditModal(agent)} className="w-9 h-9 rounded-xl bg-blue-50 text-[#224194] hover:bg-[#224194] hover:text-white flex items-center justify-center transition-all group-hover:shadow-md">
                  <i className="fa-solid fa-pen-nib text-xs"></i>
                </button>
                <button onClick={() => handleDelete(agent.id)} className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all group-hover:shadow-md">
                  <i className="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
            </div>

            {/* Admin Credential Oversight Row */}
            <div className="bg-slate-50 rounded-2xl p-3 flex items-center justify-between border border-slate-100">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-key text-[10px] text-slate-400"></i>
                <div className="font-mono text-[10px] text-slate-600 font-bold">
                  {revealedPasswords[agent.id] ? '(Hidden by hashing)' : '••••••••••••'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleRevealPassword(agent.id)}
                  className="text-[#224194] text-[10px] font-black uppercase tracking-widest px-2"
                >
                  {revealedPasswords[agent.id] ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`User: ${agent.username}`);
                    alert('Username copied to clipboard');
                  }}
                  className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-[#224194] flex items-center justify-center transition-colors"
                >
                  <i className="fa-solid fa-copy text-[8px]"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-12 duration-500">
            <div className="p-8 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    {editingAgent ? 'Credential Manager' : 'Agent Onboarding'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Regional Access Control</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-colors">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 gap-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Username</label>
                      <input
                        required
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] px-4 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#224194] focus:bg-white outline-none transition-all shadow-sm"
                        placeholder="s_adjetey"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] px-4 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#224194] focus:bg-white outline-none transition-all shadow-sm"
                        placeholder="agent@domain.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Access Password {editingAgent && '(Leave blank to keep)'}</label>
                    <div className="relative">
                      <input
                        required={!editingAgent}
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] px-4 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#224194] focus:bg-white outline-none transition-all shadow-sm"
                        placeholder="Password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#224194]"
                      >
                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Assigned Region</label>
                      <input
                        value={formData.region}
                        onChange={e => setFormData({ ...formData, region: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] px-4 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#224194] focus:bg-white outline-none transition-all shadow-sm"
                        placeholder="West Africa"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Country</label>
                      <input
                        value={formData.country}
                        onChange={e => setFormData({ ...formData, country: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] px-4 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#224194] focus:bg-white outline-none transition-all shadow-sm"
                        placeholder="Ghana"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Phone Number</label>
                    <input
                      value={formData.phoneNumber}
                      onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] px-4 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#224194] focus:bg-white outline-none transition-all shadow-sm"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-5 bg-[#224194] text-white rounded-[1.5rem] font-black uppercase tracking-[0.15em] text-xs shadow-xl shadow-[#224194]/30 active:scale-95 transition-all mt-6 flex items-center justify-center gap-3">
                  <i className={`fa-solid ${editingAgent ? 'fa-user-check' : 'fa-user-plus'}`}></i>
                  {editingAgent ? 'Confirm Changes' : 'Create Agent Account'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;
