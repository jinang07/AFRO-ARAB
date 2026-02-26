
import React from 'react';
import { DatabaseTable } from '../types';

const DatabaseSchema: React.FC = () => {
  const tables: DatabaseTable[] = [
    {
      name: 'users',
      fields: [
        { name: 'id', type: 'UUID', constraints: 'PK, DEFAULT gen_random_uuid()', description: 'Unique identifier' },
        { name: 'email', type: 'VARCHAR(255)', constraints: 'UNIQUE, NOT NULL', description: 'Login credential' },
        { name: 'password', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Hashed password (Argon2)' },
        { name: 'role', type: 'ENUM', constraints: "('ADMIN', 'AGENT')", description: 'Access level' },
        { name: 'full_name', type: 'VARCHAR(100)', description: 'Display name' }
      ]
    },
    {
      name: 'suppliers',
      fields: [
        { name: 'id', type: 'UUID', constraints: 'PK', description: 'Unique identifier' },
        { name: 'company_name', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Business name' },
        { name: 'contact_person', type: 'VARCHAR(255)', description: 'Primary POC' },
        { name: 'location', type: 'TEXT', description: 'State/City in India' },
        { name: 'products', type: 'TEXT[]', description: 'List of product categories' },
        { name: 'contact_details', type: 'JSONB', description: 'Phone, Email, WhatsApp' }
      ]
    },
    {
      name: 'orders',
      fields: [
        { name: 'id', type: 'UUID', constraints: 'PK', description: 'Unique identifier' },
        { name: 'supplier_id', type: 'UUID', constraints: 'FK (suppliers.id)', description: 'Indian supplier' },
        { name: 'buyer_id', type: 'UUID', constraints: 'FK (buyers.id)', description: 'African buyer' },
        { name: 'status', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Current lifecycle step' },
        { name: 'total_value', type: 'DECIMAL(15,2)', description: 'Monetary value (optional)' },
        { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT NOW()', description: 'Record date' }
      ]
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold text-slate-900 mb-6">Database Schema (PostgreSQL)</h2>
      
      <p className="text-slate-600 mb-8">
        The database uses a relational model to ensure <strong>ACID</strong> compliance, critical for financial transactions and inventory tracking.
      </p>

      <div className="space-y-10">
        {tables.map(table => (
          <div key={table.name} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="font-mono text-lg font-bold text-blue-600">
                <i className="fa-solid fa-table mr-2"></i>
                {table.name}
              </h3>
              <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded font-bold uppercase">Base Table</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Field</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Constraints</th>
                    <th className="px-6 py-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {table.fields.map(field => (
                    <tr key={field.name} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{field.name}</td>
                      <td className="px-6 py-4 text-indigo-600">{field.type}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1 rounded">{field.constraints || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{field.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        <div className="p-8 bg-slate-900 rounded-3xl text-white">
          <h4 className="text-xl font-bold mb-4">Integrity Diagram</h4>
          <div className="flex items-center justify-center gap-4 py-8">
            <div className="px-4 py-2 bg-blue-600 rounded-lg shadow-lg font-bold">SUPPLIERS</div>
            <div className="h-0.5 w-16 bg-slate-600"></div>
            <div className="px-4 py-2 bg-indigo-600 rounded-lg shadow-lg font-bold italic text-white ring-4 ring-indigo-900">ORDERS</div>
            <div className="h-0.5 w-16 bg-slate-600"></div>
            <div className="px-4 py-2 bg-blue-600 rounded-lg shadow-lg font-bold">BUYERS</div>
          </div>
          <p className="text-center text-slate-400 text-sm italic">Foreign Keys ensure orders cannot exist without both parties.</p>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSchema;
