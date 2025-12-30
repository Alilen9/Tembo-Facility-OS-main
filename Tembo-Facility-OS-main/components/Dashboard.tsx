
import React, { useState, useMemo } from 'react';
import { KPI, UserRole, Job, JobStatus, JobPriority, BillingStatus, HoldReason, ServiceTarget, TargetChangeLog } from '../types';
import { MOCK_JOBS, MOCK_TECHNICIANS, MOCK_CUSTOMERS } from '../constants';
import { useAuth } from './AuthContext';
import { 
  Activity, Clock, MapPin, Users, Zap, Bell, AlertTriangle, 
  ArrowRight, MessageSquare, Phone, Send, DollarSign, 
  TrendingUp, TrendingDown, Target, FileText, Filter, CheckCircle2,
  AlertCircle, Calendar, ChevronRight, Download, ChevronUp, ChevronDown,
  X, UserCheck, RefreshCw, ClipboardList, Thermometer, Droplets, Shield, Wrench, SprayCan, Settings,
  Hammer, HardHat, Box, List, Briefcase, History, Lock, Star
} from './Icons';

// --- UTILS ---
type TimeRange = 'today' | 'yesterday' | 'this_week' | 'last_7_days' | 'this_month' | 'custom';

const isWithinRange = (dateStr: string, range: TimeRange): boolean => {
  const date = new Date(dateStr);
  const baseDate = new Date('2023-10-25T12:00:00Z');
  const startOfToday = new Date(baseDate.setHours(0,0,0,0));
  const endOfToday = new Date(baseDate.setHours(23,59,59,999));

  switch (range) {
    case 'today': return date >= startOfToday && date <= endOfToday;
    case 'yesterday':
      const yest = new Date(startOfToday);
      yest.setDate(yest.getDate() - 1);
      return date >= yest && date <= new Date(endOfToday.setDate(endOfToday.getDate() - 1));
    case 'last_7_days':
      const seven = new Date(startOfToday);
      seven.setDate(seven.getDate() - 7);
      return date >= seven && date <= endOfToday;
    case 'this_week':
      const startOfWeek = new Date(startOfToday.getTime());
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      return date >= startOfWeek && date <= endOfToday;
    case 'this_month':
      return date >= new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1) && date <= endOfToday;
    default: return true;
  }
};

const INITIAL_SERVICE_TARGETS: ServiceTarget[] = [
  { serviceType: 'Cleaning', daily: 45000, weekly: 250000, monthly: 1000000, historicalDailyAvg: 42000, allTimePeak: 68000 },
  { serviceType: 'Pest Control', daily: 30000, weekly: 180000, monthly: 750000, historicalDailyAvg: 28000, allTimePeak: 45000 },
  { serviceType: 'Handyman', daily: 60000, weekly: 350000, monthly: 1400000, historicalDailyAvg: 55000, allTimePeak: 92000 },
  { serviceType: 'Appliance Repair', daily: 40000, weekly: 220000, monthly: 900000, historicalDailyAvg: 38000, allTimePeak: 55000 },
  { serviceType: 'Construction', daily: 150000, weekly: 800000, monthly: 3500000, historicalDailyAvg: 120000, allTimePeak: 240000 },
  { serviceType: 'Moving Services', daily: 50000, weekly: 300000, monthly: 1200000, historicalDailyAvg: 48000, allTimePeak: 750000 },
];

// --- MODULE COMPONENT: TARGET CONFIGURATION ---

