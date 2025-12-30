
import React, { useState, useMemo } from 'react';
import { KPI, UserRole, Job, JobStatus, JobPriority, BillingStatus, HoldReason, ServiceTarget, TargetChangeLog } from '../types';
import { MOCK_JOBS, MOCK_CUSTOMERS } from '../constants';
import { useAuth } from './AuthContext';
import { 
  Activity, Clock, MapPin, Users, Zap,Target, FileText, Filter, CheckCircle2,
  AlertCircle, Calendar, ChevronRight, Download, ChevronUp, ChevronDown,
  X, UserCheck, RefreshCw, ClipboardList, Thermometer, Droplets, Shield, Wrench, SprayCan, Settings,
  Hammer, HardHat, Box, List, Briefcase, History, Lock, Star
} from './Icons';
import { AdminLiveOpsView } from './admin/AdminLiveOpsView';
import { RevenueIntelligenceView } from './admin/RevenueIntelligenceView';
import { ClientDashboard } from './client/ClientDashboard';





// --- MODULE COMPONENT: TARGET CONFIGURATION ---



// --- MODULE COMPONENT: INTERVENTION PANEL ---


// --- MAIN REVENUE INTELLIGENCE VIEW ---




export const Dashboard: React.FC<{ onCreateClick?: () => void; onIntervene?: (jobId: string) => void }> = ({ onCreateClick, onIntervene }) => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'ops' | 'revenue'>('ops');
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
  console.log('Rendering Dashboard - Active View:', activeView, 'Is Admin:', isAdmin);
  return (
    <div className="animate-slide-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">{activeView === 'ops' ? 'Operational Command' : 'Revenue Intelligence'}</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">{activeView === 'ops' ? 'Monitoring facilities, technician logistics, and SLA compliance.' : 'Identifying strategic growth and capital velocity opportunities.'}</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner border border-slate-300">
               <button onClick={() => setActiveView('ops')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeView === 'ops' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Operations</button>
               <button onClick={() => setActiveView('revenue')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeView === 'revenue' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Strategic Intelligence</button>
            </div>
          )}
          {!isAdmin && <button onClick={onCreateClick} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg">+ New Request</button>}
        </div>
      </div>
      {isAdmin ? (activeView === 'ops' ? <AdminLiveOpsView onIntervene={onIntervene} /> : <RevenueIntelligenceView onIntervene={onIntervene} />) : <div className="p-20 text-center text-slate-400 italic"> <ClientDashboard/></div>}
    </div>
  );
};
