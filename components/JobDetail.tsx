import React, { useState } from 'react';
import { Job, JobStatus, JobPriority } from '../types';
import { MOCK_CUSTOMERS, MOCK_TECHNICIANS } from '../constants';
import { X, AlertTriangle, MessageSquare, Phone, Activity, Clock } from './Icons';
import { JobTrackingView } from './JobTrackingView';
import { CompletedReportView } from './CompletedReportView';

export const JobDetail: React.FC<{ job: Job; onClose: () => void; onUpdateJob: (job: Job) => void }> = ({ job, onClose }) => {
  const customer = MOCK_CUSTOMERS.find(c => c.id === job.customerId);
  const tech = MOCK_TECHNICIANS.find(t => t.id === job.technicianId);
  const isCompleted = job.status === JobStatus.COMPLETED;
  const isBreached = job.slaDeadline && new Date(job.slaDeadline) < new Date() && !isCompleted;

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200 shadow-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-white shrink-0">
        <div>
          <div className="flex items-center gap-3">
             <span className="text-xl font-bold text-slate-900">Ticket #{job.id}</span>
             <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{job.status}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">{customer?.name} • Site: {customer?.address.split(',')[0]}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-800 p-1 rounded hover:bg-slate-100 transition-colors"><X size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
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

        {isCompleted ? <CompletedReportView job={job} technician={tech} /> : <JobTrackingView job={job} technician={tech} />}
      </div>
      
      {!isCompleted && (
        <div className="p-5 border-t border-slate-200 bg-white shrink-0">
          <div className="flex space-x-3">
            <button className="flex-1 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-50 shadow-sm flex items-center justify-center gap-2">
              <MessageSquare size={16} /> Broadcast Nudge
            </button>
            <button className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-800 shadow-lg flex items-center justify-center gap-2">
              <Activity size={16} /> Intervene
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
