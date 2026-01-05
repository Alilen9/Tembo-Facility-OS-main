import React, { useState } from 'react';
import { Job } from '@/types';
import JobDetails from './JobDetails';


interface Props {
  jobs: Job[];
}

const TechnicianJobsPage: React.FC<Props> = ({ jobs }) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // 👉 If a job is selected → show details
  if (selectedJob) {
    return (
      <JobDetails
        job={selectedJob}
        onBack={() => setSelectedJob(null)}
      />
    );
  }

  // 👉 Otherwise show list
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-extrabold mb-6">
        My Completed Jobs
      </h1>

      {jobs.length === 0 ? (
        <p className="text-gray-500">No jobs completed yet.</p>
      ) : (
        <div className="grid gap-4">
          {jobs.map(job => (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className="cursor-pointer bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{job.title}</h3>
                  <p className="text-sm text-gray-500">
                    {job.clientName} • {job.location}
                  </p>
                </div>

                <span className="text-sm font-bold text-green-600">
                  {job.status}
                </span>
              </div>

              <p className="text-sm text-gray-400 mt-2">
                Completed on {new Date(job.dateCompleted).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TechnicianJobsPage;
