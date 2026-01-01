import React, { useState, useEffect } from 'react';
import { Job, JobPriority, JobStatus, UserRole } from '../../types';
import { Clock, CheckCircle2, AlertCircle, ArrowRight, ChevronLeft, ChevronRight, Search } from '../Icons';
import { useAuth } from '../AuthContext';
import { clientService } from '@/services/clientService';

interface WorkOrderListProps {
  onSelectJob: (job: Job) => void;
  selectedJobId: string | null;
}

// ================= Badges =================
const PriorityBadge: React.FC<{ priority: JobPriority }> = ({ priority }) => {
  const styles = {
    [JobPriority.LOW]: 'bg-slate-100 text-slate-600 border-slate-200',
    [JobPriority.MEDIUM]: 'bg-blue-50 text-blue-700 border-blue-100',
    [JobPriority.HIGH]: 'bg-orange-50 text-orange-700 border-orange-100',
    [JobPriority.CRITICAL]: 'bg-red-50 text-red-700 border-red-100',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border ${styles[priority]}`}>
      {priority}
    </span>
  );
};

const StatusIcon: React.FC<{ status: JobStatus }> = ({ status }) => {
  switch (status) {
    case JobStatus.COMPLETED:
      return <CheckCircle2 size={16} className="text-emerald-500" />;
    case JobStatus.PENDING:
      return <AlertCircle size={16} className="text-orange-500" />;
    case JobStatus.SCHEDULED:
      return <Clock size={16} className="text-blue-500" />;
    default:
      return <Clock size={16} className="text-slate-400" />;
  }
};

// ================= Main Component =================
export const ClientRequests: React.FC<WorkOrderListProps> = ({ onSelectJob, selectedJobId }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  if (!user) return null;

  // ================= Fetch Jobs =================
  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const data = await clientService.getJobs(page, 10, searchQuery);
        setJobs(data.jobs || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, [page, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 animate-pulse text-sm">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ================= Header ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          {user.role === UserRole.CLIENT ? 'My Requests' : 'All Open Orders'}
        </h3>
        <div className="relative w-full sm:w-auto">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-10 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all w-full sm:w-64"
          />
        </div>
      </div>

      {/* ================= Job Cards ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {jobs.length === 0 && (
          <div className="col-span-full text-center text-slate-500 p-6 bg-white rounded-lg border border-slate-200">
            No jobs found.
          </div>
        )}
        {jobs.map((job) => {
          const isSelected = selectedJobId === job.id;
          return (
            <div
              key={job.id}
              onClick={() => onSelectJob(job)}
              className={`group cursor-pointer bg-white rounded-lg border p-3 sm:p-4 shadow-sm hover:shadow-md transition-all border-slate-200 ${
                isSelected ? 'border-blue-500 ring-1 ring-blue-200' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1 sm:gap-2">
                  <StatusIcon status={job.status} />
                  <span className="text-[10px] sm:text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Ticket #{job.id}</span>
                  <PriorityBadge priority={job.priority} />
                </div>
                <ArrowRight size={18} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className={`mt-2 font-semibold text-sm sm:text-base truncate ${isSelected ? 'text-blue-600' : 'text-slate-900'}`}>
                {job.title}
              </h4>
              <div className="mt-1 text-[10px] sm:text-xs text-slate-500 flex justify-between items-center">
                <span>{job.customerId}</span>
                <span>{new Date(job.dateCreated).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= Pagination ================= */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-3 sm:mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-slate-600 px-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
