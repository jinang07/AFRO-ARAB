
import React from 'react';

const BackendArchitecture: React.FC = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold text-slate-900 mb-6">Backend Architecture (Django)</h2>
      
      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-semibold mb-4 text-slate-800 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-green-600 rounded-full"></div>
            App-Based Organization
          </h3>
          <p className="text-slate-600 mb-4 text-sm">
            Django follows an "App" based architecture. Each module is a self-contained Django App with its own models, views, and logic.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'accounts', desc: 'Custom User model & JWT' },
              { title: 'suppliers', desc: 'Indian supplier profiles' },
              { title: 'buyers', desc: 'African buyer profiling' },
              { title: 'orders', desc: 'Stateful order management' },
              { title: 'core', desc: 'Shared utilities & base models' },
              { title: 'analytics', desc: 'Aggregation for reporting' }
            ].map(m => (
              <div key={m.title} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="font-mono font-bold text-blue-600 mb-1">{m.title}</div>
                <div className="text-[11px] text-slate-500">{m.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 text-slate-800 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-green-600 rounded-full"></div>
            Directory Structure (DRF Standard)
          </h3>
          <div className="bg-slate-900 rounded-2xl p-6 text-slate-300 font-mono text-xs overflow-x-auto shadow-inner">
            <pre>{`backend/
├── manage.py
├── config/              # Project settings
│   ├── settings.py
│   └── urls.py          # Root URL dispatcher
├── apps/
│   └── orders/
│       ├── models.py    # Order database schema
│       ├── serializers.py # JSON transformation logic
│       ├── views.py     # API ViewSets
│       ├── urls.py      # Local routes
│       ├── signals.py   # Trigger logic (e.g. status change)
│       └── services.py  # Business logic layer
└── requirements.txt     # djangorestframework, djangorestframework-simplejwt`}</pre>
          </div>
        </section>

        <section className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl">
          <h4 className="font-bold text-emerald-900 mb-2">Django Advantage</h4>
          <p className="text-emerald-800 text-sm leading-relaxed">
            By utilizing the <strong>Django Admin</strong>, site managers can quickly manage supplier records and audit orders without a custom dashboard in the early MVP stage. DRF provides the robust serializers needed for the Flutter mobile app.
          </p>
        </section>
      </div>
    </div>
  );
};

export default BackendArchitecture;
