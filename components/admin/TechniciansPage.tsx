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
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Technicians</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {technicians.map(tech => (
          <div
            key={tech.id}
            className="p-4 border rounded-lg flex items-center gap-4 cursor-pointer hover:bg-slate-50"
            onClick={() => setSelected(tech)}
          >
            <img src={tech.avatarUrl} className="w-16 h-16 rounded-lg object-cover" />
            <div>
              <p className="font-bold">{tech.name}</p>
              <p className="text-sm text-slate-500">{tech.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
