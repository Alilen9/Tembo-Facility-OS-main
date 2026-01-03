import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Job, JobStatus, JobPriority } from '../types';
import { clientService } from '../services/clientService';
import { X, AlertTriangle, MessageSquare, Phone, Activity, Clock } from './Icons';
import { JobTrackingView } from './JobTrackingView';
import { CompletedReportView } from './CompletedReportView';

interface ExtendedJob extends Job {
  customerName?: string;
  technicianName?: string;
}

export const JobDetail: React.FC<{ job: Job; onClose: () => void; onUpdateJob: (job: Job) => void; onIntervene?: (job: Job) => void }> = ({ job, onClose, onIntervene }) => {
  const extendedJob = job as ExtendedJob;
  const [isNudging, setIsNudging] = useState(false);
  const [showInterveneConfirm, setShowInterveneConfirm] = useState(false);
  
  const customer = {
    name: extendedJob.customerName || 'Unknown Customer',
    address: job.location || 'No Location Provided'
  };

  const tech = job.technicianId ? {
    id: job.technicianId,
    name: extendedJob.technicianName || 'Technician',
    role: 'Field Technician',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(extendedJob.technicianName || 'Tech')}&background=0D8ABC&color=fff`
  } : undefined;

  const isCompleted = job.status === JobStatus.COMPLETED;
  const isBreached = job.slaDeadline && new Date(job.slaDeadline) < new Date() && !isCompleted;

  const handleBroadcastNudge = async () => {
    setIsNudging(true);
    try {
      await clientService.sendNudge(job.id);
      toast.success('Nudge broadcasted to field team');
    } catch (error) {
      toast.error('Failed to broadcast nudge');
    } finally {
      setIsNudging(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200 shadow-2xl overflow-hidden relative">
      <div className="px-4 py-4 md:px-6 md:py-5 border-b border-slate-200 flex items-start justify-between bg-white shrink-0">
        <div>
          <div className="flex items-center gap-3">
             <span className="text-xl font-bold text-slate-900">Ticket #{job.id}</span>
             <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{job.status}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">{customer.name} • Site: {customer.address}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-800 p-1 rounded hover:bg-slate-100 transition-colors"><X size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* CRITICAL BLOCKERS (Action-Oriented) */}
        {/* Fix: Changed 'isBreach' to 'isBreached' to match the variable definition on line 13 */}
        {isBreached && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-pulse">
            <h4 className="text-sm font-bold text-red-800 flex items-center gap-2"><AlertTriangle size={16}/> Critical SLA Breach</h4>
            <p className="text-xs text-red-700 mt-1">This job is overdue. Immediate dispatch intervention required to restore customer confidence.</p>
            <div className="mt-3 flex gap-2">
               <button className="bg-red-700 text-white px-3 py-1.5 rounded text-[10px] font-bold">Contact Tech</button>
               <button className="bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded text-[10px] font-bold">Notify Client</button>
            </div>
          </div>
        )}

        <section className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Primary Request</h3>
          <h4 className="font-bold text-slate-900 mb-1">{job.title}</h4>
          <p className="text-sm text-slate-600 leading-relaxed">{job.description}</p>
        </section>

        {isCompleted ? <CompletedReportView job={job} technician={tech as any} /> : <JobTrackingView job={job} technician={tech as any} />}
      </div>
      
      {!isCompleted && (
        <div className="p-4 md:p-5 border-t border-slate-200 bg-white shrink-0">
          <div className="flex flex-col md:flex-row gap-3">
            <button 
              onClick={handleBroadcastNudge}
              disabled={isNudging}
              className="flex-1 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-50 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <MessageSquare size={16} /> {isNudging ? 'Sending...' : 'Broadcast Nudge'}
            </button>
            {onIntervene && (
              <button onClick={() => setShowInterveneConfirm(true)} className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-800 shadow-lg flex items-center justify-center gap-2">
                <Activity size={16} /> Intervene
              </button>
            )}
          </div>
        </div>
      )}

      {/* Intervention Confirmation Modal */}
      {showInterveneConfirm && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full border border-slate-200">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Confirm Intervention</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Are you sure you want to take control of this job? This will override the current automated workflow.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowInterveneConfirm(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => { if (onIntervene) onIntervene(job); setShowInterveneConfirm(false); }}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 shadow-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
