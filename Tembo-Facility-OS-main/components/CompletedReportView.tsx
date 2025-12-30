import React, { useState } from 'react';
import { Job, Technician, UserRole } from '../types';
import { Star, Download, FileText, CheckCircle2, Wrench, Package, Shield, ClipboardList, Camera } from './Icons';
import { useAuth } from './AuthContext';
import { MOCK_CUSTOMERS } from '../constants';

interface CompletedReportViewProps {
  job: Job;
  technician?: Technician;
}

export const CompletedReportView: React.FC<CompletedReportViewProps> = ({ job, technician }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(job.userRating || 0);

  const isTechnician = user?.role === UserRole.TECHNICIAN;
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
  const clientName = MOCK_CUSTOMERS.find(c => c.id === job.customerId)?.name || "the client";

  return (
    <div className="space-y-8 animate-slide-in pb-10">
      
      {/* 1. Service Report Header */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList className="text-blue-600" size={24} />
          Service Report
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Final report generated on {new Date().toLocaleDateString()}
        </p>
      </div>
      
      {/* 2. Executive Summary Banner */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-5 flex items-start space-x-4">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wide">Work Completed</h3>
          <p className="text-sm text-emerald-800 mt-1 leading-relaxed">
             This job has been marked as complete. All tasks were executed according to safety standards.
          </p>
        </div>
      </div>

      {/* 3. Work Summary (New Section) */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Wrench size={18} className="text-slate-400" />
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Work Performed</h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-slate-700 leading-7">
            {job.workSummary || "Technician has not provided a detailed summary for this job."}
          </p>
        </div>
      </section>

      {/* 4. Proof of Work (Before / After) */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Camera size={18} className="text-slate-400" />
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Photographic Evidence</h3>
        </div>
        {job.proofImages ? (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 pl-1 uppercase">Before</span>
              <div className="aspect-video rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative group shadow-sm">
                <img src={job.proofImages.before} alt="Before" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="text-white text-xs font-bold border border-white px-3 py-1.5 rounded hover:bg-white/20">Expand</button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 pl-1 uppercase">After</span>
              <div className="aspect-video rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative group shadow-sm">
                <img src={job.proofImages.after} alt="After" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="text-white text-xs font-bold border border-white px-3 py-1.5 rounded hover:bg-white/20">Expand</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-400 italic bg-slate-50 p-6 rounded-xl border border-dashed border-slate-200 text-center">
            No images uploaded by technician.
          </div>
        )}
      </section>

      {/* 5. Materials Used (New Section) */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Package size={18} className="text-slate-400" />
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Materials & Parts</h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3 border-b border-slate-200">Item Name</th>
                <th className="px-5 py-3 border-b border-slate-200 w-32">Quantity</th>
                <th className="px-5 py-3 border-b border-slate-200 w-24">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {job.materialsUsed && job.materialsUsed.length > 0 ? (
                job.materialsUsed.map((mat) => (
                  <tr key={mat.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-900">{mat.name}</td>
                    <td className="px-5 py-3 text-slate-600">{mat.quantity}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs uppercase">{mat.unit}</td>
                  </tr>
                ))
              ) : (
                 <tr>
                   <td colSpan={3} className="px-5 py-4 text-slate-400 italic text-center">
                     No materials recorded.
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Compliance Certificates */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Shield size={18} className="text-slate-400" />
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Compliance Certificates</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {job.complianceDocs?.map((doc, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <FileText size={20} />
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-800">{doc.name}</p>
                   {doc.issuedDate && (
                     <p className="text-xs text-slate-500 mt-0.5">Issued: {doc.issuedDate}</p>
                   )}
                </div>
              </div>
              <button className="text-slate-400 group-hover:text-blue-600 transition-colors bg-slate-50 p-2 rounded-full group-hover:bg-blue-50">
                <Download size={18} />
              </button>
            </div>
          ))}
          {!job.complianceDocs && (
             <div className="col-span-2 text-sm text-slate-400 italic bg-slate-50 p-4 rounded border border-dashed border-slate-200">
              No compliance documents attached.
            </div>
          )}
        </div>
      </section>

      {/* 7. Rating - Hide for Admins */}
      {!isAdmin && (
        <section className="bg-slate-900 rounded-xl p-8 text-center text-white relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
             <Star size={120} />
          </div>
          
          {isTechnician ? (
            <>
              <h3 className="text-lg font-bold mb-2 relative z-10">Rate Client Interaction</h3>
              <p className="text-slate-400 text-sm mb-6 relative z-10">
                How was your experience working with <span className="text-white font-semibold">{clientName}</span>?
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold mb-2 relative z-10">Rate Your Experience</h3>
              <p className="text-slate-400 text-sm mb-6 relative z-10">
                How would you rate the service provided by <span className="text-white font-semibold">{technician?.name || 'our technician'}</span>?
              </p>
            </>
          )}
          
          <div className="flex justify-center space-x-3 mb-6 relative z-10">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`transition-all duration-200 transform hover:scale-110 ${
                  rating >= star ? 'text-yellow-400 fill-current' : 'text-slate-700 hover:text-slate-600'
                }`}
              >
                <Star size={36} fill={rating >= star ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
          
          <div className="relative z-10 max-w-md mx-auto">
             <textarea
              placeholder={isTechnician ? "Comments on site access, client behavior, etc..." : "Tell us more about the service (optional)..."}
              className="w-full text-sm p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-500"
              rows={3}
              defaultValue={isTechnician ? job.techFeedback : job.userFeedback}
            ></textarea>
            <button className="mt-4 w-full bg-blue-600 text-white text-sm font-bold py-3 rounded-lg hover:bg-blue-500 transition-colors shadow-lg">
              Submit Review
            </button>
          </div>
        </section>
      )}
    </div>
  );
};