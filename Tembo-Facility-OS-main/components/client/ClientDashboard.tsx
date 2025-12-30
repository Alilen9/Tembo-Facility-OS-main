import React, { useEffect, useState } from 'react';
import { clientService, ClientStats } from '../../services/clientService';
import { Activity, Clock, DollarSign, Plus, ArrowRight } from '../Icons';
import { JobStatus } from '../../types';

export const ClientDashboard: React.FC<{ onCreateClick?: () => void }> = ({ onCreateClick }) => {
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await clientService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load client stats", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 animate-pulse">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 font-medium mt-1">Here is what's happening with your facilities today.</p>
        </div>
        <button 
          onClick={onCreateClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={18} /> New Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Activity size={24} /></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active</span>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">{stats?.activeJobsCount || 0}</div>
          <div className="text-sm text-slate-500 font-medium">Jobs in progress</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock size={24} /></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending</span>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">{stats?.pendingActionsCount || 0}</div>
          <div className="text-sm text-slate-500 font-medium">Actions required</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign size={24} /></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Spend</span>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">KES {stats?.totalSpend.toLocaleString() || 0}</div>
          <div className="text-sm text-slate-500 font-medium">This month</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-900">Recent Activity</h3>
          <button className="text-blue-600 text-xs font-bold uppercase tracking-widest hover:text-blue-700">View All</button>
        </div>
        <div className="divide-y divide-slate-100">
          {stats?.recentJobs.map(job => (
            <div key={job.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                  job.status === JobStatus.COMPLETED ? 'bg-emerald-500' : 
                  job.status === JobStatus.IN_PROGRESS ? 'bg-blue-500' : 'bg-slate-400'
                }`}>
                  {job.category.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{job.id} • {new Date(job.dateCreated).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  job.status === JobStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 
                  job.status === JobStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {job.status.replace('_', ' ')}
                </span>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
          ))}
          {(!stats?.recentJobs || stats.recentJobs.length === 0) && (
            <div className="p-8 text-center text-slate-400 text-sm">No recent activity found.</div>
          )}
        </div>
      </div>
    </div>
  );
};