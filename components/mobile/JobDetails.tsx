import React from 'react';
import { Job } from '@/types';

interface Props {
  job: Job;
  onBack: () => void;
}

const JobDetails: React.FC<Props> = ({ job, onBack }) => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="text-sm font-bold text-gray-600 hover:text-gray-900 mb-4"
      >
        ← Back to Jobs
      </button>

      <div className="bg-white rounded-xl shadow p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold">{job.title}</h1>
          <p className="text-gray-500">
            {job.category} • {job.location}
          </p>
        </div>

        <div>
          <h3 className="font-bold text-gray-700">Client</h3>
          <p>{job.clientName}</p>
        </div>

        <div>
          <h3 className="font-bold text-gray-700">Job Description</h3>
          <p className="text-gray-600">{job.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-semibold text-green-600">{job.status}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Completed On</p>
            <p className="font-semibold">
              {new Date(job.dateCompleted).toLocaleDateString()}
            </p>
          </div>

          {job.rating && (
            <div>
              <p className="text-sm text-gray-500">Client Rating</p>
              <p className="font-semibold">⭐ {job.rating} / 5</p>
            </div>
          )}
        </div>

        {job.images && job.images.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-700 mb-2">Job Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {job.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="Job"
                  className="rounded-lg object-cover h-32 w-full"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;
