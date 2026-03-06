
import React, { useState } from 'react';
import { User, Supplier, AccountStatus } from '../types';
import { Browser } from '@capacitor/browser';

const INITIAL_PENDING: Supplier[] = [
  {
    id: 'REG-101',
    name: 'Mumbai Textile Hub',
    companyName: 'Mumbai Textile Hub',
    personalName: 'Sanjay Varma',
    designation: 'Managing Director',
    mobile: '+91 999 888 7777',
    email: 'sanjay@mumbaitextile.in',
    address: 'Plot 42, GIDC Industrial Estate',
    city: 'Mumbai',
    state: 'Maharashtra',
    pinCode: '400001',
    country: 'India',
    category: 'Textiles',
    iecCode: 'IEC445566',
    panNumber: 'ABCDE1234F',
    turnover: '₹1.2M',
    status: 'PENDING',
    products: []
  },
  {
    id: 'REG-102',
    name: 'Delhi Agrotech',
    companyName: 'Delhi Agrotech',
    personalName: 'Anjali Sharma',
    designation: 'CEO',
    mobile: '+91 900 111 2222',
    email: 'info@delhiagro.com',
    address: '12-B, Nehru Place',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110019',
    country: 'India',
    category: 'Agricultural Machinery',
    iecCode: 'IEC998877',
    panNumber: 'FGHIJ5678K',
    turnover: '₹800k',
    status: 'PENDING',
    products: []
  }
];

const Registrations: React.FC<{ user: User }> = ({ user }) => {
  const [pendingList, setPendingList] = useState<Supplier[]>(INITIAL_PENDING);
  const [selectedReg, setSelectedReg] = useState<Supplier | null>(null);

  const handleDecision = (id: string, newStatus: AccountStatus) => {
    if (confirm(`Are you sure you want to ${newStatus.toLowerCase()} this registration?`)) {
      setPendingList(pendingList.filter(p => p.id !== id));
      setSelectedReg(null);
      alert(`Supplier has been ${newStatus === 'APPROVED' ? 'approved and added to the supplier fleet' : 'rejected'}.`);
    }
  };

  if (user.role !== 'ADMIN') return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Branding Header */}
      <div className="flex flex-col items-center mb-10">
        <div className="bg-white p-2 rounded-2xl shadow-sm flex items-center justify-center mb-3 w-20 h-20 border border-slate-50">
          <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-black text-[#224194] tracking-tight">AFRO ARAB</h1>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">B2B Platform</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Onboarding Queue</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Supplier Verification Desk</p>
        </div>
        <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          {pendingList.length} Pending
        </div>
      </div>

      <div className="space-y-4">
        {pendingList.length > 0 ? (
          pendingList.map(reg => (
            <div
              key={reg.id}
              onClick={() => setSelectedReg(reg)}
              className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-blue-200 cursor-pointer transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <i className="fa-solid fa-building-circle-check text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{reg.name}</h3>
                    <p className="text-[10px] text-slate-400 font-medium">{reg.city}, {reg.country}</p>
                  </div>
                </div>
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-widest">New App</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="text-[10px] text-slate-500">
                  <span className="font-bold text-slate-700">{reg.personalName}</span> • {reg.designation}
                </div>
                <i className="fa-solid fa-chevron-right text-[10px] text-slate-300"></i>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
              <i className="fa-solid fa-clipboard-check text-3xl"></i>
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Queue Clear</p>
          </div>
        )}
      </div>

      {selectedReg && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Vetting Application</h3>
                <button onClick={() => setSelectedReg(null)} className="p-2 text-slate-400 hover:text-slate-900">
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto no-scrollbar pr-1 space-y-6">
                <section>
                  <label className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3 block">Corporate Profile</label>
                  <div className="bg-slate-50 p-4 rounded-3xl grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Company</p>
                      <p className="text-xs font-bold text-slate-900">{selectedReg.companyName || selectedReg.name}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Category</p>
                      <p className="text-xs font-bold text-slate-900">{selectedReg.businessCategory || selectedReg.category}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Address</p>
                      <p className="text-xs font-bold text-slate-900 leading-relaxed">{selectedReg.address}, {selectedReg.city}, {selectedReg.state}, {selectedReg.pinCode}, {selectedReg.country}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Website</p>
                      <p className="text-xs font-bold text-blue-600 truncate">{selectedReg.website || 'N/A'}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <label className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3 block">Primary Contact</label>
                  <div className="bg-slate-50 p-4 rounded-3xl grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Name</p>
                      <p className="text-xs font-bold text-slate-900">{selectedReg.personalName}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Designation</p>
                      <p className="text-xs font-bold text-slate-900">{selectedReg.designation}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Mobile</p>
                      <p className="text-xs font-bold text-slate-900">{selectedReg.mobileNumber || selectedReg.mobile}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Email</p>
                      <p className="text-xs font-bold text-slate-900">{selectedReg.email}</p>
                    </div>
                    {selectedReg.telephoneNumber && (
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Telephone</p>
                        <p className="text-xs font-bold text-slate-900">{selectedReg.telephoneNumber}</p>
                      </div>
                    )}
                    {selectedReg.associatePartner && (
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Associate Partner</p>
                        <p className="text-xs font-black text-indigo-600">{selectedReg.associatePartner}</p>
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <label className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3 block">Regulatory & Financial Check</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                      <p className="text-[8px] font-black text-emerald-700 uppercase mb-1">IEC CODE</p>
                      <p className="text-[11px] font-mono font-black">{selectedReg.iecCode}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                      <p className="text-[8px] font-black text-emerald-700 uppercase mb-1">PAN NUMBER</p>
                      <p className="text-[11px] font-mono font-black">{selectedReg.panNumber}</p>
                    </div>
                    {selectedReg.gstNumber && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                        <p className="text-[8px] font-black text-emerald-700 uppercase mb-1">GST NUMBER</p>
                        <p className="text-[11px] font-mono font-black">{selectedReg.gstNumber}</p>
                      </div>
                    )}
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                      <p className="text-[8px] font-black text-emerald-700 uppercase mb-1">2Y AVG TURNOVER</p>
                      <p className="text-xs font-black text-slate-900">{selectedReg.turnover2y || selectedReg.turnover}</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl col-span-2">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Products Available</p>
                      <p className="text-xs font-bold text-slate-900 leading-relaxed">{selectedReg.productAvailable || "None listed"}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <label className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3 block">4. Attached Documents</label>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-6 bg-indigo-50/30 rounded-[2rem] border border-indigo-100/50">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Company Brochure</p>
                      {selectedReg.brochureFile ? (
                        <button
                          onClick={async () => {
                            if (selectedReg.brochureFile) {
                              await Browser.open({ url: selectedReg.brochureFile });
                            }
                          }}
                          className="inline-flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all"
                        >
                          <i className="fa-solid fa-file-pdf text-sm"></i>
                          View PDF
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-100 text-slate-400 rounded-full font-black uppercase tracking-widest text-[10px]">
                          <i className="fa-solid fa-file-pdf text-sm"></i>
                          No PDF
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => handleDecision(selectedReg.id, 'REJECTED')}
                  className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black uppercase tracking-widest text-xs border border-rose-100 active:scale-95 transition-all"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleDecision(selectedReg.id, 'APPROVED')}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  Approve Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registrations;
