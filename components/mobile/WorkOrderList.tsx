import React from 'react';



import { useAuth } from '../AuthContext';
import { AlertCircle, ArrowRight, CheckCircle2, Clock } from '../Icons';
import { MOCK_CUSTOMERS, MOCK_JOBS } from '@/constants';
import { Job, JobPriority, JobStatus, UserRole } from '@/types';


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

export const WorkOrderList: React.FC<WorkOrderListProps> = ({ onSelectJob, selectedJobId }) => {
  const { user } = useAuth();
  
  if (!user) return null;

  const getCustomerName = (id: string) => MOCK_CUSTOMERS.find(c => c.id === id)?.name || 'Unknown';

  // Filter Logic
  const visibleJobs = MOCK_JOBS.filter(job => {
    if (user.role === UserRole.CLIENT) {
      return job.customerId === user.relatedCustomerId;
    }
    return true; // Admin sees all
  });

  return (
    <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">
          {user.role === UserRole.CLIENT ? 'My Requests' : 'All Open Orders'}
        </h3>
        <div className="flex gap-2">
            <span className="px-2 py-1 rounded bg-slate-100 text-xs font-semibold text-slate-600">{visibleJobs.length} Found</span>
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
                    <span className="font-medium text-slate-600">{getCustomerName(job.customerId)}</span>
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
    </div>
  );
};
