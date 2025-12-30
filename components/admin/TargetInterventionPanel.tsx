import { Job, JobStatus, BillingStatus, HoldReason, TimeRange, INITIAL_SERVICE_TARGETS } from '@/types';
import React, { useState, useMemo } from 'react';
import { X, Target, AlertCircle, RefreshCw, CheckCircle2 } from '../Icons';


export const TargetInterventionPanel: React.FC<{ 
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
