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
    // Fake API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    onUpdated(form);
    alert('Technician updated!');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition"
      >
        ← Back to technicians
      </button>

      {/* Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-6">
          <img
            src={form.avatarUrl || 'https://via.placeholder.com/120'}
            alt={form.name}
            className="w-28 h-28 rounded-full object-cover border-2 border-gray-200"
          />
          <div>
            <h2 className="text-3xl font-bold">{form.name}</h2>
            <p className="text-gray-500 mt-1">{form.status}</p>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
              Name
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
              Phone
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.phone || ''}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>

        {/* Skills */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Skills</p>
          <div className="flex flex-wrap gap-2">
            {form.skills.map(skill => (
              <span
                key={skill}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={saveChanges}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase hover:bg-blue-700 transition"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-100 rounded-xl font-bold uppercase hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