const TargetArchitectDrawer: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  targets: ServiceTarget[]; 
  onSave: (t: ServiceTarget[]) => void; 
  canEdit: boolean 
}> = ({ isOpen, onClose, targets, onSave, canEdit }) => {
  const [localTargets, setLocalTargets] = useState<ServiceTarget[]>(targets);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden flex justify-end">
       <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
       <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slide-in">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
             <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Growth Modeler</h2>
             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={24}/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
             <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                {(['daily', 'weekly', 'monthly'] as const).map(p => (
                  <button key={p} onClick={() => setPeriod(p)} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{p}</button>
                ))}
             </div>
             <div className="space-y-4">
                {localTargets.map(target => (
                  <div key={target.serviceType} className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 transition-all group">
                     <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{target.serviceType}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg: KES {target.historicalDailyAvg.toLocaleString()}</span>
                     </div>
                     <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">KES</span>
                        <input 
                          type="text" 
                          disabled={!canEdit} 
                          value={target[period].toLocaleString()} 
                          onChange={(e) => {
                            const n = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                            setLocalTargets(prev => prev.map(t => t.serviceType === target.serviceType ? { ...t, [period]: n } : t));
                          }} 
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" 
                        />
                     </div>
                  </div>
                ))}
             </div>
          </div>
          <div className="p-6 border-t border-slate-100 bg-slate-50">
             {canEdit ? (
               <button onClick={() => { onSave(localTargets); onClose(); }} className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg hover:bg-slate-800 active:scale-95 transition-all">Synchronize Strategic Goals</button>
             ) : (
               <div className="flex items-center justify-center gap-3 py-4 bg-slate-200 text-slate-500 rounded-xl border border-slate-300">
                  <Lock size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">Strategy Restricted (Super Admin Only)</span>
               </div>
             )}
          </div>
       </div>
    </div>
  );
};

// --- MODULE COMPONENT: INTERVENTION PANEL ---

const TargetInterventionPanel: React.FC<{ 
  job: Job; 
  onClose: () => void; 
  onUpdate: (job: Job, win: number) => void;
  targetImpact?: number;
}> = ({ job, onClose, onUpdate, targetImpact }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleIntervene = async (action: 'RELEASE' | 'REWORK') => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    let updatedJob = { ...job };
    let win = 0;
    if (action === 'RELEASE') {
      updatedJob.billingStatus = BillingStatus.INVOICED;
      updatedJob.holdReason = HoldReason.NONE;
      win = job.price;
    } else {
      updatedJob.status = JobStatus.IN_PROGRESS;
      updatedJob.holdReason = HoldReason.QC_AUDIT;
    }
    onUpdate(updatedJob, win);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white shadow-2xl z-[100] flex flex-col animate-slide-in border-l border-slate-200">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Goal Acceleration</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Audit Record #{job.id}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-600/20">
           <div className="flex items-center gap-3 mb-2"><Target size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Liquidity Impact</span></div>
           <p className="text-sm font-medium leading-relaxed">This hold release will bridge <span className="bg-white/20 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-100">+{targetImpact?.toFixed(1)}%</span> of the {job.category} target gap.</p>
        </div>
        <section className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-2 mb-2"><AlertCircle size={14} /> Revenue Blocker</p>
          <p className="text-xs text-amber-700 leading-relaxed font-medium">Funds held due to: <strong>{job.holdReason}</strong>. Verification of technician evidence is required for release.</p>
        </section>
        <section className="bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 font-mono">Blocked Capital</h3>
          <span className="text-3xl font-black text-slate-900 font-mono">KES {job.price.toLocaleString()}</span>
        </section>
      </div>
      <div className="p-6 border-t border-slate-100 bg-white space-y-3 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        <button onClick={() => handleIntervene('RELEASE')} disabled={isProcessing} className="w-full py-4 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95">
          {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          Bridge Target Deficit
        </button>
        <button onClick={() => handleIntervene('REWORK')} disabled={isProcessing} className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Flag for Investigation</button>
      </div>
    </div>
  );
};

// --- MAIN REVENUE INTELLIGENCE VIEW ---

