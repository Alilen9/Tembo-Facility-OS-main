import { useState } from 'react';
import { Technician } from '@/types';

interface Props {
  technician: Technician;
  onBack: () => void;
  onUpdated: (updated: Technician) => void;
}

export const TechnicianDetails: React.FC<Props> = ({ technician, onBack, onUpdated }) => {
  const [form, setForm] = useState<Technician>(technician);
  const [saving, setSaving] = useState(false);

  const saveChanges = async () => {
    setSaving(true);

    // fake API call, replace with your service
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSaving(false);
    onUpdated(form);
    alert('Technician updated');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={onBack} className="text-sm text-slate-500">
        ← Back to technicians
      </button>

      <div className="bg-white border rounded-3xl p-8 shadow">
        <div className="flex items-center gap-6">
          <img
            src={form.avatarUrl || 'https://via.placeholder.com/120'}
            className="w-28 h-28 rounded-3xl object-cover"
          />
          <div>
            <h2 className="text-3xl font-black uppercase">{form.name}</h2>
            <p className="text-sm text-slate-500">{form.status}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <input
            className="input"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
          />
          <input
            className="input"
            value={form.phone || ''}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="Phone"
          />
        </div>

        <div className="mt-6">
          <p className="text-xs font-black uppercase text-slate-400 mb-2">Skills</p>
          <div className="flex flex-wrap gap-2">
            {form.skills.map(skill => (
              <span key={skill} className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={saveChanges}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={onBack} className="px-6 py-3 bg-slate-100 rounded-xl font-black uppercase">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
