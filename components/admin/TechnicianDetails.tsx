import React from 'react';
import { Technician } from '@/types';

interface TechnicianDetailsProps {
  technician: Technician;
  onBack: () => void;
  onUpdated: (technician: Technician) => void;
}

export const TechnicianDetails: React.FC<TechnicianDetailsProps> = ({
  technician,
  onBack,
}) => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="text-sm font-bold text-gray-600 hover:text-gray-900 mb-4"
      >
        &larr; Back to Technicians
      </button>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center space-x-6">
          <img
            src={(technician as any).profile_photo || technician.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(technician.name)}&background=random`}
            alt={technician.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
          />
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">
              {technician.name}
            </h1>
            <p
              className={`mt-1 text-lg font-semibold ${
                technician.status === 'Available'
                  ? 'text-green-600'
                  : 'text-yellow-600'
              }`}
            >
              {technician.status}
            </p>
          </div>
        </div>

      <div className="mt-8">
  <h3 className="text-lg font-bold text-gray-700 border-b pb-2">
    Personal & Registration Details
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
    <div>
      <p className="text-sm text-gray-500">First Name</p>
      <p className="font-semibold">{technician.firstName || 'N/A'}</p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Last Name</p>
      <p className="font-semibold">{technician.lastName || 'N/A'}</p>
    </div>

    <div>
      <p className="text-sm text-gray-500">National ID</p>
      <p className="font-semibold">{technician.nationalId || 'N/A'}</p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Phone</p>
      <p className="font-semibold">{technician.phone || 'N/A'}</p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Email</p>
      <p className="font-semibold">{technician.email || 'N/A'}</p>
    </div>

    <div>
      <p className="text-sm text-gray-500">County</p>
      <p className="font-semibold">{technician.county || 'N/A'}</p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Sub-county</p>
      <p className="font-semibold">{technician.subCounty || 'N/A'}</p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Initiation Month</p>
      <p className="font-semibold">{technician.initiationMonth || 'N/A'}</p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Fiscal Month</p>
      <p className="font-semibold">{technician.fiscalMonth || 'N/A'}</p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Licence / Certificate ID</p>
      <p className="font-semibold">
        {technician.licenseId || technician.certificateId || 'N/A'}
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Licence Expiry Date</p>
      <p className="font-semibold">
        {technician.licenseExpiryDate
          ? new Date(technician.licenseExpiryDate).toLocaleDateString()
          : 'N/A'}
      </p>
    </div>
  </div>
</div>


        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-700 border-b pb-2">
            Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <p className="text-sm text-gray-500">Audit Pass Rate</p>
              <p className="font-semibold">
                {technician.auditPassRate !== undefined
                  ? `${technician.auditPassRate}%`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Recent Defects</p>
              <p className="font-semibold">
                {technician.recentDefects || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDetails;