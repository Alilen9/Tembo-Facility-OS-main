import { useState } from 'react';
import { Technician } from '@/types';
import { TechnicianDetails } from './TechnicianDetails';

const MOCK_TECHNICIANS: Technician[] = [
  {
    id: '1',
    name: 'John Doe',
    skills: ['Plumbing', 'Electrical'],
    status: 'Available',
    avatarUrl: 'https://via.placeholder.com/150',
    phone: '0712345678',
    auditPassRate: 95,
    recentDefects: 2
  },
  {
    id: '2',
    name: 'Jane Smith',
    skills: ['Carpentry'],
    status: 'On Job',
    avatarUrl: 'https://via.placeholder.com/150'
  }
];

export const TechniciansPage: React.FC = () => {
  const [technicians, setTechnicians] = useState(MOCK_TECHNICIANS);
  const [selected, setSelected] = useState<Technician | null>(null);

  if (selected) {
    return (
      <TechnicianDetails
        technician={selected}
        onBack={() => setSelected(null)}
        onUpdated={updated => {
          setTechnicians(prev =>
            prev.map(t => (t.id === updated.id ? updated : t))
          );
          setSelected(null);
        }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-800">Technicians</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {technicians.map(tech => (
          <div
            key={tech.id}
            onClick={() => setSelected(tech)}
            className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 flex flex-col items-center"
          >
            <img
              src={tech.avatarUrl}
              alt={tech.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
            />
            <h2 className="mt-4 font-bold text-xl">{tech.name}</h2>
            <p
              className={`mt-1 text-sm font-semibold ${
                tech.status === 'Available'
                  ? 'text-green-600'
                  : tech.status === 'On Job'
                  ? 'text-yellow-600'
                  : 'text-gray-400'
              }`}
            >
              {tech.status}
            </p>

            {tech.skills && (
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {tech.skills.map(skill => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {tech.auditPassRate !== undefined && (
              <div className="flex justify-between w-full mt-4 text-sm text-gray-600">
                <span>Pass Rate: {tech.auditPassRate}%</span>
                <span>Defects: {tech.recentDefects || 0}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
