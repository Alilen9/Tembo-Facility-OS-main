import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface Apartment {
  id: string;
  name: string;
  location: string;
  floors: number;
  status: 'active' | 'inactive';
}

const OpsApartmentsPage: React.FC = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [form, setForm] = useState({
    name: '',
    location: '',
    floors: '',
    status: 'active',
  });

  const handleAddApartment = () => {
    if (!form.name || !form.location || !form.floors) {
      toast.error('Fill all fields');
      return;
    }

    const newApartment: Apartment = {
      id: `apt-${Date.now()}`,
      name: form.name,
      location: form.location,
      floors: Number(form.floors),
      status: form.status as 'active' | 'inactive',
    };

    setApartments(prev => [newApartment, ...prev]);
    setForm({ name: '', location: '', floors: '', status: 'active' });
    toast.success('Apartment added');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Apartment Management
        </h1>
        <p className="text-sm text-slate-500">
          Add apartments that clients can select during service requests
        </p>
      </div>

      {/* ADD APARTMENT FORM */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold mb-4">Add New Apartment</h2>

        <div className="grid md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Apartment Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="px-4 py-3 border rounded-xl"
          />

          <input
            type="text"
            placeholder="Location"
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
            className="px-4 py-3 border rounded-xl"
          />

          <input
            type="number"
            placeholder="Floors"
            value={form.floors}
            onChange={e => setForm({ ...form, floors: e.target.value })}
            className="px-4 py-3 border rounded-xl"
          />

          <select
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
            className="px-4 py-3 border rounded-xl"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          onClick={handleAddApartment}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Add Apartment
        </button>
      </div>

      {/* APARTMENTS LIST */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Apartment</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Floors</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {apartments.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-400">
                  No apartments added yet
                </td>
              </tr>
            )}

            {apartments.map(apartment => (
              <tr key={apartment.id} className="border-t">
                <td className="px-4 py-3 font-medium">
                  {apartment.name}
                </td>
                <td className="px-4 py-3">{apartment.location}</td>
                <td className="px-4 py-3">{apartment.floors}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      apartment.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {apartment.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default OpsApartmentsPage;
