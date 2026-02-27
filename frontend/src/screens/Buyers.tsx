
import React, { useState, useEffect } from 'react';
import { User, Buyer } from '../types';
import { api } from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';

const Buyers: React.FC<{ user: User }> = ({ user }) => {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [agents, setAgents] = useState<User[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; buyerId: string | null }>({
    isOpen: false,
    buyerId: null
  });

  const initialFormData: Partial<Buyer> = {
    name: '',
    companyName: '',
    designation: '',
    mobileNumber: '',
    country: '',
    businessActivities: '',
    productNeed: '',
    email: '',
    website: '',
    turnover2y: '',
    destinationPort: '',
    productSpecs: '',
    requiredQuantity: '',
    targetPrice: '',
    preferredIncoterms: '',
    paymentTerms: '',
    deliveryTimeline: '',
    mandatoryCertifications: '',
    assignedAgent: undefined
  };

  const [formData, setFormData] = useState<Partial<Buyer>>(initialFormData);

  const isSupplier = user.role === 'SUPPLIER';
  const isAdmin = user.role === 'ADMIN';
  const isAgent = user.role === 'AGENT';
  const isPartner = user.role === 'PARTNER';

  useEffect(() => {
    fetchBuyers();
    if (isAdmin) fetchAgents();
  }, []);

  const fetchBuyers = async () => {
    try {
      const data = await api.get('/buyers/');
      setBuyers(data);
    } catch (err) {
      console.error('Failed to fetch buyers', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const data = await api.get('/users/');
      setAgents(data.filter((u: User) => u.role === 'AGENT'));
    } catch (err) {
      console.error('Failed to fetch agents', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        deliveryTimeline: formData.deliveryTimeline || null
      };

      if (editingBuyer) {
        await api.put(`/buyers/${editingBuyer.id}/`, dataToSave);
      } else {
        await api.post('/buyers/', dataToSave);
      }
      fetchBuyers();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save buyer:', err);
      alert(`Failed to save buyer: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/buyers/${id}/`);
      setBuyers(buyers.filter(b => b.id !== id));
      setDeleteConfirmation({ isOpen: false, buyerId: null });
    } catch (err) {
      alert('Failed to delete buyer');
    }
  };

  const filtered = buyers.filter(b =>
    (b.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.country || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.businessActivities || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.productNeed || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.productSpecs || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2e9782]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            {isSupplier ? 'Market Demand' : 'Buyer Registry'}
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            {isSupplier ? 'Anonymized Buyer Intelligence' : isAgent ? `Lead Agent: ${user.username}` : 'International Master Registry'}
          </p>
        </div>
        {(isAdmin || isAgent) && (
          <button
            onClick={() => { setEditingBuyer(null); setFormData(initialFormData); setIsModalOpen(true); }}
            className="bg-[#2e9782] text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-[#2e9782]/30 active:scale-90 transition-transform"
          >
            <i className="fa-solid fa-plus"></i>
          </button>
        )}
      </div>

      <div className="relative">
        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <input
          type="text"
          placeholder={isSupplier ? "Search requirements..." : "Search by company or country..."}
          className="w-full pl-12 pr-4 py-4 bg-white rounded-3xl border border-slate-100 shadow-sm focus:ring-2 focus:ring-[#2e9782] outline-none transition-all text-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(buyer => (
          <div key={buyer.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-4 hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#2e9782] flex items-center justify-center text-xl font-black border border-emerald-100">
                  {isSupplier ? <i className="fa-solid fa-lock text-sm opacity-50"></i> : buyer.companyName[0]}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight flex items-center gap-2">
                    {isSupplier ? 'Verified Customer' : buyer.companyName}
                    {isAdmin && buyer.agentName && (
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold normal-case items-center gap-1 flex">
                        <i className="fa-solid fa-user-tie text-[8px]"></i>
                        {buyer.agentName}
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] bg-slate-900 text-white px-2 py-0.5 rounded uppercase font-black tracking-widest">{buyer.country}</span>
                    {isSupplier && (
                      <span className="text-[9px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase font-black tracking-widest flex items-center gap-1">
                        <i className="fa-solid fa-shield-halved text-[7px]"></i>
                        Identity Protected
                      </span>
                    )}
                    {!isSupplier && <span className="text-[10px] text-slate-400 font-bold uppercase">{buyer.name}</span>}
                  </div>
                </div>
              </div>
              {isAdmin || (isAgent && (buyer.createdBy === Number(user.id) || Number(buyer.assignedAgent) === Number(user.id))) ? (
                <div className="flex gap-2">
                  <button onClick={() => { setEditingBuyer(buyer); setFormData(buyer as any); setIsModalOpen(true); }} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                  </button>
                  <button onClick={() => setDeleteConfirmation({ isOpen: true, buyerId: buyer.id })} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-trash text-[10px]"></i>
                  </button>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Business Activity Profile</p>
                <p className="text-[11px] text-slate-700 font-bold leading-relaxed">{buyer.businessActivities}</p>
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <p className="text-[9px] font-black text-[#2e9782] uppercase tracking-widest mb-2 block">Market Sourcing Requirement</p>
                <p className="text-[11px] text-slate-800 font-black leading-relaxed italic">"{buyer.productNeed}"</p>
              </div>

              {/* Detailed Specifications for Suppliers and Associate Partners */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Destination Port</p>
                  <p className="text-[10px] font-bold text-slate-900">{buyer.destinationPort}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Required Quantity</p>
                  <p className="text-[10px] font-bold text-slate-900">{buyer.requiredQuantity}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Detailed Specifications</p>
                <p className="text-[11px] text-slate-700 font-bold leading-relaxed">{buyer.productSpecs}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Incoterms</p>
                  <p className="text-[10px] font-black text-[#2e9782] uppercase">{buyer.preferredIncoterms}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Delivery Timeline</p>
                  <p className="text-[10px] font-bold text-slate-900">{buyer.deliveryTimeline}</p>
                </div>
              </div>

              {buyer.targetPrice && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">Target Price</p>
                  <p className="text-[10px] font-black text-slate-900">{buyer.targetPrice}</p>
                </div>
              )}
            </div>

            {!isSupplier && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50 mt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">2Y Turnover</p>
                  <p className="text-[10px] font-black text-slate-900">{buyer.turnover2y}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Website</p>
                  <p className="text-[10px] font-bold text-blue-600 truncate">{buyer.website ? buyer.website.replace('https://', '') : 'Not provided'}</p>
                </div>
                <div className="col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Direct Communication Hub</p>
                    <p className="text-[10px] font-bold text-slate-900">{buyer.email} • {buyer.mobileNumber}</p>
                  </div>
                  <i className="fa-solid fa-paper-plane text-slate-300"></i>
                </div>
              </div>
            )}

            {isSupplier && (
              <div className="flex gap-2 mt-2">
                <button className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <i className="fa-solid fa-file-contract text-blue-400"></i>
                  Submit Official Quote
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (isAdmin || isAgent) && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    {editingBuyer ? 'Modify Profile' : 'Enterprise Setup'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Buyer Onboarding Gateway</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6 max-h-[65vh] overflow-y-auto no-scrollbar pr-1 pb-4">
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-[#2e9782] uppercase tracking-[0.2em] block border-b border-emerald-50 pb-2">1. Personal Identity</label>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Full Name</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#2e9782] outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Direct Mobile</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#2e9782] outline-none" value={formData.mobileNumber} onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Work Email</label>
                      <input required type="email" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#2e9782] outline-none" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <label className="text-[9px] font-black text-[#2e9782] uppercase tracking-[0.2em] block border-b border-emerald-50 pb-2">2. Corporate Presence</label>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Company Entity</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#2e9782] outline-none" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Region/Country</label>
                        <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#2e9782] outline-none" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Official Website (Optional)</label>
                        <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#2e9782] outline-none" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} placeholder="https://..." />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <label className="text-[9px] font-black text-[#2e9782] uppercase tracking-[0.2em] block border-b border-emerald-50 pb-2">3. Sourcing Metrics</label>
                  <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Business Profile</label>
                    <textarea required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold h-20 resize-none outline-none focus:ring-2 focus:ring-[#2e9782]" value={formData.businessActivities} onChange={e => setFormData({ ...formData, businessActivities: e.target.value })} placeholder="Describe key sectors..." />
                  </div>
                  <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Product or Project Requirement (Public)</label>
                    <textarea required className="w-full bg-emerald-50/30 border border-emerald-100 rounded-2xl px-4 py-3 text-sm font-black h-24 resize-none outline-none focus:ring-2 focus:ring-[#2e9782]" value={formData.productNeed} onChange={e => setFormData({ ...formData, productNeed: e.target.value })} placeholder="Explicit active supply requests..." />
                  </div>
                  <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">2Y Annual Turnover</label>
                    <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#2e9782] outline-none" value={formData.turnover2y} onChange={e => setFormData({ ...formData, turnover2y: e.target.value })} placeholder="e.g. $25M" />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <label className="text-[9px] font-black text-[#2e9782] uppercase tracking-[0.2em] block border-b border-emerald-50 pb-2">4. Technical Specifications</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Destination Port</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#2e9782] outline-none" value={formData.destinationPort} onChange={e => setFormData({ ...formData, destinationPort: e.target.value })} placeholder="e.g. Jebel Ali" />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Preferred Incoterms</label>
                      <select required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#2e9782] outline-none" value={formData.preferredIncoterms} onChange={e => setFormData({ ...formData, preferredIncoterms: e.target.value })}>
                        <option value="">Select...</option>
                        <option value="EXW">EXW</option>
                        <option value="FOB">FOB</option>
                        <option value="CIF">CIF</option>
                        <option value="DDP">DDP</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Required Quantity</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#2e9782] outline-none" value={formData.requiredQuantity} onChange={e => setFormData({ ...formData, requiredQuantity: e.target.value })} placeholder="e.g. 500 MT" />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Delivery Timeline</label>
                      <input required type="date" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#2e9782] outline-none" value={formData.deliveryTimeline} onChange={e => setFormData({ ...formData, deliveryTimeline: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Detailed Specifications (Grade, Size, Material)</label>
                    <textarea required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold h-24 resize-none outline-none focus:ring-2 focus:ring-[#2e9782]" value={formData.productSpecs} onChange={e => setFormData({ ...formData, productSpecs: e.target.value })} placeholder="Grade, size, quality standards..." />
                  </div>
                  <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Payment Terms</label>
                    <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#2e9782] outline-none" value={formData.paymentTerms} onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })} placeholder="e.g., 30% Advance, 70% against BL" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Target Price (Optional)</label>
                      <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#2e9782] outline-none" value={formData.targetPrice} onChange={e => setFormData({ ...formData, targetPrice: e.target.value })} placeholder="e.g. $450/Unit" />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Certifications (Optional)</label>
                      <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#2e9782] outline-none" value={formData.mandatoryCertifications} onChange={e => setFormData({ ...formData, mandatoryCertifications: e.target.value })} placeholder="ISO, CE, etc." />
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="space-y-4 pt-2">
                      <label className="text-[9px] font-black text-[#224194] uppercase tracking-[0.2em] block border-b border-blue-50 pb-2">5. Administrative Control</label>
                      <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Assign to Agent</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#224194] outline-none"
                          value={formData.assignedAgent}
                          onChange={e => setFormData({ ...formData, assignedAgent: e.target.value || undefined })}
                        >
                          <option value="">Unassigned</option>
                          {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.name || agent.username} ({agent.region})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full py-5 bg-[#2e9782] text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-[#2e9782]/20 active:scale-95 transition-all mt-6">
                  {editingBuyer ? 'Commit Changes' : 'Authorize Marketplace Listing'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        title="Delete Buyer"
        message="Are you sure you want to permanently remove this buyer from the system? This action cannot be undone."
        confirmLabel="Delete Buyer"
        onConfirm={() => deleteConfirmation.buyerId && handleDelete(deleteConfirmation.buyerId)}
        onCancel={() => setDeleteConfirmation({ isOpen: false, buyerId: null })}
      />
    </div>
  );
};

export default Buyers;
