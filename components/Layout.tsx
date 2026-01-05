import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Settings,
  Bell,
  Search,
  BrainCircuit,
  Activity,
  LogOut,
  CreditCard,
  Layers,
  ShieldCheck,
  UserCheck,
  Box,
  Briefcase
} from './Icons';
import { AlertSystem, GlobalTriageBar, GlobalAlert } from './AlertSystem';
import { Building2, MessageSquare } from 'lucide-react';

/* =======================
   TAB TYPES (FIX)
======================= */
export type TabKey =
  | 'dashboard'
  | 'jobs'
  | 'admin-dispatch'
  | 'quality-control'
  | 'mobile-tech'
  | 'billing'
  | 'billing-report'
  | 'strategic-tower'
  | 'enroll-technician'
  | 'technician-upgrades'
  | 'yield-ledger'
  | 'admin-chat'
  | 'ops-apartments'
  | 'job-report';


interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabKey;
  onNavigate: (tab: TabKey) => void;
}

/* =======================
   SIDEBAR ITEM
======================= */
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
    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md mb-1 transition-colors ${
      active
        ? 'bg-tembo-800 text-white border-l-2 border-tembo-brand'
        : highlight
        ? 'text-blue-400 hover:bg-white/5'
        : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
    }`}
  >
    <div className="flex items-center space-x-3">
      <span>{icon}</span>
      <span>{label}</span>
    </div>
    {badge && (
      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

/* =======================
   MAIN LAYOUT
======================= */
export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onNavigate
}) => {
  const { user, logout } = useAuth();
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  if (!user) return null;

  const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;
  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
  const isClient = user.role === UserRole.CLIENT;

  const handleAlertAction = (alert: GlobalAlert) => {
    if (alert.linkId?.startsWith('INV')) {
      onNavigate('billing-report');
    } else {
      onNavigate('admin-dispatch');
    }
    setIsAlertsOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {isAdmin && <GlobalTriageBar onOpen={() => setIsAlertsOpen(true)} />}

      <div className="flex flex-1 overflow-hidden">
        {/* ================= SIDEBAR ================= */}
        <aside className="w-64 bg-tembo-900 border-r border-slate-800 flex flex-col">
          <div className="h-16 flex items-center px-5 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white">
                <BrainCircuit size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-white uppercase">TEMBOCARE</p>
                <p className="text-[10px] text-slate-400 uppercase">Facility OS</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-6 overflow-y-auto">
            {isSuperAdmin && (
              <>
                <p className="px-3 mb-2 text-[10px] font-bold text-blue-500 uppercase">
                  Strategic Command
                </p>
                <SidebarItem
                  icon={<Layers size={18} />}
                  label="Tower Dashboard"
                  active={activeTab === 'strategic-tower'}
                  onClick={() => onNavigate('strategic-tower')}
                  highlight
                />
              </>
            )}

            <p className="px-3 mt-6 mb-2 text-[10px] font-bold text-slate-500 uppercase">
              {isAdmin ? 'Operational Control' : 'My Portal'}
            </p>

            <SidebarItem
              icon={<Activity size={18} />}
              label="Dashboard"
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
                  label="Billing"
                  active={activeTab === 'billing'}
                  onClick={() => onNavigate('billing')}
                />
                <SidebarItem
                  icon={<Box size={18} />}
                  label="JobReport"
                  active={activeTab === 'job-report'}
                  onClick={() => onNavigate('job-report')}
                />
                <SidebarItem
                  icon={<Box size={18} />}
                  label="Billing Report"
                  active={activeTab === 'billing-report'}
                  onClick={() => onNavigate('billing-report')}
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
                />
                <SidebarItem
                  icon={<UserCheck size={18} />}
                  label="Enroll Technician"
                  active={activeTab === 'enroll-technician'}
                  onClick={() => onNavigate('enroll-technician')}
                />
                <SidebarItem
                  icon={<ShieldCheck size={18} />}
                  label="Quality Control"
                  active={activeTab === 'quality-control'}
                  onClick={() => onNavigate('quality-control')}
                />
                <SidebarItem
                  icon={<CreditCard size={18} />}
                  label="Yield Ledger"
                  active={activeTab === 'yield-ledger'}
                  onClick={() => onNavigate('yield-ledger')}
                />
                 <SidebarItem
                  icon={<Briefcase size={18} />}
                  label="ClientUpgrades"
                  active={activeTab === 'technician-upgrades'}
                  onClick={() => onNavigate('technician-upgrades')}
                />
                <SidebarItem
                  icon={< Building2 size={18} />}
                  label="Apartments"
                  active={activeTab === 'ops-apartments'}
                  onClick={() => onNavigate('ops-apartments')}
                />
                <SidebarItem
                  icon={<MessageSquare size={18} />}
                  label="Admin Chat"
                  active={activeTab === 'admin-chat'}
                  onClick={() => onNavigate('admin-chat')}
                />
                <SidebarItem
                  icon={<Box size={18} />}
                  label="Billing Report"
                  active={activeTab === 'billing-report'}
                  onClick={() => onNavigate('billing-report')}
                />
              </>
            )}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">{user.name}</p>
                <p className="text-[9px] text-slate-500 uppercase">{user.role}</p>
              </div>
              <button onClick={logout} className="text-slate-400 hover:text-white">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* ================= MAIN ================= */}
        <div className="flex-1 flex flex-col">
          <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                className="w-full pl-9 pr-3 py-1.5 border rounded-md text-sm"
                placeholder="Search..."
              />
            </div>
            <button
              onClick={() => setIsAlertsOpen(true)}
              className="relative text-slate-500"
            >
              <Bell size={18} />
            </button>
          </header>

          <main className="flex-1 overflow-auto p-6">{children}</main>
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
