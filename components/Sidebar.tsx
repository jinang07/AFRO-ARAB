
import React from 'react';
import { AppSection } from '../types';

interface SidebarProps {
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const menuItems = [
    { id: AppSection.Overview, label: 'Project Overview', icon: 'fa-house' },
    { id: AppSection.Backend, label: 'Backend Architecture', icon: 'fa-server' },
    { id: AppSection.Database, label: 'Database Schema', icon: 'fa-database' },
    { id: AppSection.API, label: 'REST API Endpoints', icon: 'fa-code' },
    { id: AppSection.Flutter, label: 'Flutter Structure', icon: 'fa-mobile-screen' },
    { id: AppSection.Security, label: 'Security & Auth', icon: 'fa-shield-halved' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white p-6 z-50">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-blue-500 p-2 rounded-lg">
          <i className="fa-solid fa-earth-africa text-xl"></i>
        </div>
        <h1 className="text-xl font-bold leading-tight uppercase tracking-tight">AFRO ARAB</h1>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeSection === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5`}></i>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-10 left-6 right-6 p-4 bg-slate-800 rounded-2xl">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-bold">Role context</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-sm font-medium">Production Mode</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
