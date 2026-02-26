
import React from 'react';
import { Endpoint } from '../types';

const ApiEndpoints: React.FC = () => {
  const endpoints: Endpoint[] = [
    { method: 'POST', path: '/auth/login', role: 'Both', description: 'Exchange credentials for JWT' },
    { method: 'GET', path: '/suppliers', role: 'Both', description: 'List all Indian suppliers' },
    { method: 'POST', path: '/suppliers', role: 'Admin', description: 'Create new supplier profile' },
    { method: 'PATCH', path: '/suppliers/:id', role: 'Admin', description: 'Update supplier details' },
    { method: 'GET', path: '/buyers', role: 'Both', description: 'List all African buyers' },
    { method: 'POST', path: '/orders', role: 'Admin', description: 'Initiate new order flow' },
    { method: 'PATCH', path: '/orders/:id/status', role: 'Admin', description: 'Advance order lifecycle status' },
    { method: 'GET', path: '/reports/summary', role: 'Admin', description: 'Dashboard analytics for management' },
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-emerald-100 text-emerald-700';
      case 'POST': return 'bg-blue-100 text-blue-700';
      case 'PUT': return 'bg-amber-100 text-amber-700';
      case 'PATCH': return 'bg-indigo-100 text-indigo-700';
      case 'DELETE': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold text-slate-900 mb-6">REST API Endpoints</h2>
      
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Endpoint</th>
                <th className="px-6 py-4">Required Role</th>
                <th className="px-6 py-4">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {endpoints.map((ep, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest ${getMethodColor(ep.method)}`}>
                      {ep.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-900 font-medium">
                    {ep.path}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ep.role === 'Admin' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                      ep.role === 'Agent' ? 'bg-sky-50 text-sky-600 border border-sky-100' : 
                      'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>
                      {ep.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 italic">
                    {ep.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
        <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-2">
          <i className="fa-solid fa-circle-info"></i>
          Request Structure Tip
        </h4>
        <p className="text-indigo-800 text-sm">
          All requests (except /login) must include the <code>Authorization: Bearer &lt;token&gt;</code> header. 
          The backend uses <strong>Class-Validator</strong> to ensure payloads match the expected DTO shape before reaching the controller.
        </p>
      </div>
    </div>
  );
};

export default ApiEndpoints;
