
import React from 'react';

const FlutterStructure: React.FC = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold text-slate-900 mb-6">Flutter Application Structure</h2>
      
      <p className="text-slate-600 mb-8 leading-relaxed">
        To maintain a single codebase for Android & iOS, we follow <strong>Clean Architecture</strong> combined with the <strong>Bloc (Business Logic Component)</strong> pattern for state management.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-folder-tree text-blue-500"></i>
            Lib Folder Tree
          </h3>
          <div className="bg-slate-50 p-4 rounded-2xl font-mono text-xs text-slate-700 whitespace-pre">
{`lib/
├── core/
│   ├── constants/       # App themes, API URLs
│   ├── network/         # Dio client, Interceptors
│   └── errors/          # Custom Exceptions
├── data/
│   ├── models/          # JSON serialization (freezed)
│   ├── repositories/    # Implementation of domain repos
│   └── providers/       # Remote & Local datasources
├── domain/
│   ├── entities/        # Pure business objects
│   └── repositories/    # Abstract interfaces
├── presentation/
│   ├── blocs/           # OrderBloc, AuthBloc
│   ├── screens/         # UI layouts
│   └── widgets/         # Shared UI components
└── main.dart            # Flutter entry point`}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg">
            <h4 className="font-bold mb-2">State Management: Bloc</h4>
            <p className="text-sm text-blue-100">
              Bloc separates the presentation from business logic. Screens emit <strong>Events</strong> (e.g., CreateOrderEvent), and Blocs emit <strong>States</strong> (e.g., OrderLoading, OrderSuccess).
            </p>
          </div>
          <div className="bg-emerald-50 text-emerald-900 p-6 rounded-3xl border border-emerald-100">
            <h4 className="font-bold mb-2 text-emerald-800">Dependency Injection</h4>
            <p className="text-sm text-emerald-700">
              We use <strong>GetIt</strong> as a service locator to provide instances of Repositories and Blocs throughout the app.
            </p>
          </div>
          <div className="bg-amber-50 text-amber-900 p-6 rounded-3xl border border-amber-100">
            <h4 className="font-bold mb-2 text-amber-800">Security Note</h4>
            <p className="text-sm text-amber-700">
              JWT tokens are stored in <strong>Flutter Secure Storage</strong> (iOS Keychain / Android EncryptedSharedPrefs) to prevent leaks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlutterStructure;
