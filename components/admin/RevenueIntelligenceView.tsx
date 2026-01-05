import { Job, ServiceTarget, UserRole, JobStatus, BillingStatus, HoldReason, TimeRange, INITIAL_SERVICE_TARGETS } from '@/types';
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Zap, Calendar, ChevronDown, Target, Settings, SprayCan, Shield, Hammer, Wrench, HardHat, Box, Star, Download } from '../Icons';
import { isWithinRange } from '@/utils/range';
import { TargetArchitectDrawer } from './targetArchitectDrawer';
import { TargetInterventionPanel } from './TargetInterventionPanel';
import { technicianService } from '../../services/technicianService';

export const RevenueIntelligenceView: React.FC<{ onIntervene?: (jobId: string) => void }> = ({ onIntervene }) => {
  const [activeRange, setActiveRange] = useState<TimeRange>('today');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [interveningJobId, setInterveningJobId] = useState<string | null>(null);
  const [localJobs, setLocalJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Strategic State
  const [serviceTargets, setServiceTargets] = useState<ServiceTarget[]>(INITIAL_SERVICE_TARGETS);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [rankingSort, setRankingSort] = useState<'achieve' | 'realized' | 'blocked'>('achieve');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const { user } = useAuth();
  const canModifyTargets = user?.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const jobs = await technicianService.getAllJobs();
        setLocalJobs(jobs);
      } catch (error) {
        console.error("Failed to fetch revenue data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRevenueData();
  }, []);

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
        const client = (j as any).customerName || 'Unknown';
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
        <div className="flex-1 flex flex-col md:flex-row items-start md:items-center px-4 md:px-6 py-3 gap-4 md:gap-8">
           <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm shrink-0"><Zap size={24} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Aggregated Revenue</p>
                <p className="text-xl font-mono font-black text-slate-900">KES {analytics.realized.toLocaleString()}</p>
              </div>
           </div>
           <div className="hidden md:block w-px h-8 bg-slate-100" />
           <div className="md:hidden w-full h-px bg-slate-100" />
           <div className="flex-1 space-y-2 w-full md:max-w-xs">
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
           <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} className="w-full md:w-auto justify-center flex items-center gap-3 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md">
             <Calendar size={16} /> {rangeLabels[activeRange]} <ChevronDown size={14} />
           </button>
           {showFilterDropdown && (
             <div className="absolute top-full right-0 left-0 md:left-auto mt-3 w-full md:w-52 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-1.5 animate-slide-in ring-1 ring-black/5">
               {(Object.keys(rangeLabels) as TimeRange[]).map((range) => (
                 <button key={range} onClick={() => { setActiveRange(range); setShowFilterDropdown(false); }} className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeRange === range ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>{rangeLabels[range]}</button>
               ))}
             </div>
           )}
        </div>
      </div>

      {/* STRATEGIC CARDS (Winning focused) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
           <div><h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2"><Target size={20} className="text-blue-600" /> Service Liquidity Map</h3><p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Identifying the bridge to 100% velocity</p></div>
           <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
              <button onClick={() => setIsConfigOpen(true)} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-all"><Settings size={14}/> Strategy</button>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner flex-1 md:flex-none">
                {[{ id: 'achieve', label: 'Worst First' }, { id: 'realized', label: 'Top Realized' }].map(sort => (
                  <button key={sort.id} onClick={() => setRankingSort(sort.id as any)} className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${rankingSort === sort.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>{sort.label}</button>
                ))}
              </div>
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
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
        <div className="px-4 md:px-8 py-4 md:py-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/30 gap-4">
          <div><h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Financial Intervention Ledger</h3><p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{breakdownData.length} records in active scope</p></div>
          <button className="w-full md:w-auto justify-center text-[10px] font-black text-slate-600 uppercase bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 shadow-sm"><Download size={14} /> Export Report</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto min-w-[800px]">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr><th className="px-4 md:px-8 py-4">Job ID</th><th className="px-4 md:px-8 py-4">Client</th><th className="px-4 md:px-8 py-4">Value</th><th className="px-4 md:px-8 py-4">Liquidity Grade</th><th className="px-4 md:px-8 py-4">Goal Impact</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {breakdownData.map(job => {
                 const t = serviceTargets.find(st => st.serviceType === job.category);
                 const tv = activeRange === 'this_month' ? t?.monthly : (activeRange === 'this_week' || activeRange === 'last_7_days') ? t?.weekly : t?.daily;
                 const impact = tv ? (job.price / tv) * 100 : 0;
                 return (
                  <tr key={job.id} onClick={() => { if(job.revStatus === 'On Hold') setInterveningJobId(job.id); else onIntervene?.(job.id); }} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                    <td className="px-4 md:px-8 py-4 font-mono font-bold text-slate-500 text-[11px]">#{job.id}</td>
                    <td className="px-4 md:px-8 py-4 font-bold text-slate-900 text-xs">{job.client}</td>
                    <td className="px-4 md:px-8 py-4 font-mono font-bold text-slate-900 text-xs">KES {job.price.toLocaleString()}</td>
                    <td className="px-4 md:px-8 py-4"><span className={`px-2 py-0.5 rounded text-[10px] font-black ${job.liquidityGrade === 'A' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{job.liquidityGrade === 'A' ? 'Quick Resolve' : 'Verification Required'}</span></td>
                    <td className="px-4 md:px-8 py-4"><span className="text-[10px] font-black text-blue-600">+{impact.toFixed(1)}% Goal Shift</span></td>
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