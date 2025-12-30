import React, { useState, useMemo } from 'react';
import { MOCK_JOBS, MOCK_TECHNICIANS } from "@/constants";
import { JobStatus } from "@/types";
import { Activity, Clock, Users, Zap } from "../Icons";

export const AdminLiveOpsView: React.FC<{ onIntervene?: (jobId: string) => void }> = ({ onIntervene }) => {
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