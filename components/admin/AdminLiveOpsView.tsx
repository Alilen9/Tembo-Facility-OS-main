import React, { useState, useEffect } from 'react';
import { adminService, AdminDashboardStats } from '../../services/adminService';
import { Activity, Clock, Users, Zap } from "../Icons";

export const AdminLiveOpsView: React.FC<{ onIntervene?: (jobId: string) => void }> = ({ onIntervene }) => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        console.log("Loaded admin stats", data);
        setStats(data);
      } catch (error) {
        console.error("Failed to load admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading live operations...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-xl p-5 text-white flex items-center justify-between border border-slate-800">
           <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Live Ops Status</p><div className="text-2xl font-bold mt-1">{stats?.liveOpsStatus || 'Optimal'}</div></div><Activity size={32} className={stats?.liveOpsStatus === 'Optimal' ? "text-emerald-500" : "text-orange-500"} />
        </div>
        <div className={`rounded-xl p-5 text-white flex items-center justify-between transition-all ${(stats?.slaBreaches || 0) > 0 ? 'bg-orange-600' : 'bg-slate-800'}`}>
           <div><p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none mb-1">Attention Required</p><div className="text-2xl font-bold mt-1">{stats?.slaBreaches || 0} SLA risks</div></div><Clock size={32} className="text-white/20" />
        </div>
        <div className="bg-slate-800 rounded-xl p-5 text-white flex items-center justify-between">
           <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Field Personnel</p><div className="text-2xl font-bold mt-1">{stats?.activeTechs || 0} Active</div></div><Users size={32} className="text-slate-600" />
        </div>
        <div className="bg-blue-600 rounded-xl p-5 text-white flex items-center justify-between shadow-lg shadow-blue-600/20">
           <div><p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none mb-1">Safety Index</p><div className="text-2xl font-bold mt-1">{stats?.safetyIndex || 100}%</div></div><Zap size={32} className="text-white/20" />
        </div>
      </div>
    </div>
  );
};