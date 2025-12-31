
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { UserRole } from '../types';
import { technicianService } from '../services/technicianService';
// Added ShieldCheck to imports to fix error on line 135
import { LayoutDashboard, ClipboardList, Users, Settings, Bell, Search, BrainCircuit, Activity, Navigation, LogOut, CreditCard, Box, Shield, CheckCircle2, ShieldAlert, Layers, ShieldCheck } from './Icons';
import { AlertSystem, GlobalTriageBar, GlobalAlert } from './AlertSystem';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'jobs' | 'admin-dispatch' | 'quality-control' | 'mobile-tech' | 'billing' | 'strategic-tower';
  onNavigate: (tab: 'dashboard' | 'jobs' | 'admin-dispatch' | 'quality-control' | 'mobile-tech' | 'billing' | 'strategic-tower') => void;
}

const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void;
  badge?: number;
  highlight?: boolean;
}> = ({ icon, label, active, onClick, badge, highlight }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium transition-colors duration-150 rounded-md mb-1 ${
      active 
        ? 'bg-tembo-800 text-white shadow-subtle border-l-2 border-tembo-brand' 
        : highlight ? 'text-blue-400 hover:bg-white/5' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
    }`}
  >
    <div className="flex items-center space-x-3">
      <span className={`${active ? 'text-blue-400' : highlight ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-300'}`}>
        {icon}
      </span>
      <span className={`${active ? 'font-bold' : ''}`}>{label}</span>
    </div>
    {badge ? (
      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
        {badge}
      </span>
    ) : null}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onNavigate }) => {
  const { user, logout } = useAuth();
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [unassignedJobCount, setUnassignedJobCount] = useState(0);
  
  if (!user) return null;

  const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;
  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
  const isClient = user.role === UserRole.CLIENT;

  const handleAlertAction = (alert: GlobalAlert) => {
    if (alert.linkId?.startsWith('INV')) {
      onNavigate('billing');
    } else {
      onNavigate('admin-dispatch');
    }
    setIsAlertsOpen(false);
  };

  useEffect(() => {
    const fetchUnassignedJobCount = async () => {
      try {
        const data = await technicianService.getAvailableJobs();
        setUnassignedJobCount(data.length);
      } catch (error) {
        console.error("Failed to fetch unassigned jobs count", error);
      }
    };

    if (isAdmin) fetchUnassignedJobCount();
  }, [isAdmin]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      {isAdmin && <GlobalTriageBar onOpen={() => setIsAlertsOpen(true)} />}
      

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-tembo-900 border-r border-slate-800 flex flex-col flex-shrink-0 z-20 shadow-xl">
          <div className="h-16 flex items-center px-5 border-b border-slate-800 bg-tembo-900">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-md flex items-center justify-center text-white shadow-lg">
                <BrainCircuit size={18} />
              </div>
              <div>
                <span className="block text-sm font-bold text-white tracking-tight leading-none uppercase">TEMBOCARE</span>
                <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none mt-1">Facility OS</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {isSuperAdmin && (
               <>
                <div className="px-3 mb-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                  Strategic Command
                </div>
                <SidebarItem 
                  icon={<Layers size={18} />} 
                  label="Tower Dashboard" 
                  active={activeTab === 'strategic-tower'} 
                  onClick={() => onNavigate('strategic-tower')} 
                  highlight
                />
               </>
            )}

            <div className="px-3 mt-6 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {isAdmin ? 'Operational Control' : isClient ? 'My Portal' : 'Overview'}
            </div>
            
            <SidebarItem 
              icon={<Activity size={18} />} 
              label={isAdmin ? "Live Operations" : "Dashboard"} 
              active={activeTab === 'dashboard'} 
              onClick={() => onNavigate('dashboard')} 
            />
            
            {isClient && (
              <>
                <SidebarItem 
                  icon={<ClipboardList size={18} />} 
                  label="My Requests" 
                  active={activeTab === 'jobs'} 
                  onClick={() => onNavigate('jobs')} 
                />
                 <SidebarItem 
                  icon={<CreditCard size={18} />} 
                  label="Billing & Plans" 
                  active={activeTab === 'billing'} 
                  onClick={() => onNavigate('billing')} 
                />
              </>
            )}
            
            {isAdmin && (
              <>
                <SidebarItem 
                  icon={<LayoutDashboard size={18} />} 
                  label="Dispatch Console" 
                  active={activeTab === 'admin-dispatch'} 
                  onClick={() => onNavigate('admin-dispatch')}
                  badge={unassignedJobCount} 
                />
                <SidebarItem 
                  icon={<ShieldCheck size={18} />} 
                  label="Field QA Audits" 
                  active={activeTab === 'quality-control'} 
                  onClick={() => onNavigate('quality-control')} 
                />
                 <SidebarItem 
                  icon={<CreditCard size={18} />} 
                  label="Yield Ledger" 
                  active={activeTab === 'billing'} 
                  onClick={() => onNavigate('billing')} 
                />
              </>
            )}

            {isSuperAdmin && (
               <>
                 <div className="mt-8 px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Governance
                </div>
                <SidebarItem 
                  icon={<Settings size={18} />} 
                  label="System Config" 
                  active={false} 
                  onClick={() => {}} 
                />
              </>
            )}
          </nav>

          <div className="p-4 border-t border-slate-800 bg-tembo-900">
            <div className="flex items-center justify-between group">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white border border-slate-600">
                  {user.name.charAt(0)}
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">{user.name}</p>
                  <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">{user.role}</p>
                </div>
              </div>
              <button onClick={logout} className="text-slate-500 hover:text-white transition-colors" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-slate-400" />
                </span>
                <input
                  type="text"
                  className="block w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-md text-sm leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Strategic Search..."
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-4 w-px bg-slate-200 mx-2"></div>
              <button 
                onClick={() => setIsAlertsOpen(true)}
                className="text-slate-400 hover:text-slate-600 relative p-1 rounded-md hover:bg-slate-50"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6 scroll-smooth">
            {children}
          </main>
        </div>
      </div>

      <AlertSystem 
        isOpen={isAlertsOpen} 
        onClose={() => setIsAlertsOpen(false)} 
        onAlertAction={handleAlertAction}
      />
    </div>
  );
};
