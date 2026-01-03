import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { UserRole } from '../types';
import { 
  LayoutDashboard, ClipboardList, Radio, ShieldCheck, 
  Smartphone, CreditCard, UserPlus, Menu, X, LogOut,
  Building2
} from 'lucide-react';
import { Briefcase } from './Icons';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tab: any) => void;
}

export const ResponsiveLayout: React.FC<LayoutProps> = ({ children, activeTab, onNavigate }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.CLIENT, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    { id: 'jobs', label: 'Requests', icon: ClipboardList, roles: [UserRole.CLIENT] },
    { id: 'admin-dispatch', label: 'Dispatch Console', icon: Radio, roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    { id: 'quality-control', label: 'Quality Control', icon: ShieldCheck, roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    { id: 'enroll-technician', label: 'Enroll Tech', icon: UserPlus, roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    { id: 'technician-upgrades', label: 'Tech Upgrades', icon: Briefcase, roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    { id: 'yield-ledger', label: 'Yield Ledger', icon: UserPlus, roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    { id: 'billing-report', label: 'Billing Report', icon: CreditCard, roles: [UserRole.CLIENT, UserRole.ADMIN] },
    { id: 'strategic-tower', label: 'Strategic Tower', icon: Building2, roles: [UserRole.SUPER_ADMIN] },
    { id: 'mobile-tech', label: 'Tech App', icon: Smartphone, roles: [UserRole.TECHNICIAN] },
    { id: 'billing', label: 'Billing', icon: CreditCard, roles: [UserRole.CLIENT] },
  ];

  const filteredNav = NAV_ITEMS.filter(item => user && item.roles.includes(user.role));

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-black text-lg">T</span>
        </div>
        <span className="text-white font-bold text-xl tracking-tight">Tembo<span className="text-blue-500">OS</span></span>
      </div>

      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {filteredNav.map(item => (
          <button
            key={item.id}
            onClick={() => {
              onNavigate(item.id);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-slate-900 shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Header & Overlay */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-lg">T</span>
            </div>
            <span className="font-bold text-lg">Tembo<span className="text-blue-500">OS</span></span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-300 hover:text-white">
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-3/4 max-w-xs bg-slate-900 shadow-2xl animate-in slide-in-from-left duration-300">
              <SidebarContent />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full p-4 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