const RevenueIntelligenceView: React.FC<{ onIntervene?: (jobId: string) => void }> = ({ onIntervene }) => {
  const [activeRange, setActiveRange] = useState<TimeRange>('today');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [interveningJobId, setInterveningJobId] = useState<string | null>(null);
  const [localJobs, setLocalJobs] = useState<Job[]>(MOCK_JOBS);

  // Strategic State
  const [serviceTargets, setServiceTargets] = useState<ServiceTarget[]>(INITIAL_SERVICE_TARGETS);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [rankingSort, setRankingSort] = useState<'achieve' | 'realized' | 'blocked'>('achieve');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const { user } = useAuth();
  const canModifyTargets = user?.role === UserRole.SUPER_ADMIN;

  const selectedInterventionJob = useMemo(() => localJobs.find(j => j.id === interveningJobId) || null, [localJobs, interveningJobId]);
  const baseFilteredJobs = localJobs.filter(j => isWithinRange(j.dateCreated, activeRange));

  // --- ANALYTICS ENGINE (Isolated for Perf) ---
  const analytics = useMemo(() => {
    const completedJobs = baseFilteredJobs.filter(j => j.status === JobStatus.COMPLETED);
    const realized = completedJobs.filter(j => j.billingStatus === BillingStatus.INVOICED).reduce((acc, j) => acc + (j.price || 0), 0);
    
    const serviceStats = serviceTargets.map(target => {
      const catJobs = completedJobs.filter(j => j.category === target.serviceType);
      const realizedCat = catJobs.filter(j => j.billingStatus === BillingStatus.INVOICED).reduce((acc, j) => acc + (j.price || 0), 0);
      const blockedCat = catJobs.filter(j => j.billingStatus === BillingStatus.PENDING).reduce((acc, j) => acc + (j.price || 0), 0);
      
      const targetVal = activeRange === 'this_month' ? target.monthly : (activeRange === 'this_week' || activeRange === 'last_7_days') ? target.weekly : target.daily;
      const progress = (realizedCat / targetVal) * 100;
      const potential = ((realizedCat + blockedCat) / targetVal) * 100;
      
      let mood: 'NEUTRAL' | 'FRICTION' | 'WINNING' = 'NEUTRAL';
      if (progress >= 100) mood = 'WINNING';
      else if (potential >= 100) mood = 'FRICTION';

      return { ...target, realized: realizedCat, blocked: blockedCat, currentTarget: targetVal, progress, potential, mood };
    });

    serviceStats.sort((a, b) => {
      if (rankingSort === 'achieve') return a.progress - b.progress;
      if (rankingSort === 'realized') return b.realized - a.realized;
      return b.blocked - a.blocked;
    });

    const totalTarget = serviceStats.reduce((acc, s) => acc + s.currentTarget, 0);
    return { realized, serviceStats, totalTarget };
  }, [baseFilteredJobs, activeRange, serviceTargets, rankingSort]);

  const targetPercentage = Math.min((analytics.realized / analytics.totalTarget) * 100, 100);

  // --- LEDGER LOGIC ---
  const breakdownData = useMemo(() => {
    let data = baseFilteredJobs.map(j => {
        const client = MOCK_CUSTOMERS.find(c => c.id === j.customerId)?.name || 'Unknown';
        const revStatus = j.billingStatus === BillingStatus.INVOICED ? 'Completed' : j.billingStatus === BillingStatus.PENDING ? 'On Hold' : 'Unbilled';
        return { ...j, client, revStatus, liquidityGrade: (j.holdReason === HoldReason.PENDING_CLIENT_SIGN || j.holdReason === HoldReason.MISSING_EVIDENCE) ? 'A' : 'B' };
    });
    if (categoryFilter) data = data.filter(d => d.category === categoryFilter);
    return data;
  }, [baseFilteredJobs, categoryFilter]);

  const rangeLabels: Record<TimeRange, string> = { today: 'Today', yesterday: 'Yesterday', this_week: 'This Week', last_7_days: 'Last 7 Days', this_month: 'This Month', custom: 'Custom Range' };

  return (
    <div className="space-y-6 animate-slide-in relative">
      
      {/* GLOBAL HUD */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center bg-white border border-slate-200 p-2 rounded-2xl shadow-sm gap-2">
        <div className="flex-1 flex items-center px-6 py-3 gap-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm"><Zap size={24} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Aggregated Revenue</p>
                <p className="text-xl font-mono font-black text-slate-900">KES {analytics.realized.toLocaleString()}</p>
              </div>
           </div>
           <div className="w-px h-8 bg-slate-100" />
           <div className="flex-1 space-y-2 max-w-xs">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Goal Achievement</span>
                <span className="text-[10px] font-mono font-black text-blue-600">{targetPercentage.toFixed(0)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-1000 shadow-lg shadow-blue-500/20" style={{ width: `${targetPercentage}%` }} />
              </div>
           </div>
        </div>
        <div className="relative p-2">
           <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} className="flex items-center gap-3 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md">
             <Calendar size={16} /> {rangeLabels[activeRange]} <ChevronDown size={14} />
           </button>
           {showFilterDropdown && (
             <div className="absolute top-full right-0 mt-3 w-52 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-1.5 animate-slide-in ring-1 ring-black/5">
               {(Object.keys(rangeLabels) as TimeRange[]).map((range) => (
                 <button key={range} onClick={() => { setActiveRange(range); setShowFilterDropdown(false); }} className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeRange === range ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>{rangeLabels[range]}</button>
               ))}
             </div>
           )}
        </div>
      </div>

      {/* STRATEGIC CARDS (Winning focused) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-10">
           <div><h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2"><Target size={20} className="text-blue-600" /> Service Liquidity Map</h3><p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Identifying the bridge to 100% velocity</p></div>
           <div className="flex gap-4 items-center">
              <button onClick={() => setIsConfigOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-all"><Settings size={14}/> Strategy</button>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
                {[{ id: 'achieve', label: 'Worst First' }, { id: 'realized', label: 'Top Realized' }].map(sort => (
                  <button key={sort.id} onClick={() => setRankingSort(sort.id as any)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${rankingSort === sort.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>{sort.label}</button>
                ))}
              </div>
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {analytics.serviceStats.map((item, idx) => (
             <div key={item.serviceType} onClick={() => setCategoryFilter(categoryFilter === item.serviceType ? null : item.serviceType)} className={`group relative p-6 rounded-3xl border-2 transition-all cursor-pointer ${categoryFilter === item.serviceType ? 'border-blue-600 bg-blue-50/20' : item.mood === 'WINNING' ? 'bg-emerald-50/20 border-emerald-100' : 'bg-white border-slate-100'} hover:shadow-xl`}>
                <div className="flex justify-between items-start mb-6">
                   <div className={`p-4 rounded-2xl ${item.mood === 'WINNING' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 shadow-sm'}`}>
                      {item.serviceType === 'Cleaning' && <SprayCan size={20} />}
                      {item.serviceType === 'Pest Control' && <Shield size={20} />}
                      {item.serviceType === 'Handyman' && <Hammer size={20} />}
                      {item.serviceType === 'Appliance Repair' && <Wrench size={20} />}
                      {item.serviceType === 'Construction' && <HardHat size={20} />}
                      {item.serviceType === 'Moving Services' && <Box size={20} />}
                   </div>
                   {item.mood === 'WINNING' && (
                     <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-100 shadow-sm animate-bounce">
                        <Star size={10} className="fill-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Target Peak</span>
                     </div>
                   )}
                </div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{item.serviceType}</p><h4 className="text-2xl font-black text-slate-900 font-mono">{item.progress.toFixed(0)}% <span className="text-[10px] text-slate-400">Achieved</span></h4></div>
                <div className="mt-6 space-y-4">
                   <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                      <div className={`h-full absolute left-0 transition-all duration-1000 ${item.mood === 'WINNING' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-blue-600'}`} style={{ width: `${Math.min(item.progress, 100)}%` }} />
                      <div className="h-full absolute transition-all duration-1000 bg-slate-900/10 border-r border-slate-900/20" style={{ left: `${Math.min(item.progress, 100)}%`, width: `${Math.min(item.potential - item.progress, 100 - item.progress)}%` }} />
                   </div>
                   <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Realized</p><p className="text-xs font-mono font-black text-slate-900">KES {item.realized.toLocaleString()}</p></div>
                      <div className="text-right"><p className="text-[9px] font-black text-amber-600 uppercase tracking-tighter">On Hold</p><p className="text-xs font-mono font-black text-amber-700">KES {item.blocked.toLocaleString()}</p></div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* AUDIT LEDGER */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <div><h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Financial Intervention Ledger</h3><p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{breakdownData.length} records in active scope</p></div>
          <button className="text-[10px] font-black text-slate-600 uppercase bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 shadow-sm"><Download size={14} /> Export Report</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr><th className="px-8 py-4">Job ID</th><th className="px-8 py-4">Client</th><th className="px-8 py-4">Value</th><th className="px-8 py-4">Liquidity Grade</th><th className="px-8 py-4">Goal Impact</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {breakdownData.map(job => {
                 const t = serviceTargets.find(st => st.serviceType === job.category);
                 const tv = activeRange === 'this_month' ? t?.monthly : (activeRange === 'this_week' || activeRange === 'last_7_days') ? t?.weekly : t?.daily;
                 const impact = tv ? (job.price / tv) * 100 : 0;
                 return (
                  <tr key={job.id} onClick={() => { if(job.revStatus === 'On Hold') setInterveningJobId(job.id); else onIntervene?.(job.id); }} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                    <td className="px-8 py-4 font-mono font-bold text-slate-500 text-[11px]">#{job.id}</td>
                    <td className="px-8 py-4 font-bold text-slate-900 text-xs">{job.client}</td>
                    <td className="px-8 py-4 font-mono font-bold text-slate-900 text-xs">KES {job.price.toLocaleString()}</td>
                    <td className="px-8 py-4"><span className={`px-2 py-0.5 rounded text-[10px] font-black ${job.liquidityGrade === 'A' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{job.liquidityGrade === 'A' ? 'Quick Resolve' : 'Verification Required'}</span></td>
                    <td className="px-8 py-4"><span className="text-[10px] font-black text-blue-600">+{impact.toFixed(1)}% Goal Shift</span></td>
                  </tr>
                 );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <TargetArchitectDrawer isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} targets={serviceTargets} onSave={setServiceTargets} canEdit={canModifyTargets} />
      {selectedInterventionJob && <TargetInterventionPanel job={selectedInterventionJob} onClose={() => setInterveningJobId(null)} onUpdate={(u, w) => { setLocalJobs(prev => prev.map(j => j.id === u.id ? u : j)); }} targetImpact={(() => { const t = serviceTargets.find(st => st.serviceType === selectedInterventionJob.category); const tv = activeRange === 'this_month' ? t?.monthly : (activeRange === 'this_week' || activeRange === 'last_7_days') ? t?.weekly : t?.daily; return tv ? (selectedInterventionJob.price / tv) * 100 : 0; })()} />}
      {interveningJobId && <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-[1px] z-[90]" onClick={() => setInterveningJobId(null)} />}
    </div>
  );
};

const AdminLiveOpsView: React.FC<{ onIntervene?: (jobId: string) => void }> = ({ onIntervene }) => {
  const slaBreaches = MOCK_JOBS.filter(j => j.slaDeadline && new Date(j.slaDeadline) < new Date() && j.status !== JobStatus.COMPLETED);
  const activeTechs = MOCK_TECHNICIANS.filter(t => t.status === 'On Job').length;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-xl p-5 text-white flex items-center justify-between border border-slate-800">
           <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Live Ops Status</p><div className="text-2xl font-bold mt-1">Optimal</div></div><Activity size={32} className="text-emerald-500" />
        </div>
        <div className={`rounded-xl p-5 text-white flex items-center justify-between transition-all ${slaBreaches.length > 0 ? 'bg-orange-600' : 'bg-slate-800'}`}>
           <div><p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none mb-1">Attention Required</p><div className="text-2xl font-bold mt-1">{slaBreaches.length} SLA risks</div></div><Clock size={32} className="text-white/20" />
        </div>
        <div className="bg-slate-800 rounded-xl p-5 text-white flex items-center justify-between">
           <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Field Personnel</p><div className="text-2xl font-bold mt-1">{activeTechs} / {MOCK_TECHNICIANS.length}</div></div><Users size={32} className="text-slate-600" />
        </div>
        <div className="bg-blue-600 rounded-xl p-5 text-white flex items-center justify-between shadow-lg shadow-blue-600/20">
           <div><p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none mb-1">Safety Index</p><div className="text-2xl font-bold mt-1">100%</div></div><Zap size={32} className="text-white/20" />
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<{ onCreateClick?: () => void; onIntervene?: (jobId: string) => void }> = ({ onCreateClick, onIntervene }) => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'ops' | 'revenue'>('ops');
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
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
      {isAdmin ? (activeView === 'ops' ? <AdminLiveOpsView onIntervene={onIntervene} /> : <RevenueIntelligenceView onIntervene={onIntervene} />) : <div className="p-20 text-center text-slate-400 italic">Facility dashboard loading...</div>}
    </div>
  );
};
