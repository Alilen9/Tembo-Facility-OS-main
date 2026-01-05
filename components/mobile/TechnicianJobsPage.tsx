import React, { useState, useMemo, useEffect } from 'react';
import { Job } from '@/types';
import { CompletedReportView } from '../client/CompletedReportView';
import { ArrowLeft, Star, Clock, Search } from '../Icons';
import { technicianService } from '../../services/technicianService';


const TechnicianJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await technicianService.getJobHistory();
        setJobs(data.jobs);
        console.log("Fetched job history:", data);
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const sortedJobs = useMemo(() => {
    let filtered = [...jobs];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(j => j.title.toLowerCase().includes(q) || ((j as any).customerName || '').toLowerCase().includes(q));
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.timeline?.find((e: any) => e.status === 'Job Completed')?.timestamp || 0).getTime();
        const dateB = new Date(b.timeline?.find((e: any) => e.status === 'Job Completed')?.timestamp || 0).getTime();
        return dateB - dateA;
      } else {
        return ((b as any).clientRating || b.userRating || 0) - ((a as any).clientRating || a.userRating || 0);
      }
    });
  }, [jobs, sortBy, searchQuery]);

  if (loading) {
    return <div className="p-10 text-center text-slate-400">Loading job history...</div>;
  }

  // 👉 If a job is selected → show details
  if (selectedJob) {
    // Extract images from timeline (copied from AdminDispatchConsole)
    const proofImages: { before: string; after: string } = { before: '', after: '' };
    if (selectedJob.timeline && Array.isArray(selectedJob.timeline)) {
      selectedJob.timeline.forEach((event: any) => {
        if (event.evidenceType === 'BEFORE' && event.evidenceUrl) proofImages.before = event.evidenceUrl;
        if (event.evidenceType === 'AFTER' && event.evidenceUrl) proofImages.after = event.evidenceUrl;
      });
    }

    return (
      <div className="bg-gray-50 min-h-screen pb-10">
        <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-20">
          <button onClick={() => setSelectedJob(null)} className="flex items-center gap-2 text-slate-600 font-bold text-sm"><ArrowLeft size={18} /> Back to Jobs</button>
        </div>
        <div className="p-4"><CompletedReportView job={selectedJob} proofImages={proofImages} /></div>
      </div>
    );
  }

  // 👉 Otherwise show list
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-extrabold mb-6">
        My Completed Jobs
      </h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search by title or client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
        />
      </div>

      <div className="flex gap-3 mb-6">
        <button 
          onClick={() => setSortBy('date')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${sortBy === 'date' ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
        >
          <Clock size={14} /> Recent
        </button>
        <button 
          onClick={() => setSortBy('rating')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${sortBy === 'rating' ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
        >
          <Star size={14} /> Top Rated
        </button>
      </div>

      {jobs.length === 0 ? (
        <p className="text-gray-500">No jobs completed yet.</p>
      ) : (
        <div className="grid gap-4">
          {sortedJobs.map(job => (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className="cursor-pointer bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{job.title}</h3>
                  <p className="text-sm text-gray-500">
                    {(job as any).customerName || 'Client'} • {job.location}
                  </p>
                </div>

                <div className="text-right">
                  <span className="block text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded mb-1">
                    {job.status}
                  </span>
                  {((job as any).clientRating || job.userRating) > 0 && (
                    <div className="flex items-center justify-end gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={12} 
                          fill={((job as any).clientRating || job.userRating || 0) >= star ? "currentColor" : "none"}
                          className={((job as any).clientRating || job.userRating || 0) >= star ? "text-yellow-400" : "text-slate-200"} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-400 mt-2">
                Completed on {job.timeline?.find((e: any) => e.status === 'Job Completed')?.timestamp ? new Date(job.timeline.find((e: any) => e.status === 'Job Completed').timestamp).toLocaleDateString() : 'Date N/A'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TechnicianJobsPage;
