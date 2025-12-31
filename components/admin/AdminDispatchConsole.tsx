import React, { useState, useMemo, useEffect } from 'react';
import { Job, JobPriority, JobStatus, User } from '../../types';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import { Clock, Search, MoreHorizontal, AlertTriangle, Zap, Thermometer, Droplets, Hammer, Shield, SprayCan, ArrowRight, UserCheck, Bell, MapPin, Camera, MessageSquare, Activity, List, ChevronRight } from '../Icons';

const getCategoryIcon = (category?: string) => {
  switch (category?.toLowerCase()) {
    case 'hvac': return <Thermometer size={14} />;
    case 'plumbing': return <Droplets size={14} />;
    case 'electrical': return <Zap size={14} />;
    case 'security': return <Shield size={14} />;
    case 'cleaning': return <SprayCan size={14} />;
    default: return <Hammer size={14} />;
  }
};

const PriorityStrip: React.FC<{ priority: JobPriority }> = ({ priority }) => {
  const styles = {
    [JobPriority.LOW]: 'bg-slate-300',
    [JobPriority.MEDIUM]: 'bg-blue-500',
    [JobPriority.HIGH]: 'bg-orange-500',
    [JobPriority.CRITICAL]: 'bg-red-600 animate-pulse',
  };
  return <div className={`w-1.5 h-full absolute left-0 top-0 bottom-0 rounded-l ${styles[priority]}`} />;
};

