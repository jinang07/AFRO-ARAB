import React, { useState, useEffect } from 'react';
import { User, Supplier, AccountStatus } from '../types';
import { api } from '../services/api';
import { Browser } from '@capacitor/browser';
import ConfirmationModal from '../components/ConfirmationModal';

interface SupplierFormData {
  companyName: string;
  personalName: string;
  designation: string;
  mobileNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  website: string;
  businessCategory: string;
  iecCode: string;
  gstNumber: string;
  panNumber: string;
  turnover2y: string;
  productAvailable: string;
  password?: string;
  telephoneNumber: string;
  associatePartner: string;
}

const Suppliers: React.FC<{ user: User }> = ({ user }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pendingSuppliers, setPendingSuppliers] = useState<Supplier[]>([]);
  const [currentTab, setCurrentTab] = useState<'Active' | 'Pending'>('Active');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; supplierId: string | null }>({
    isOpen: false,
    supplierId: null
  });
  const [vettingConfirmation, setVettingConfirmation] = useState<{ isOpen: boolean; supplierId: string | null; decision: AccountStatus | null }>({
    isOpen: false,
    supplierId: null,
    decision: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [partners, setPartners] = useState<User[]>([]);

  const initialFormData: SupplierFormData = {
    companyName: '',
    personalName: '',
    designation: '',
    mobileNumber: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    website: '',
    businessCategory: '',
    iecCode: '',
    gstNumber: '',
    panNumber: '',
    turnover2y: '',
    productAvailable: '',
    password: '',
    telephoneNumber: '',
    associatePartner: ''
  };

  const [formData, setFormData] = useState<SupplierFormData>(initialFormData);

  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);

  const isAdmin = user.role === 'ADMIN';
  const isAgent = user.role === 'AGENT';
  const isSupplier = user.role === 'SUPPLIER';
  const isPartner = user.role === 'PARTNER';
  const canManage = isAdmin || isAgent;

  useEffect(() => {
    fetchSuppliers();
    if (isAdmin) fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const data = await api.get('/users/');
      setPartners(data.filter((u: User) => u.role === 'PARTNER'));
    } catch (err) {
      console.error('Failed to fetch partners', err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await api.get('/suppliers/');
      setSuppliers(data.filter((s: Supplier) => s.status === 'APPROVED'));
      setPendingSuppliers(data.filter((s: Supplier) => s.status === 'PENDING'));
    } catch (err) {
      console.error('Failed to fetch suppliers', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = new FormData();

      // Explicit mapping to match backend expectations exactly
      const mapping: Record<string, any> = {
        company_name: formData.companyName,
        personal_name: formData.personalName,
        designation: formData.designation,
        mobile_number: formData.mobileNumber,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pin_code: formData.pinCode,
        country: formData.country,
        website: formData.website,
        business_category: formData.businessCategory,
        iec_code: formData.iecCode,
        gst_number: formData.gstNumber,
        pan_number: formData.panNumber,
        turnover_2y: formData.turnover2y,
        product_available: formData.productAvailable,
        telephone_number: formData.telephoneNumber,
        associate_partner: formData.associatePartner
      };

      if (formData.password) mapping.password = formData.password;

      Object.entries(mapping).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          submitData.append(key, value as string);
        }
      });

      if (brochureFile) submitData.append('brochure_file', brochureFile);
      if (paymentScreenshot) submitData.append('payment_screenshot', paymentScreenshot);

      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier.id}/`, submitData);
      } else {
        submitData.append('status', 'APPROVED');
        await api.post('/suppliers/', submitData);
      }
      fetchSuppliers();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save supplier:', err);
      alert('Failed to save supplier');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/suppliers/${id}/`);
      fetchSuppliers();
      setDeleteConfirmation({ isOpen: false, supplierId: null });
    } catch (err) {
      alert('Failed to delete supplier');
    }
  };

  const handleVettingDecision = async (id: string, newStatus: AccountStatus) => {
    try {
      await api.patch(`/suppliers/${id}/`, { status: newStatus });
      fetchSuppliers();
      setVettingConfirmation({ isOpen: false, supplierId: null, decision: null });
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filtered = suppliers.filter(s => {
    const displayName = isAgent ? 'Verified Supplier' : (s.companyName || s.name || '');
    const productList = s.productAvailable || (s as any).product_available || '';
    return displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.country || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      productList.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredPending = pendingSuppliers.filter(s => {
    const displayName = s.companyName || (s as any).name || '';
    const productList = s.productAvailable || (s as any).product_available || '';
    return displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.country || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      productList.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#224194]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Supply Network</h2>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingSupplier(null);
              setFormData(initialFormData);
              setBrochureFile(null);
              setPaymentScreenshot(null);
              setIsModalOpen(true);
            }}
            className="bg-[#224194] text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-[#224194]/30 active:scale-90 transition-all"
          >
            <i className="fa-solid fa-plus"></i>
          </button>
        )}
      </div>

      <div className="relative">
        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <input
          type="text"
          placeholder="Search by company, country or products..."
          className="w-full pl-12 pr-4 py-4 bg-white rounded-3xl border border-slate-100 shadow-sm focus:ring-2 focus:ring-[#224194] outline-none transition-all text-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {(isAdmin || isAgent) && (
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setCurrentTab('Active')}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentTab === 'Active' ? 'bg-white text-[#224194] shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Supplier Fleet ({suppliers.length})
          </button>
          {isAdmin && (
            <button
              onClick={() => setCurrentTab('Pending')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${currentTab === 'Pending' ? 'bg-white text-[#224194] shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Pending Approval ({pendingSuppliers.length})
              {pendingSuppliers.length > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>}
            </button>
          )}
        </div>
      )}

      {currentTab === 'Active' ? (
        <div className="space-y-6">
          <div className="space-y-4">
            {filtered.map(supplier => (
              <div
                key={supplier.id}
                onClick={() => { setViewingSupplier(supplier); setIsDetailOpen(true); }}
                className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:border-blue-200 cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">
                      {isAgent ? 'Verified Supplier' : (supplier.companyName || (supplier as any).company_name)}
                    </h3>
                    <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                      <i className="fa-solid fa-location-dot"></i> {supplier.city}, {supplier.country}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(isAdmin || (isSupplier && supplier.id === user.id)) && (
                      <>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          setEditingSupplier(supplier);
                          setFormData({
                            companyName: supplier.companyName || (supplier as any).company_name || '',
                            personalName: supplier.personalName || (supplier as any).personal_name || '',
                            designation: supplier.designation || '',
                            mobileNumber: supplier.mobileNumber || (supplier as any).mobile_number || '',
                            email: supplier.email || '',
                            address: supplier.address || '',
                            city: supplier.city || '',
                            state: supplier.state || '',
                            pinCode: supplier.pinCode || (supplier as any).pin_code || '',
                            country: supplier.country || '',
                            website: supplier.website || '',
                            businessCategory: supplier.businessCategory || (supplier as any).business_category || '',
                            iecCode: supplier.iecCode || (supplier as any).iec_code || '',
                            gstNumber: supplier.gstNumber || (supplier as any).gst_number || '',
                            panNumber: supplier.panNumber || (supplier as any).pan_number || '',
                            turnover2y: supplier.turnover2y || (supplier as any).turnover_2y || '',
                            productAvailable: supplier.productAvailable || (supplier as any).product_available || '',
                            telephoneNumber: supplier.telephoneNumber || (supplier as any).telephone_number || '',
                            password: '',
                            associatePartner: supplier.associatePartner || (supplier as any).associate_partner || ''
                          });
                          setIsModalOpen(true);
                        }} className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-[#224194] flex items-center justify-center">
                          <i className="fa-solid fa-pen text-[10px]"></i>
                        </button>
                        {isAdmin && (
                          <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmation({ isOpen: true, supplierId: supplier.id }); }} className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 flex items-center justify-center">
                            <i className="fa-solid fa-trash text-[10px]"></i>
                          </button>
                        )}
                      </>
                    )}
                    <div className="bg-blue-50 text-[#224194] px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ml-1">Verified</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4 min-h-[1.5rem]">
                  {(supplier.productAvailable || (supplier as any).product_available || '').split(',').filter((p: string) => p.trim()).map((p: string, idx: number) => (
                    <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold">
                      {p.trim()}
                    </span>
                  ))}
                  {(!supplier.productAvailable && !(supplier as any).product_available && supplier.products) && supplier.products.map((p: any) => (
                    <span key={p} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold">
                      {p}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold">
                      {(supplier.personalName || 'S').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="text-[11px]">
                      <p className="font-bold text-slate-900 leading-none">{isAgent ? 'Verified Representative' : (supplier.personalName || 'Contact Person')}</p>
                      <p className="text-slate-500 mt-1">{isAgent ? '+91 XXXXX XXXXX' : (supplier.mobileNumber || 'N/A')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {canManage && supplier.mobileNumber !== "+91 XXXXX XXXXX" && (
                      <a href={`tel:${supplier.mobileNumber}`} onClick={(e) => e.stopPropagation()} className="text-[#224194] w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center active:scale-90 transition-all">
                        <i className="fa-solid fa-phone text-xs"></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPending.map(reg => (
            <div
              key={reg.id}
              onClick={() => { setViewingSupplier(reg); setIsDetailOpen(true); }}
              className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-amber-200 transition-all animate-in slide-in-from-right-4 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <i className="fa-solid fa-building-circle-check text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{reg.companyName}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{reg.city}, {reg.country}</p>
                  </div>
                </div>
                <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-xl uppercase tracking-widest border border-amber-100">Pending Approval</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); setVettingConfirmation({ isOpen: true, supplierId: reg.id, decision: 'REJECTED' }); }} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase">Reject</button>
                  <button onClick={(e) => { e.stopPropagation(); setVettingConfirmation({ isOpen: true, supplierId: reg.id, decision: 'APPROVED' }); }} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase">Approve</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isDetailOpen && viewingSupplier && (
        <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                    {isAgent ? 'Verified Supplier' : viewingSupplier.name}
                  </h3>
                  <p className="text-[10px] text-[#224194] font-black uppercase tracking-widest mt-1 italic">Full Master Record Profile</p>
                </div>
                <button onClick={() => setIsDetailOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 hover:text-slate-900 flex items-center justify-center">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto no-scrollbar pr-2 space-y-8 pb-6">
                <section className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">1. Identity & Presence</label>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Company Name</p>
                    <p className="text-xs font-bold text-slate-900">{isAgent ? 'Verified Supplier' : viewingSupplier.companyName}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Category</p>
                    <p className="text-xs font-bold text-slate-900">{viewingSupplier.businessCategory || 'N/A'}</p>
                  </div>
                  {!isAgent && (
                    <>
                      <div className="col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">HQ Address</p>
                        <p className="text-xs font-bold text-slate-900 leading-relaxed">
                          {viewingSupplier.address}, {viewingSupplier.city}, {viewingSupplier.state}, {viewingSupplier.pinCode}, {viewingSupplier.country}
                        </p>
                      </div>
                      <div className="col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Website</p>
                        {viewingSupplier.website ? (
                          <a href={viewingSupplier.website.startsWith('http') ? viewingSupplier.website : `https://${viewingSupplier.website}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:text-blue-800 underline">
                            {viewingSupplier.website}
                          </a>
                        ) : (
                          <p className="text-xs font-bold text-slate-400">Not Provided</p>
                        )}
                      </div>
                    </>
                  )}
                </section>

                {!isAgent && (
                  <section className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2 block">2. Executive Contact</label>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Primary POC</p>
                      <p className="text-xs font-bold text-slate-900">{isAgent ? 'Verified Representative' : viewingSupplier.personalName}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Designation</p>
                      <p className="text-xs font-bold text-slate-900">{viewingSupplier.designation}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Mobile</p>
                      <p className="text-xs font-bold text-slate-900">{isAgent ? '+91 XXXXX XXXXX' : viewingSupplier.mobileNumber}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Professional Email</p>
                      <p className="text-xs font-bold text-slate-900">{isAgent ? 'XXXXX@verified.com' : viewingSupplier.email}</p>
                    </div>
                    {viewingSupplier.telephoneNumber && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Telephone</p>
                        <p className="text-xs font-bold text-slate-900">{viewingSupplier.telephoneNumber}</p>
                      </div>
                    )}
                    {isAdmin && viewingSupplier.associatePartner && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Associate Partner</p>
                        <p className="text-xs font-black text-indigo-600">{viewingSupplier.associatePartner}</p>
                      </div>
                    )}
                  </section>
                )}

                <section className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2 block">3. Products & Portfolio</label>
                  </div>
                  {!isAgent && (
                    <>
                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                        <p className="text-[8px] font-black text-emerald-700 uppercase mb-1">IEC CODE</p>
                        <p className="text-xs font-black text-slate-900">{viewingSupplier.iecCode}</p>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                        <p className="text-[8px] font-black text-emerald-700 uppercase mb-1">PAN NUMBER</p>
                        <p className="text-xs font-black text-slate-900">{viewingSupplier.panNumber}</p>
                      </div>
                      {viewingSupplier.gstNumber && (
                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 col-span-2">
                          <p className="text-[8px] font-black text-emerald-700 uppercase mb-1">GST NUMBER</p>
                          <p className="text-xs font-black text-slate-900">{viewingSupplier.gstNumber}</p>
                        </div>
                      )}
                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 col-span-2">
                        <p className="text-[8px] font-black text-emerald-700 uppercase mb-1">2-YEAR AVERAGE TURNOVER</p>
                        <p className="text-sm font-black text-slate-900">{viewingSupplier.turnover2y}</p>
                      </div>
                    </>
                  )}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 col-span-2">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Products Available</p>
                    <p className="text-xs font-bold text-slate-900 leading-relaxed">{viewingSupplier.productAvailable || 'None listed'}</p>
                  </div>
                </section>



                <section className="mt-6">
                  <label className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3 block">4. Attached Documents</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 flex flex-col justify-between items-start">
                      <p className="text-[9px] font-black text-indigo-700 uppercase mb-4 tracking-wider">Company Brochure</p>
                      {viewingSupplier.brochureFile ? (
                        <button
                          onClick={async () => {
                            const url = api.getMediaUrl(viewingSupplier.brochureFile);
                            if (url) await Browser.open({ url });
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 text-[10px] font-black uppercase text-white bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl transition-all shadow-sm"
                        >
                          <i className="fa-solid fa-file-pdf"></i> View PDF
                        </button>
                      ) : (
                        <p className="text-xs font-bold text-slate-400 py-2">Not Provided</p>
                      )}
                    </div>
                    <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 flex flex-col justify-between items-start">
                      <p className="text-[9px] font-black text-emerald-700 uppercase mb-4 tracking-wider">Payment Receipt</p>
                      {(viewingSupplier as any).payment_screenshot || (viewingSupplier as any).paymentScreenshot ? (
                        <button
                          onClick={async () => {
                            const path = (viewingSupplier as any).payment_screenshot || (viewingSupplier as any).paymentScreenshot;
                            const url = api.getMediaUrl(path);
                            if (url) await Browser.open({ url });
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 text-[10px] font-black uppercase text-white bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl transition-all shadow-sm"
                        >
                          <i className="fa-solid fa-image"></i> View Receipt
                        </button>
                      ) : (
                        <p className="text-xs font-bold text-slate-400 py-2">Not Provided</p>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (isAdmin || isSupplier) && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    {editingSupplier ? 'Master Record: Update' : 'Master Record: New Supplier'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Central Intelligence Registry</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar pr-2 pb-4">
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-[#224194] uppercase tracking-[0.2em] block border-b border-blue-50 pb-2">1. Corporate Identity</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Company Name</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#224194]" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Business Category</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#224194]" value={formData.businessCategory} onChange={e => setFormData({ ...formData, businessCategory: e.target.value })} placeholder="e.g. Textiles" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <label className="text-[9px] font-black text-[#224194] uppercase tracking-[0.2em] block border-b border-blue-50 pb-2">2. Executive Contact</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Personal Name</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#224194]" value={formData.personalName} onChange={e => setFormData({ ...formData, personalName: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Designation</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#224194]" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Mobile Number</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#224194]" value={formData.mobileNumber} onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Email</label>
                      <input required type="email" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#224194]" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Telephone Number (Optional)</label>
                      <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#224194]" value={formData.telephoneNumber} onChange={e => setFormData({ ...formData, telephoneNumber: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Website (Optional)</label>
                      <input type="url" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#224194]" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} placeholder="https://..." />
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="space-y-4 pt-2">
                    <label className="text-[9px] font-black text-[#224194] uppercase tracking-[0.2em] block border-b border-blue-50 pb-2">3. Administrative Alignment</label>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Associate Partner (Optional)</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#224194]"
                        value={formData.associatePartner}
                        onChange={e => setFormData({ ...formData, associatePartner: e.target.value })}
                      >
                        <option value="">Unassigned / Direct</option>
                        {partners.map(partner => (
                          <option key={partner.id} value={partner.username}>
                            {partner.firstName || partner.name || partner.username} ({partner.region || 'Global'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <label className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] block border-b border-emerald-50 pb-2">4. Regulatory & Financials</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">IEC Code (Optional)</label>
                      <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600" value={formData.iecCode} onChange={e => setFormData({ ...formData, iecCode: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">PAN Number (Optional)</label>
                      <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600" value={formData.panNumber} onChange={e => setFormData({ ...formData, panNumber: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Last 2 Year Turnover (Optional)</label>
                      <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600" value={formData.turnover2y} onChange={e => setFormData({ ...formData, turnover2y: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Products Available (Optional)</label>
                      <textarea className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600 h-24 resize-none" value={formData.productAvailable} onChange={e => setFormData({ ...formData, productAvailable: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Account Password {editingSupplier && "(Leave blank to keep current)"}</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder={editingSupplier ? "Enter new password" : "Enter password"} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-all">
                          <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <label className="text-[9px] font-black text-[#224194] uppercase tracking-[0.2em] block border-b border-blue-50 pb-2">4. Location Information</label>
                  <div className="col-span-2">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Company Address</label>
                    <textarea required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold h-20 resize-none outline-none focus:ring-2 focus:ring-[#224194]" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Country</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#224194]" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">State</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#224194]" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">City</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#224194]" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Pin Code</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#224194]" value={formData.pinCode} onChange={e => setFormData({ ...formData, pinCode: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <label className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] block border-b border-indigo-50 pb-2">5. Documents</label>
                  <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-indigo-800 uppercase tracking-widest block mb-1">Company Brochure (Required PDF)</label>
                      <input type="file" required={!editingSupplier} accept=".pdf" className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs text-slate-600 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-indigo-100 file:text-indigo-800 hover:file:bg-indigo-200 transition-all cursor-pointer" onChange={e => setBrochureFile(e.target.files ? e.target.files[0] : null)} />
                      {editingSupplier && <p className="text-[9px] text-slate-400 font-bold mt-1">Leave blank to keep existing file.</p>}
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block mb-1">Payment Screenshot (Required Image)</label>
                      <input type="file" required={!editingSupplier} accept="image/*" className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs text-slate-600 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 transition-all cursor-pointer" onChange={e => setPaymentScreenshot(e.target.files ? e.target.files[0] : null)} />
                      {editingSupplier && <p className="text-[9px] text-slate-400 font-bold mt-1">Leave blank to keep existing file.</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <label className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] block border-b border-indigo-50 pb-2">6. Record Finalization</label>
                  <p className="text-[10px] text-slate-400 font-bold italic">By committing this record, you authorize its inclusion in the master registry and, if applicable, the creation of a secure agent login portal.</p>
                </div>

                <button type="submit" className="w-full py-5 bg-[#224194] text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-[#224194]/20 active:scale-95 transition-all mt-6">
                  Authorize & Commit Record
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        title="Delete Supplier"
        message="Are you sure you want to permanently remove this supplier record? This action cannot be undone."
        confirmLabel="Delete Supplier"
        onConfirm={() => deleteConfirmation.supplierId && handleDelete(deleteConfirmation.supplierId)}
        onCancel={() => setDeleteConfirmation({ isOpen: false, supplierId: null })}
      />

      <ConfirmationModal
        isOpen={vettingConfirmation.isOpen}
        title={`${vettingConfirmation.decision === 'APPROVED' ? 'Approve' : 'Reject'} Supplier`}
        message={`Are you sure you want to ${vettingConfirmation.decision?.toLowerCase()} this supplier application?`}
        confirmLabel={vettingConfirmation.decision === 'APPROVED' ? 'Approve' : 'Reject'}
        type={vettingConfirmation.decision === 'APPROVED' ? 'info' : 'warning'}
        onConfirm={() => vettingConfirmation.supplierId && vettingConfirmation.decision && handleVettingDecision(vettingConfirmation.supplierId, vettingConfirmation.decision)}
        onCancel={() => setVettingConfirmation({ isOpen: false, supplierId: null, decision: null })}
      />
    </div>
  );
};

export default Suppliers;
