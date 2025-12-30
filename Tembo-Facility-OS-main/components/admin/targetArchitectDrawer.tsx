import React, { useState, useMemo } from 'react';
import { ServiceTarget } from "@/types";
import { X } from "../Icons";

export const TargetArchitectDrawer: React.FC<{ 
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