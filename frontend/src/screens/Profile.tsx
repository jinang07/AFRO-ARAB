import React, { useState, useEffect } from 'react';
import { User, Supplier } from '../types';
import { api } from '../services/api';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  notifications: any[];
  fetchNotifications: () => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, notifications, fetchNotifications, markAllAsRead, clearAllNotifications }) => {
  const initials = (user.firstName || user.name || user.username).substring(0, 2).toUpperCase();
  const isSupplier = user.role === 'SUPPLIER';
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(isSupplier);
  const [isNotifLoading, setIsNotifLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newBrochureFile, setNewBrochureFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Business Data for Supplier
  const [businessData, setBusinessData] = useState({
    companyName: user.name || user.username || '',
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
    productAvailable: '',
    brochureFile: '',
    password: '',
    associatePartner: ''
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
          productAvailable: profile.product_available || profile.productAvailable || '',
          brochureFile: profile.brochure_file || profile.brochureFile || '',
          password: '',
          associatePartner: profile.associate_partner || profile.associatePartner || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch supplier profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = new FormData();

      // 1. Prepare explicit mapping
      const mapping: Record<string, any> = {
        company_name: businessData.companyName,
        personal_name: businessData.personalName,
        designation: businessData.designation,
        mobile_number: businessData.mobileNumber,
        telephone_number: businessData.telephoneNumber,
        email: businessData.email,
        address: businessData.address,
        city: businessData.city,
        state: businessData.state,
        pin_code: businessData.pinCode,
        country: businessData.country,
        website: businessData.website,
        business_category: businessData.businessCategory,
        iec_code: businessData.iecCode,
        gst_number: businessData.gstNumber,
        pan_number: businessData.panNumber,
        turnover_2y: businessData.turnover2y,
        product_available: businessData.productAvailable,
        associate_partner: businessData.associatePartner
      };

      if (businessData.password) {
        mapping.password = businessData.password;
      }

      // 2. Append text fields
      Object.keys(mapping).forEach(key => {
        if (mapping[key] !== null && mapping[key] !== undefined && mapping[key] !== '') {
          submitData.append(key, mapping[key]);
        }
      });

      // 3. Append new brochure file if selected
      if (newBrochureFile) {
        submitData.append('brochure_file', newBrochureFile);
      }

      if (supplierId) {
        await api.put(`/suppliers/${supplierId}/`, submitData);
      } else {
        submitData.append('user', String(user.id));
        await api.post('/suppliers/', submitData);
      }
      alert('Business profile updated successfully!');
      setIsEditModalOpen(false);
      setNewBrochureFile(null);
      fetchSupplierProfile();
    } catch (err) {
      console.error(err);
      alert('Failed to update business profile.');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const sortedNotifications = [...notifications].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

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

        <h2 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight">{user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.name || user.username}</h2>
        <p className="text-slate-500 text-sm font-medium mb-4">{user.email}</p>

        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-[#224194]/10 text-[#224194] border-blue-200'
          }`}>
          {user.role} ACCESS
        </div>
      </div>

      {/* Profile Info Section */}


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
              <div className="col-span-2 bg-white/10 p-4 rounded-2xl border border-white/20">
                <p className="text-[8px] font-black uppercase text-blue-200 mb-1">Products Available</p>
                <p className="text-xs font-black leading-relaxed">{businessData.productAvailable || 'NOT SET'}</p>
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


      {user.role === 'ADMIN' && (
        <div className="bg-white p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#224194]">Security & Backup</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5">Protect your data assets locally</p>
          </div>
          <button
            onClick={async () => {
              try {
                // Now returns a proper Blob directly
                const blob = await api.exportBackup(); 
                
                const url = window.URL.createObjectURL(blob as Blob);
                const a = document.createElement('a');
                const date = new Date().toISOString().split('T')[0];
                a.href = url;
                a.download = `AFRO_ARAB_BACKUP_${date}.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                showToast('Backup ZIP downloaded successfully! Open CSVs with Excel.', 'success');
              } catch (err: any) {
                console.error(err);
                showToast('Failed to generate backup: ' + (err.message || 'Unknown error'), 'error');
              }
            }}
            className="w-full py-4 bg-[#224194]/5 text-[#224194] rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all border border-[#224194]/10 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-file-zipper"></i>
            Download Excel-Friendly (ZIP/CSV) Backup
          </button>
        </div>
      )}

      <div className="px-4 pt-4">
        <button
          onClick={onLogout}
          className="w-full py-5 rounded-[2rem] bg-white border-2 border-rose-100 text-rose-600 font-black uppercase tracking-widest text-[11px] hover:bg-rose-50 transition-all flex items-center justify-center gap-3 shadow-lg shadow-rose-600/5 active:scale-95"
        >
          <i className="fa-solid fa-power-off"></i>
          Secure Sign Out
        </button>
      </div>

      <div className="text-center pb-12 opacity-60">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Build by Jinang Jain</p>
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
                    <div className="col-span-2">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Products Available</label>
                      <textarea className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold h-24 resize-none" value={businessData.productAvailable} onChange={e => setBusinessData({ ...businessData, productAvailable: e.target.value })} />
                    </div>
                    <div className="col-span-2 relative">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Change Password (Leave blank to keep current)</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="New password" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold pr-12" value={businessData.password} onChange={e => setBusinessData({ ...businessData, password: e.target.value })} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#224194] transition-all">
                          <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Documentation */}
                <div className="space-y-4 pt-2">
                  <label className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] block border-b border-indigo-50 pb-2">3. Corporate Assets & Location</label>
                  <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Company Brochure (PDF)</label>
                    <input type="file" accept=".pdf" className="w-full bg-indigo-50/30 border border-indigo-100 rounded-2xl px-4 py-3 text-xs font-bold" onChange={e => setNewBrochureFile(e.target.files ? e.target.files[0] : null)} />
                    {businessData.brochureFile && <p className="text-[9px] text-[#224194] font-bold mt-1 tracking-tight">Current File: <span className="opacity-50">{String(businessData.brochureFile).split('/').pop()}</span></p>}
                  </div>

                  <div className="col-span-2">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Company Address</label>
                    <textarea required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold h-20 resize-none" value={businessData.address} onChange={e => setBusinessData({ ...businessData, address: e.target.value })} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Country</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold" value={businessData.country} onChange={e => setBusinessData({ ...businessData, country: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">State</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold" value={businessData.state} onChange={e => setBusinessData({ ...businessData, state: e.target.value })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">City</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold" value={businessData.city} onChange={e => setBusinessData({ ...businessData, city: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Pin Code</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold" value={businessData.pinCode} onChange={e => setBusinessData({ ...businessData, pinCode: e.target.value })} />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full py-5 bg-[#224194] text-white rounded-[2rem] font-black uppercase tracking-[0.15em] text-xs shadow-xl shadow-[#224194]/100/30 active:scale-95 transition-all mt-6">
                  Save All Changes
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toast.show && (
        <div 
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[999] w-[90%] max-w-sm"
          style={{ transition: 'all 0.3s ease-out' }}
        >
          <div className={`flex items-center gap-3 px-4 py-4 rounded-[1.5rem] shadow-2xl border backdrop-blur-md ${
            toast.type === 'success' 
              ? 'bg-emerald-500/95 text-white border-emerald-400/50' 
              : 'bg-rose-500/95 text-white border-rose-400/50'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              toast.type === 'success' ? 'bg-white/20' : 'bg-white/20'
            }`}>
              <i className={`fa-solid ${toast.type === 'success' ? 'fa-check' : 'fa-exclamation'} text-sm`}></i>
            </div>
            <p className="text-[11px] font-black uppercase tracking-wider flex-1 leading-tight">{toast.message}</p>
            <button onClick={() => setToast({ ...toast, show: false })} className="w-8 h-8 rounded-full hover:bg-white/10 transition-colors">
              <i className="fa-solid fa-xmark opacity-70"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
