import React, {useState, useEffect} from 'react';
import { Job, JobPriority, JobStatus, UserRole } from '../../types';
import { Clock, CheckCircle2, AlertCircle, ArrowRight, ChevronLeft, ChevronRight, Search } from '../Icons';
import { useAuth } from '../AuthContext';
import { clientService, ClientStats } from '@/services/clientService';

interface WorkOrderListProps {
  onSelectJob: (job: Job) => void;
  selectedJobId: string | null;
}

const PriorityBadge: React.FC<{ priority: JobPriority }> = ({ priority }) => {
  const styles = {
    [JobPriority.LOW]: 'bg-slate-100 text-slate-600 border-slate-200',
    [JobPriority.MEDIUM]: 'bg-blue-50 text-blue-700 border-blue-100',
    [JobPriority.HIGH]: 'bg-orange-50 text-orange-700 border-orange-100',
    [JobPriority.CRITICAL]: 'bg-red-50 text-red-700 border-red-100',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${styles[priority]}`}>
      {priority}
    </span>
  );
};

const StatusIcon: React.FC<{ status: JobStatus }> = ({ status }) => {
  switch (status) {
    case JobStatus.COMPLETED: return <CheckCircle2 size={16} className="text-emerald-500" />;
    case JobStatus.PENDING: return <AlertCircle size={16} className="text-orange-500" />;
    case JobStatus.SCHEDULED: return <Clock size={16} className="text-blue-500" />;
    default: return <Clock size={16} className="text-slate-400" />;
  }
};

export const ClientRequests: React.FC<WorkOrderListProps> = ({ onSelectJob, selectedJobId }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  
  if (!user) return null;

    useEffect(() => {
      const loadStats = async () => {
        setLoading(true);
        try {
          const data = await clientService.getJobs(page, 10, searchQuery);
          setJobs(data.jobs || []);
          setTotalPages(data.totalPages || 1);
        } catch (error) {
          console.error("Failed to load client stats", error);
        } finally {
          setLoading(false);
        }
      };
      loadStats();
    }, [page, searchQuery]);
  
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-400 animate-pulse">Loading your recent requests</div>
        </div>
      );
    }

  const visibleJobs = jobs.filter(job => {
    // Backend handles filtering by user
    return true; 
  });

  return (
    <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">
            {user.role === UserRole.CLIENT ? 'My Requests' : 'All Open Orders'}
          </h3>
          <div className="relative">
             <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search requests..." 
               value={searchQuery}
               onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
               className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-48 transition-all"
             />
          </div>
        </div>
        <div className="flex gap-2">
            <span className="px-2 py-1 rounded bg-slate-100 text-xs font-semibold text-slate-600">Page {page} of {totalPages}</span>
        </div>
      </div>
      <ul className="divide-y divide-slate-100 overflow-y-auto">
        {visibleJobs.map((job) => {
          const isSelected = selectedJobId === job.id;
          return (
            <li 
              key={job.id} 
              onClick={() => onSelectJob(job)}
              className={`group transition-all cursor-pointer hover:bg-slate-50 ${
                isSelected ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className={`px-5 py-4 flex items-center justify-between border-l-[3px] transition-colors ${
                isSelected ? 'border-tembo-brand pl-[17px]' : 'border-transparent group-hover:border-slate-300'
              }`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <StatusIcon status={job.status} />
                    <span className="text-xs font-mono text-slate-400">#{job.id}</span>
                    <PriorityBadge priority={job.priority} />
                  </div>
                  <p className={`text-sm font-medium truncate ${isSelected ? 'text-tembo-brand' : 'text-slate-900'}`}>
                    {job.title}
                  </p>
                  <div className="flex items-center mt-1 text-xs text-slate-500">
                    <span className="font-medium text-slate-600">{job.customerId}</span>
                    <span className="mx-1.5 text-slate-300">•</span>
                    <span className="truncate">{new Date(job.dateCreated).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <ArrowRight size={16} className="text-slate-400" />
                </div>
              </div>
            </li>
          );
        })}
        
        {visibleJobs.length === 0 && (
          <li className="p-8 text-center text-slate-500 text-sm">
            No jobs found.
          </li>
        )}
      </ul>
      
      {/* Pagination Controls */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-500"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs font-medium text-slate-500">Page {page}</span>
        <button 
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-500"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
