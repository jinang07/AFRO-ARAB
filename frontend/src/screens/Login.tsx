
import React, { useState } from 'react';
import { Role, User } from '../types';
import { api } from '../services/api';

interface LoginProps {
  onLogin: (user: User) => void;
  initialRegistering?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, initialRegistering = false }) => {
  const [isRegistering, setIsRegistering] = useState(initialRegistering);
  const [isPartnerOnboarding, setIsPartnerOnboarding] = useState(false);
  const [selectionMode, setSelectionMode] = useState(!initialRegistering);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPartnerPassword, setShowPartnerPassword] = useState(false);
  const [showPartnerConfirmPassword, setShowPartnerConfirmPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regStep, setRegStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '', personalName: '', designation: '', mobileNumber: '',
    telephoneNumber: '', email: '', address: '', city: '', state: '',
    pinCode: '', country: '', website: '', businessCategory: '',
    iecCode: '', gstNumber: '', panNumber: '', turnover2y: '',
    productAvailable: '',
    accountName: 'Afro Arab Business Association', accountNumber: '50200111853466',
    branch: 'Ring Road - Surat', ifscCode: 'HDFC0000251',
    associatePartner: '', regPassword: ''
  });
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [partnerData, setPartnerData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login/', { username, password });
      if (response && response.access) {
        api.setToken(response.access);
        const userData = await api.get('/users/me/');
        onLogin(userData);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value && key !== 'accountName' && key !== 'accountNumber' && key !== 'branch' && key !== 'ifscCode' && key !== 'regPassword') {
          const snakeKey = key.replace(/([a-z])([A-Z0-9])/g, '$1_$2').toLowerCase();
          submitData.append(snakeKey, value);
        }
      });
      submitData.append('password', formData.regPassword);
      if (brochureFile) submitData.append('brochure_file', brochureFile);
      if (paymentScreenshot) submitData.append('payment_screenshot', paymentScreenshot);

      await api.post('/suppliers/register/', submitData);
      setShowSuccessModal(true);
      setIsRegistering(false);
      setSelectionMode(true);
      setRegStep(1);
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePartnerRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (partnerData.password !== partnerData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/users/register_partner/', partnerData);
      alert('Associate Partner registered successfully! You can now login.');
      setIsPartnerOnboarding(false);
      setSelectionMode(true);
    } catch (err: any) {
      alert(err.message || 'Partner registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setSelectionMode(false);
  };

  // --- Registration View ---
  if (isRegistering) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center p-6 pb-20 overflow-y-auto">
        <div className="w-full max-w-md">
          <button onClick={() => { setIsRegistering(false); setSelectionMode(true); }} className="mb-6 flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-[#224194] transition-colors">
            <i className="fa-solid fa-arrow-left"></i> Back to Gateway
          </button>

          <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-white/20 mb-8">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Supplier Onboarding</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium italic">Step {regStep} of 4 • Enterprise Verification</p>
              <div className="h-1.5 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-[#f49022] transition-all duration-500" style={{ width: `${(regStep / 4) * 100}%` }}></div>
              </div>
            </div>

            <form onSubmit={regStep === 4 ? handleRegisterSubmit : (e) => { e.preventDefault(); setRegStep(s => s + 1); }} className="space-y-4">
              {regStep === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                  <div className="group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Company Details</label>
                    <input required placeholder="Full Company Name" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#224194]/20 outline-none" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                  </div>
                  <input required placeholder="Personal Name" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#224194]/20 outline-none" value={formData.personalName} onChange={e => setFormData({ ...formData, personalName: e.target.value })} />
                  <input required placeholder="Designation" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#224194]/20 outline-none" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <input required placeholder="Mobile Number" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#224194]/20 outline-none" value={formData.mobileNumber} onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })} />
                    <input placeholder="Telephone (Optional)" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#224194]/20 outline-none" value={formData.telephoneNumber} onChange={e => setFormData({ ...formData, telephoneNumber: e.target.value })} />
                  </div>
                  <input required type="email" placeholder="Email Address" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#224194]/20 outline-none" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  <div>
                    <div className="relative">
                      <input required type={showRegPassword ? "text" : "password"} placeholder="Set Password (Login Credential)" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#224194]/20 outline-none" value={formData.regPassword} onChange={e => setFormData({ ...formData, regPassword: e.target.value })} />
                      <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all">
                        <i className={`fa-solid ${showRegPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-400 font-black ml-1 mt-1.5 uppercase tracking-widest opacity-60">Your mobile number and this password will be your login credentials</p>
                  </div>

                  <div className="pt-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Referral</label>
                    <input placeholder="Associate Partner Username (Optional)" className="w-full bg-indigo-50/50 border border-indigo-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-indigo-300 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" value={formData.associatePartner} onChange={e => setFormData({ ...formData, associatePartner: e.target.value })} />
                  </div>
                </div>
              )}

              {regStep === 2 && (
                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Location & Presence</label>
                  <textarea required placeholder="Company Address" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 h-20 resize-none focus:ring-2 focus:ring-[#224194]/20 outline-none" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <input required placeholder="City" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#224194]/20 outline-none" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                    <input required placeholder="State" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#224194]/20 outline-none" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input required placeholder="Pin Code" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#224194]/20 outline-none" value={formData.pinCode} onChange={e => setFormData({ ...formData, pinCode: e.target.value })} />
                    <input required placeholder="Country" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#224194]/20 outline-none" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                  </div>
                  <input placeholder="Website (Optional)" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#224194]/20 outline-none" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} />
                </div>
              )}

              {regStep === 3 && (
                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Regulatory & Financials</label>
                  <input required placeholder="Business Category" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#224194]/20 outline-none" value={formData.businessCategory} onChange={e => setFormData({ ...formData, businessCategory: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <input required placeholder="IEC Code" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#224194]/20 outline-none" value={formData.iecCode} onChange={e => setFormData({ ...formData, iecCode: e.target.value })} />
                    <input placeholder="GST (Optional)" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#224194]/20 outline-none" value={formData.gstNumber} onChange={e => setFormData({ ...formData, gstNumber: e.target.value })} />
                  </div>
                  <input required placeholder="PAN Number" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#224194]/20 outline-none" value={formData.panNumber} onChange={e => setFormData({ ...formData, panNumber: e.target.value })} />
                  <input required placeholder="Last 2 Year Turnover" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#224194]/20 outline-none" value={formData.turnover2y} onChange={e => setFormData({ ...formData, turnover2y: e.target.value })} />
                  <textarea required placeholder="Products Available (separate by comma)" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 h-24 resize-none focus:ring-2 focus:ring-[#224194]/20 outline-none" value={formData.productAvailable} onChange={e => setFormData({ ...formData, productAvailable: e.target.value })} />

                  <div className="pt-2">
                    <label className="text-[10px] font-black text-blue-800 uppercase tracking-widest block mb-1.5 ml-1">Company Brochure (Required PDF)</label>
                    <input required type="file" accept=".pdf" className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl px-4 py-3 text-xs text-slate-600 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 transition-all cursor-pointer" onChange={e => setBrochureFile(e.target.files ? e.target.files[0] : null)} />
                  </div>
                </div>
              )}

              {regStep === 4 && (
                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Payment & Verification</label>

                  <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#f49022]/10 blur-3xl -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <i className="fa-solid fa-building-columns text-lg text-[#f49022]"></i>
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Bank Details</span>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Name</p>
                          <p className="text-[11px] font-bold tracking-wide">AFRO ARAB BUSINESS ASSOCIATION</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Number</p>
                            <p className="text-[11px] font-bold tracking-wide">50200111853466</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Bank Name</p>
                            <p className="text-[11px] font-bold tracking-wide">HDFC BANK</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">IFSC Code</p>
                            <p className="text-[11px] font-bold tracking-wide">HDFC0000251</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Branch</p>
                            <p className="text-[11px] font-bold tracking-wide">RING ROAD - SURAT</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-[10px] font-black text-[#2e9782] uppercase tracking-widest block mb-1.5 ml-1">Payment Receipt / Screenshot (Required)</label>
                    <div className="mb-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Registration Fee</span>
                        <span className="text-sm font-black text-emerald-900">₹ 2,360</span>
                      </div>
                      <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">2,000 + 18% GST included</p>
                    </div>
                    <input required type="file" accept="image/*" className="w-full bg-[#2e9782]/5 border border-[#2e9782]/20 rounded-2xl px-4 py-3 text-xs text-slate-600 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-[#2e9782]/10 file:text-[#2e9782] hover:file:bg-[#2e9782]/20 transition-all cursor-pointer" onChange={e => setPaymentScreenshot(e.target.files ? e.target.files[0] : null)} />
                  </div>
                </div>
              )}

              {showSuccessModal && (
                <div className="bg-slate-50 p-5 rounded-3xl mb-8 border border-slate-100">
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    Your request has been sent to the admin for verification. You cannot login until your profile & documents are approved.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {regStep > 1 && (
                  <button type="button" onClick={() => setRegStep(s => s - 1)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs">Back</button>
                )}
                <button type="submit" disabled={isLoading} className="flex-[2] py-4 bg-[#f49022] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all disabled:opacity-50">
                  {isLoading ? 'Processing...' : (regStep === 4 ? 'Complete Registration' : 'Next Step')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- Partner Onboarding View ---
  if (isPartnerOnboarding) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center p-6 pb-20 overflow-y-auto">
        <div className="w-full max-w-md">
          <button onClick={() => { setIsPartnerOnboarding(false); setSelectionMode(true); }} className="mb-6 flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-[#2e9782] transition-colors">
            <i className="fa-solid fa-arrow-left"></i> Back to Gateway
          </button>

          <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-white/20 mb-8">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Associate Partner</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium italic">Join as a Regional Strategic Partner</p>
              <div className="h-1.5 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-[#2e9782] w-full"></div>
              </div>
            </div>

            <form onSubmit={handlePartnerRegisterSubmit} className="space-y-4">
              <div className="space-y-4">
                <input required placeholder="Username" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#2e9782]/20 outline-none" value={partnerData.username} onChange={e => setPartnerData({ ...partnerData, username: e.target.value })} />
                <input required placeholder="Full Name" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#2e9782]/20 outline-none" value={partnerData.fullName} onChange={e => setPartnerData({ ...partnerData, fullName: e.target.value })} />
                <input required type="email" placeholder="Email Address" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#2e9782]/20 outline-none" value={partnerData.email} onChange={e => setPartnerData({ ...partnerData, email: e.target.value })} />
                <div className="relative">
                  <input required type={showPartnerPassword ? "text" : "password"} placeholder="Create Password" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#2e9782]/20 outline-none" value={partnerData.password} onChange={e => setPartnerData({ ...partnerData, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPartnerPassword(!showPartnerPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2e9782] transition-colors">
                    <i className={`fa-solid ${showPartnerPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                <div className="relative">
                  <input required type={showPartnerConfirmPassword ? "text" : "password"} placeholder="Confirm Password" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#2e9782]/20 outline-none" value={partnerData.confirmPassword} onChange={e => setPartnerData({ ...partnerData, confirmPassword: e.target.value })} />
                  <button type="button" onClick={() => setShowPartnerConfirmPassword(!showPartnerConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2e9782] transition-colors">
                    <i className={`fa-solid ${showPartnerConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={isLoading} className="w-full py-4 bg-[#2e9782] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all disabled:opacity-50">
                  {isLoading ? 'Processing...' : 'Complete Partner Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- Gateway / Login View ---
  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col pt-[calc(2rem+env(safe-area-inset-top))] relative overflow-hidden">
      {/* Background soft gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-[#224194]/5 to-transparent blur-3xl"></div>
        <div className="absolute top-[10%] left-[-20%] w-[100%] h-[40%] bg-gradient-to-tr from-[#2e9782]/5 to-transparent blur-3xl"></div>
      </div>

      {/* Header Branding */}
      <div className="w-full flex flex-col items-center px-6 mb-6 relative z-10 animate-in fade-in slide-in-from-top duration-700">
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl flex items-center justify-center mb-4 w-56 h-48 transform hover:scale-110 transition-transform duration-500 overflow-hidden border border-slate-50">
          <img src="/logo.jpeg" alt="AFRO ARAB Logo" className="w-full h-full object-contain" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black text-[#224194] uppercase tracking-[0.4em] animate-in fade-in slide-in-from-bottom duration-1000 delay-300">AFRO ARAB</p>
          <p className="text-[8px] font-medium text-slate-400 uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom duration-1000 delay-500">Globally Connected</p>
        </div>
      </div>

      {/* Access Portal Card */}
      <div className="flex-1 bg-white rounded-t-[4rem] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.08)] border-t border-slate-50 p-8 pt-10 relative z-20 animate-in slide-in-from-bottom-[30%] duration-1000">
        <div className="max-w-md mx-auto h-full flex flex-col">
          {selectionMode ? (
            <div className="flex-1 flex flex-col pt-2 animate-in fade-in duration-500">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-[#224194] tracking-tight mb-1">Access Portal</h2>
                <div className="h-1 w-12 bg-[#f49022] mx-auto rounded-full mb-2"></div>
                <p className="text-xs text-slate-400 font-medium tracking-wide">Select your role to continue</p>
              </div>

              <div className="space-y-4">
                {/* Admin Management Button */}
                <button
                  onClick={() => handleRoleSelect('ADMIN')}
                  className="w-full flex items-center justify-between p-4 bg-[#224194] hover:bg-blue-900 text-white rounded-[2rem] shadow-xl shadow-[#224194]/20 group transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-shield-halved text-lg"></i>
                    </div>
                    <span className="font-black uppercase tracking-widest text-[11px] text-white">Admin Management</span>
                  </div>
                  <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
                </button>

                {/* Regional Agent Button */}
                <button
                  onClick={() => handleRoleSelect('AGENT')}
                  className="w-full flex items-center justify-between p-4 bg-[#2e9782] hover:bg-[#257a69] text-white rounded-[2rem] shadow-xl shadow-[#2e9782]/20 group transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-user-tie text-lg"></i>
                    </div>
                    <span className="font-black uppercase tracking-widest text-[11px] text-white">Regional Agent</span>
                  </div>
                  <i className="fa-solid fa-chevron-right text-xs group-hover:translate-x-1 transition-transform"></i>
                </button>

                {/* Associate Partner Button */}
                <button
                  onClick={() => handleRoleSelect('PARTNER')}
                  className="w-full flex items-center justify-between p-4 bg-[#4338ca] hover:bg-[#3730a3] text-white rounded-[2rem] shadow-xl shadow-[#4338ca]/20 group transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-handshake text-lg"></i>
                    </div>
                    <span className="font-black uppercase tracking-widest text-[11px] text-white">Associate Partner</span>
                  </div>
                  <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
                </button>

                {/* Supplier Portal Button */}
                <button
                  onClick={() => handleRoleSelect('SUPPLIER')}
                  className="w-full flex items-center justify-between p-4 bg-[#f49022] hover:bg-[#d87d1a] text-white rounded-[2rem] shadow-xl shadow-[#f49022]/20 group transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-truck-fast text-lg"></i>
                    </div>
                    <span className="font-black uppercase tracking-widest text-[11px] text-white">Supplier Portal</span>
                  </div>
                  <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
                </button>
              </div>

              <div className="pt-8 flex flex-col items-center gap-4 mt-auto pb-4">
                <button
                  onClick={() => setIsRegistering(true)}
                  className="inline-flex flex-col items-center gap-2 group"
                >
                  <span className="text-[10px] font-black text-[#f49022] uppercase tracking-[0.2em] group-hover:opacity-70 transition-all">New Supplier? Join The Network</span>
                  <div className="h-0.5 w-12 bg-[#f49022]/20 group-hover:w-full transition-all duration-300"></div>
                </button>

              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right duration-500">
              <button
                onClick={() => setSelectionMode(true)}
                className="mb-8 flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-[#224194] transition-colors"
              >
                <i className="fa-solid fa-chevron-left text-[8px]"></i> Back to Roles
              </button>

              <div className="mb-10 text-center">
                <h3 className="text-2xl font-black text-[#224194] tracking-tight mb-2">
                  {selectedRole === 'ADMIN' ? 'Admin Access' : selectedRole === 'AGENT' ? 'Agent Login' : selectedRole === 'PARTNER' ? 'Partner Gateway' : 'Supplier Gateway'}
                </h3>
                <p className="text-xs text-slate-400 font-medium tracking-wide">Enter the secure digital vault</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                    {selectedRole === 'SUPPLIER' ? 'Mobile Number' : 'Account Username'}
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-user absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
                    <input
                      required
                      placeholder={selectedRole === 'SUPPLIER' ? "enter mobile number" : "username"}
                      className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] pl-12 pr-4 py-4 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#224194]/10 focus:bg-white outline-none transition-all"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Secure Password</label>
                  <div className="relative">
                    <i className="fa-solid fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] pl-12 pr-12 py-4 text-sm text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#224194]/10 focus:bg-white outline-none transition-all"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#224194] transition-colors"
                    >
                      <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-[10px] text-rose-500 font-bold flex items-center gap-3">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-[#224194] text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-900/10 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 overflow-hidden relative"
                >
                  {isLoading ? 'Decrypting Access...' : 'Authenticate'}
                  {isLoading && <div className="absolute inset-0 bg-white/10 animate-pulse"></div>}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Registration Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl scale-in-center overflow-hidden relative">
            {/* Soft background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f49022]/10 blur-3xl -mr-16 -mt-16"></div>

            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-inner animate-bounce duration-1000">
                <i className="fa-solid fa-cloud-arrow-up text-3xl text-emerald-500"></i>
              </div>

              <h3 className="text-xl font-black text-slate-900 leading-tight mb-4 uppercase tracking-tight">
                Submission<br />Successful!
              </h3>

              <div className="bg-slate-50 p-5 rounded-3xl mb-8 border border-slate-100">
                <p className="text-xs text-slate-600 font-bold leading-relaxed">
                  Your request has been sent to the admin for verification. You cannot login until your profile & documents are approved.
                </p>
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-4 bg-[#224194] hover:bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
              >
                Acknowledge & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

const Footer: React.FC = () => (
  <div className="w-full py-6 flex flex-col items-center justify-center gap-1.5 opacity-60 animate-in fade-in duration-1000 delay-700">
    <div className="flex items-center gap-2">
      <div className="h-[1px] w-4 bg-slate-300"></div>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">build by</span>
      <div className="h-[1px] w-4 bg-slate-300"></div>
    </div>
    <span className="text-[10px] font-black text-[#224194] uppercase tracking-widest hover:text-[#f49022] transition-colors cursor-default">jinang jain</span>
  </div>
);

export default Login;