const SLACountdown: React.FC<{ deadline?: string, status: JobStatus }> = ({ deadline, status }) => {
  if (status === JobStatus.COMPLETED) return <span className="text-emerald-600 font-bold text-xs uppercase tracking-tight">Resolved</span>;
  if (!deadline) return <span className="text-slate-300 font-mono text-xs">-</span>;
  
  const now = new Date();
  const dead = new Date(deadline);
  const diffMs = dead.getTime() - now.getTime();
  const diffHrs = diffMs / (1000 * 60 * 60);
  const isBreach = diffHrs < 0;

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded font-bold border transition-colors ${
      isBreach ? 'text-red-700 bg-red-100 border-red-200 animate-pulse' : 'text-slate-700 bg-slate-50 border-slate-200'
    }`}>
      {isBreach ? <AlertTriangle size={14} /> : <Clock size={14} />}
      <span className="text-xs font-mono uppercase">
        {isBreach ? 'Breach' : ''} {Math.abs(Math.floor(diffHrs))}h {Math.abs(Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)))}m
      </span>
    </div>
  );
};

export const AdminDispatchConsole: React.FC<{ 
  onDispatchClick: (job: Job) => void,
  onAssignTech?: (jobId: string, techId: string) => void 
}> = ({ onDispatchClick, onAssignTech }) => {
  const [viewMode, setViewMode] = useState<'queue' | 'live'>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [technicians, setTechnicians] = useState<(User & { status: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [jobsData, techsData] = await Promise.all([
        adminService.getDispatchJobs(),
        adminService.getTechnicians()
      ]);
      console.log("Fetched dispatch data", { jobsData, techsData });
      setJobs(jobsData);
      setTechnicians(techsData);
    } catch (error) {
      console.error("Failed to fetch dispatch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const handleAssign = async (jobId: string, techId: string) => {
    try {
      await adminService.assignTechnician(jobId, techId);
      toast.success("Technician assigned");
      fetchData();
      if (onAssignTech) onAssignTech(jobId, techId);
    } catch (error) {
      toast.error("Assignment failed");
    }
  };

  const queueData = useMemo(() => {
    let data = [...jobs];
    data.sort((a, b) => {
      const pWeight = { [JobPriority.CRITICAL]: 10, [JobPriority.HIGH]: 5, [JobPriority.MEDIUM]: 2, [JobPriority.LOW]: 1 };
      const weightA = pWeight[a.priority] + (a.technicianId ? 0 : 20); 
      const weightB = pWeight[b.priority] + (b.technicianId ? 0 : 20);
      return weightB - weightA;
    });
    return data.filter(job => job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.id.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [jobs, searchQuery]);

  if (loading && jobs.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-400">Loading dispatch console...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -m-6 bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-4">
           <div className="flex bg-slate-100 p-1 rounded-lg">
             <button onClick={() => setViewMode('queue')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'queue' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Queue</button>
             <button onClick={() => setViewMode('live')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'live' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>Live Monitor</button>
           </div>
           <div className="relative">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input type="text" placeholder="Global filter..." className="pl-9 pr-3 py-1.5 text-xs font-medium border border-slate-200 rounded-md w-64 focus:ring-2 focus:ring-blue-500/20" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
           </div>
        </div>
        <button className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-md">+ New Job</button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'queue' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="w-1"></th>
                  <th className="px-6 py-3">SLA Status</th>
                  <th className="px-6 py-3">Work Order Context</th>
                  <th className="px-6 py-3">Operations</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queueData.map(job => (
                  <tr key={job.id} className="group hover:bg-slate-50 relative">
                    <td className="relative w-1"><PriorityStrip priority={job.priority} /></td>
                    <td className="px-6 py-4"><SLACountdown deadline={job.slaDeadline} status={job.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded text-slate-500">{getCategoryIcon(job.category)}</div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{job.title}</p>
                          <p className="text-xs text-slate-400">#{job.id} • {(job as any).customerName || 'Client'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {job.technicianId ? (
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
                              {technicians.find(t => t.id === job.technicianId)?.name.charAt(0)}
                           </div>
                           <span className="text-xs font-bold text-slate-700">{technicians.find(t => t.id === job.technicianId)?.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                           <div className="text-[9px] font-bold text-slate-400 uppercase mr-2">Top Match:</div>
                           {technicians.filter(t => t.status === 'Available').slice(0, 3).map(tech => (
                             <button 
                                key={tech.id}
                                onClick={() => handleAssign(job.id, tech.id)}
                                title={`One-Click Assign to ${tech.name}`}
                                className="group/chip relative px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                             >
                               {tech.name.split(' ')[0]}
                             </button>
                           ))}
                           <button onClick={() => onDispatchClick(job)} className="p-1 text-slate-400 hover:text-blue-600 ml-1">
                             <ChevronRight size={14} />
                           </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'live' && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
             {jobs.map(job => {
               const isAtRisk = job.priority === JobPriority.CRITICAL || (job.slaDeadline && new Date(job.slaDeadline) < new Date());
               const tech = technicians.find(t => t.id === job.technicianId);
               
               if (!isAtRisk) {
                 return (
                   <div key={job.id} className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                        {getCategoryIcon(job.category)}
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter truncate w-full text-center">#{job.id} Normal</span>
                   </div>
                 );
               }

               return (
                 <div key={job.id} className="col-span-2 bg-white p-4 rounded-xl border-2 border-red-500 shadow-lg ring-4 ring-red-500/10 animate-pulse-slow">
                    <div className="flex justify-between items-start mb-3">
                       <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-red-100 text-red-600 rounded-lg"><AlertTriangle size={16} /></span>
                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-none">Job #{job.id} Critical</p>
                            <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider mt-1">SLA At Risk</p>
                          </div>
                       </div>
                       <button onClick={() => onDispatchClick(job)} className="text-[10px] font-bold text-blue-600 uppercase hover:underline">Intervene</button>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg mb-3">
                       <p className="text-xs text-slate-700 font-medium truncate">{job.title}</p>
                    </div>
                    {tech && (
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                              {tech.name.charAt(0)}
                            </div>
                            <span className="text-[10px] font-bold text-slate-700">{tech.name}</span>
                         </div>
                         <div className="text-[10px] font-mono text-slate-400">ETA: 12m</div>
                      </div>
                    )}
                 </div>
               );
             })}
          </div>
        )}
      </div>
    </div>
  );
};
