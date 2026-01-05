import { useState, useEffect } from 'react';
import { Technician } from '@/types';
import { TechnicianDetails } from './TechnicianDetails';
import { adminService } from '@/services/adminService';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export const TechniciansPage: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selected, setSelected] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [initialSelectionHandled, setInitialSelectionHandled] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminService.getTechnicians(page, 9, searchQuery)
      .then(data => {
        
        const loadedTechs = data.technicians || data;
        console.log("Loaded technicians:", loadedTechs);
        setTechnicians(loadedTechs);
        setTotalPages(data.totalPages || 1);
        setLoading(false);

        
      });
  }, [page, searchQuery]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading technicians...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-extrabold text-gray-800">Technicians</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or skill..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {technicians.map(tech => (
          <div
            key={tech.id}
            onClick={() => setSelected(tech)}
            className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 flex flex-col items-center"
          >
            <img
              src={(tech as any).profile_photo || tech.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(tech.name)}&background=random`}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
   