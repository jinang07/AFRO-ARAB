import React, { useState, useEffect } from 'react';
import { User, Supplier } from '../types';
import { api } from '../services/api';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  notifications: any[];
  fetchNotifications: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, notifications, fetchNotifications }) => {
  const initials = user.username ? user.username.substring(0, 2).toUpperCase() : user.name.substring(0, 2).toUpperCase();
  const isSupplier = user.role === 'SUPPLIER';
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(isSupplier);
  const [isNotifLoading, setIsNotifLoading] = useState(false);

  // Business Data for Supplier
  const [businessData, setBusinessData] = useState({
    companyName: user.name || user.username,
    personalName: '',
    designation: '',
    mobileNumber: '',
    telephoneNumber: '',
    email: user.email || '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    country: '',
    website: '',
    businessCategory: '',
    iecCode: '',
    gstNumber: '',
    panNumber: '',
    turnover2y: '',
    brochureFile: ''
  });

  useEffect(() => {
    if (isSupplier) {
      fetchSupplierProfile();
    }
  }, [user]);

  const fetchSupplierProfile = async () => {
    try {
      const data = await api.get('/suppliers/');
      if (data && data.length > 0) {
        const profile = data[0];
        setSupplierId(profile.id);
        setBusinessData({
          companyName: profile.company_name || profile.companyName || user.name,
          personalName: profile.personal_name || profile.personalName || '',
          designation: profile.designation || '',
          mobileNumber: profile.mobile_number || profile.mobileNumber || '',
          telephoneNumber: profile.telephone_number || profile.telephoneNumber || '',
          email: profile.email || user.email || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          pinCode: profile.pin_code || profile.pinCode || '',
          country: profile.country || '',
          website: profile.website || '',
          businessCategory: profile.business_category || profile.businessCategory || '',
          iecCode: profile.iec_code || profile.iecCode || '',
          gstNumber: profile.gst_number || profile.gstNumber || '',
          panNumber: profile.pan_number || profile.panNumber || '',
          turnover2y: profile.turnover_2y || profile.turnover2y || '',
          brochureFile: profile.brochure_file || profile.brochureFile || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch supplier profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await api.post('/notifications/mark_all_as_read/', {});
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  const handleUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (supplierId) {
        await api.put(`/suppliers/${supplierId}/`, businessData);
      } else {
        await api.post('/suppliers/', { ...businessData, user: user.id });
      }
      alert('Business profile updated! Our compliance team will review these changes shortly.');
      setIsEditModalOpen(false);
      fetchSupplierProfile();
    } catch (err) {
      console.error(err);
      alert('Failed to update business profile.');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
        {isSupplier && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{user.status || 'APPROVED'}</span>
          </div>
        )}

        <div className="relative mb-4">
          <div className="w-24 h-24 bg-[#224194] rounded-[2.5rem] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-[#224194]/20 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            {initials}
          </div>
          <div className="absolute bottom-[-5px] right-[-5px] w-8 h-8 bg-emerald-500 border-4 border-white rounded-full"></div>
        </div>

        <h2 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight">{user.name || user.username}</h2>
        <p className="text-slate-500 text-sm font-medium mb-4">{user.email}</p>

        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-[#224194]/10 text-[#224194] border-blue-200'
          }`}>
          {user.role} ACCESS
        </div>
      </div>

      {/* Real-time Notifications Center */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center relative">
              <i className="fa-solid fa-bell"></i>
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">{unreadCount}</span>}
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Notifications</h3>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Real-time Pulse Feed</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAsRead} className="text-[9px] font-black text-[#224194] uppercase tracking-widest bg-blue-50 px-3 py-2 rounded-xl">Clear All</button>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto no-scrollbar">
          {notifications.length > 0 ? (
            notifications.map(n => (
              <div key={n.id} className={`p-4 border-b border-slate-50 flex gap-4 items-start ${!n.is_read ? 'bg-blue-50/30' : ''}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'SUCCESS' ? 'bg-emerald-500' : n.type === 'WARNING' ? 'bg-amber-500' : 'bg-[#224194]'}`}></div>
                <div>
                  <p className="text-xs text-slate-700 font-bold leading-relaxed">{n.message}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase mt-1 tracking-tighter">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <i className="fa-solid fa-bell-slash text-slate-100 text-3xl mb-2"></i>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">No Active Alerts</p>
            </div>
          )}
        </div>
      </div>

      {isSupplier && (
        <div className="bg-[#224194] p-8 rounded-[3rem] text-white shadow-xl shadow-[#224194]/20 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-blue-100">My Business Profile</h3>
              <p className="text-[9px] font-bold text-blue-200 mt-0.5">Corporate Master Record (17 Fields)</p>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              disabled={isLoading}
              className="bg-white text-[#224194] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-md disabled:bg-slate-200 disabled:text-slate-400"
            >
              {isLoading ? 'Loading...' : 'Update Data'}
            </button>
          </div>
          {!isLoading && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                <p className="text-[8px] font-black uppercase text-blue-200 mb-1">IEC Code</p>
                <p className="text-xs font-black">{businessData.iecCode || 'NOT SET'}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                <p className="text-[8px] font-black uppercase text-blue-200 mb-1">PAN Number</p>
                <p className="text-xs font-black">{businessData.panNumber || 'NOT SET'}</p>
              </div>
              <div className="col-span-2 bg-white/10 p-4 rounded-2xl border border-white/20 flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-black uppercase text-blue-200 mb-1">Turnover (2Y Avg)</p>
                  <p className="text-xs font-black">{businessData.turnover2y || 'NOT SET'}</p>
                </div>
                <i className="fa-solid fa-chart-line text-blue-200/50"></i>
              </div>
            </div>
          )}
        </div>
      )}


      <div className="px-4 pt-4 pb-12">
        <button
          onClick={onLogout}
          className="w-full py-5 rounded-[2rem] bg-white border-2 border-rose-100 text-rose-600 font-black uppercase tracking-widest text-[11px] hover:bg-rose-50 transition-all flex items-center justify-center gap-3 shadow-lg shadow-rose-600/5 active:scale-95"
        >
          <i className="fa-solid fa-power-off"></i>
          Secure Sign Out
        </button>
      </div>

      {/* Supplier Profile Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-12">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Enterprise Master Update</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Regulatory Integrity Registry</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              <form onSubmit={handleUpdateBusiness} className="space-y-6 max-h-[65vh] overflow-y-auto no-scrollbar pr-2 pb-6">
                {/* Section: Contacts */}
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-[#224194] uppercase tracking-[0.2em] block border-b border-[#224194]/10 pb-2">1. Leadership Contacts</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Personal Name</label>
                      <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold" value={businessData.personalName} onChange={e => setBusinessData({ ...businessData, personalName: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Designation</label>
                      <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold" value={businessData.designation} onChange={e => setBusinessData({ ...businessData, designation: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Mobile</label>
                      <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold" value={businessData.mobileNumber} onChange={e => setBusinessData({ ...businessData, mobileNumber: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Work Email</label>
                      <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold" value={businessData.email} onChange={e => setBusinessData({ ...businessData, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Company Name</label>
                      <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold" value={businessData.companyName} onChange={e => setBusinessData({ ...businessData, companyName: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Section: Regulatory */}
                <div className="space-y-4 pt-2">
                  <label className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] block border-b border-emerald-50 pb-2">2. Compliance & Financials</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">IEC CODE</label>
                      <input className="w-full bg-emerald-50/30 border border-emerald-100 rounded-2xl px-4 py-3 text-sm font-black" value={businessData.iecCode} onChange={e => setBusinessData({ ...businessData, iecCode: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">PAN NUMBER</label>
                      <input className="w-full bg-emerald-50/30 border border-emerald-100 rounded-2xl px-4 py-3 text-sm font-black" value={businessData.panNumber} onChange={e => setBusinessData({ ...businessData, panNumber: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Annual Turnover (2Y Avg)</label>
                      <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold" value={businessData.turnover2y} onChange={e => setBusinessData({ ...businessData, turnover2y: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Section: Documentation */}
                <div className="space-y-4 pt-2">
                  <label className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] block border-b border-indigo-50 pb-2">3. Corporate Assets</label>
                  <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Brochure URL (PDF)</label>
                    <input className="w-full bg-indigo-50/30 border border-indigo-100 rounded-2xl px-4 py-3 text-xs font-bold" value={businessData.brochureFile} onChange={e => setBusinessData({ ...businessData, brochureFile: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <label className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] block border-b border-indigo-50 pb-2">Location Information</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Country</label>
                      <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold" value={businessData.country} onChange={e => setBusinessData({ ...businessData, country: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">City</label>
                      <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold" value={businessData.city} onChange={e => setBusinessData({ ...businessData, city: e.target.value })} />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full py-5 bg-[#224194] text-white rounded-[2rem] font-black uppercase tracking-[0.15em] text-xs shadow-xl shadow-[#224194]/100/30 active:scale-95 transition-all mt-6">
                  Submit for Verification
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
