import React from 'react';
import { Technician } from '@/types';
import { ExternalLink } from 'lucide-react';

interface TechnicianDetailsProps {
  technician: Technician;
  onBack: () => void;
  onUpdated: (technician: Technician) => void;
}

export const TechnicianDetails: React.FC<TechnicianDetailsProps> = ({
  technician,
  onBack,
}) => {
  const rawCertDoc = (technician as any).certificationDoc || (technician as any).certification_doc;
  const certDocUrl = rawCertDoc && !rawCertDoc.startsWith('http') && !rawCertDoc.startsWith('/') && !rawCertDoc.startsWith('data:') ? `https://${rawCertDoc}` : rawCertDoc;

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
      <p className="font-semibold">{(technician as any).firstName || technician.name.split(' ')[0]}</p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Last Name</p>
      <p className="font-semibold">{(technician as any).lastName || technician.name.split(' ').slice(1).join(' ')}</p>
    </div>

    <div>
      <p className="text-sm text-gray-500">National ID</p>
      <p className="font-semibold">{(technician as any).nationalId || (technician as any).national_id || 'N/A'}</p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Phone</p>
      <p className="font-semibold">{(technician as any).phone || 'N/A'}</p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Email</p>
      <p className="font-semibold">{technician.email || 'N/A'}</p>
    </div>

    <div>
      <p className="text-sm text-gray-500">County</p>
      <p className="font-semibold">{(technician as any).county || (technician as any).zone || 'N/A'}</p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Sub-county</p>
      <p className="font-semibold">{(technician as any).subCounty || (technician as any).sub_zone || 'N/A'}</p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Joined Date</p>
      <p className="font-semibold">{(technician as any).joinedDate || (technician as any).date_created ? new Date((technician as any).joinedDate || (technician as any).date_created).toLocaleDateString() : 'N/A'}</p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Certification Document</p>
      {certDocUrl ? (
        <a href={certDocUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
          View Document <ExternalLink size={14} />
        </a>
      ) : (
        <p className="font-semibold text-slate-400">Not Available</p>
      )}
    </div>

    <div>
      <p className="text-sm text-gray-500">Licence / Certificate ID</p>
      <p className="font-semibold">
        {(technician as any).licenseId || (technician as any).certificateId || (technician as any).certification_id || 'N/A'}
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Licence Expiry Date</p>
      <p className="font-semibold">
        {(technician as any).licenseExpiryDate || (technician as any).certification_expiry
          ? new Date((technician as any).licenseExpiryDate || (technician as any).certification_expiry).toLocaleDateString()
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