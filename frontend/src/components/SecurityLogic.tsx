
import React from 'react';

const SecurityLogic: React.FC = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold text-slate-900 mb-6">Security (Django SimpleJWT)</h2>
      
      <div className="space-y-8">
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-shield-virus text-blue-600"></i>
            Hardened Auth Flow
          </h3>
          <ol className="list-decimal list-inside space-y-4 text-slate-600 text-sm">
            <li className="pl-2">
              <span className="font-bold text-slate-900">SimpleJWT Integration:</span> Django generates HMAC-SHA256 tokens. Access tokens expire in 15m; Refresh tokens in 24h.
            </li>
            <li className="pl-2">
              <span className="font-bold text-slate-900">Blacklist App:</span> When a user logs out in Flutter, the refresh token is blacklisted in the Django database.
            </li>
            <li className="pl-2">
              <span className="font-bold text-slate-900">Password Hashing:</span> Uses Django's default <strong>PBKDF2 with SHA256</strong> (configurable to Argon2).
            </li>
            <li className="pl-2">
              <span className="font-bold text-slate-900">CORS & CSRF:</span> <code>django-cors-headers</code> restricts API access to the mobile app's domain/bundle ID.
            </li>
          </ol>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg">
            <h4 className="font-bold text-blue-200 mb-3 uppercase tracking-wider text-[10px]">Permission Class: IsAdminUser</h4>
            <div className="space-y-2">
              {['Supplier Write Access', 'Buyer Write Access', 'Order Creation', 'Financial Reporting', 'User Management'].map(p => (
                <div key={p} className="flex items-center gap-2 text-xs">
                  <i className="fa-solid fa-check-double text-blue-300"></i>
                  {p}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-100 border border-slate-200 p-6 rounded-3xl">
            <h4 className="font-bold text-slate-400 mb-3 uppercase tracking-wider text-[10px]">Permission Class: IsAuthenticated</h4>
            <div className="space-y-2">
              {['Read-only Dashboards', 'Order Tracking', 'Contact Suppliers', 'Audit Logs'].map(p => (
                <div key={p} className="flex items-center gap-2 text-xs text-slate-600">
                  <i className="fa-solid fa-eye"></i>
                  {p}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
          <h3 className="text-lg font-bold text-amber-900 mb-3">Flutter Secure Handling</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex gap-4 items-start">
              <div className="text-amber-600 mt-1"><i className="fa-solid fa-vault"></i></div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Tokens are stored using <strong>flutter_secure_storage</strong> which maps to KeyChain on iOS and EncryptedSharedPrefs on Android.
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="text-amber-600 mt-1"><i className="fa-solid fa-fingerprint"></i></div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Biometric authentication (FaceID/Fingerprint) can be added as an extra gate before accessing the stored JWT.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SecurityLogic;
