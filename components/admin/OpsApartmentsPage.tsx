import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';

interface Apartment {
  id: string;
  name: string;
  county: string;
  subCounty: string;
  floors: number;
  managedBy: 'agent' | 'landlord' | 'edlonggroup';
  status: 'active' | 'inactive';
}

/* ALL KENYAN COUNTIES */
const COUNTIES = [
  'Baringo','Bomet','Bungoma','Busia','Elgeyo Marakwet','Embu',
  'Garissa','Homa Bay','Isiolo','Kajiado','Kakamega','Kericho',
  'Kiambu','Kilifi','Kirinyaga','Kisii','Kisumu','Kitui',
  'Kwale','Laikipia','Lamu','Machakos','Makueni','Mandera',
  'Marsabit','Meru','Migori','Mombasa','Murang’a','Nairobi',
  'Nakuru','Nandi','Narok','Nyamira','Nyandarua','Nyeri',
  'Samburu','Siaya','Taita Taveta','Tana River','Tharaka Nithi',
  'Trans Nzoia','Turkana','Uasin Gishu','Vihiga','Wajir','West Pokot'
];

const OpsApartmentsPage: React.FC = () => {
  const [apartments, setApartments] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    county: '',
    subCounty: '',
    floors: '',
    managedBy: 'agent',
    status: 'active',
  });

  useEffect(() => {
    loadApartments();
  }, []);

  const loadApartments = async () => {
    try {
      const data = await adminService.getApartments();
      // Map backend fields to frontend interface if needed, or use directly
      const mapped = data.map((apt: any) => ({
        ...apt,
        subCounty: apt.sub_zone,
        county: apt.zone,
        managedBy: apt.managed_by
      }));
      setApartments(mapped);
    } catch (error) {
      toast.error('Failed to load apartments');
    }
  };

  const handleAddApartment = async () => {
    const { name, county, subCounty, floors } = form;

    if (!name || !county || !subCounty || !floors) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await adminService.addApartment({
        name,
        zone: county,
        subZone: subCounty,
        floors: Number(floors),
        managedBy: form.managedBy,
        status: form.status
      });
      toast.success('Apartment added successfully');
      setForm({
        name: '',
        county: '',
        subCounty: '',
        floors: '',
        managedBy: 'agent',
        status: 'active',
      });
      loadApartments();
    } catch (error) {
      toast.error('Failed to add apartment');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Apartment Management
        </h1>
        <p className="text-sm text-slate-500">
          Add apartments available for client service requests
        </p>
      </div>

      {/* ADD APARTMENT FORM */}
      <div className="bg-white border rounded-2xl p-4 md:p-6 shadow-sm">
        <h2 className="font-bold mb-4">Add New Apartment</h2>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">

          {/* APARTMENT NAME */}
          <input
            type="text"
            placeholder="Apartment Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="px-4 py-3 border rounded-xl md:col-span-2"
          />

          {/* COUNTY */}
          <select
            value={form.county}
            onChange={e =>
              setForm({
                ...form,
                county: e.target.value,
                subCounty: '',
              })
            }
            className="px-4 py-3 border rounded-xl"
          >
            <option value="">Select County</option>
            {COUNTIES.map(county => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>

          {/* SUB COUNTY (MANUAL INPUT) */}
          <input
            type="text"
            placeholder="Sub County"
            value={form.subCounty}
            onChange={e =>
              setForm({ ...form, subCounty: e.target.value })
            }
            disabled={!form.county}
            className="px-4 py-3 border rounded-xl"
          />

          {/* FLOORS */}
          <input
            type="number"
            placeholder="Floors"
            value={form.floors}
            onChange={e => setForm({ ...form, floors: e.target.value })}
            className="px-4 py-3 border rounded-xl"
          />

          {/* MANAGED BY */}
          <select
            value={form.managedBy}
            onChange={e =>
              setForm({ ...form, managedBy: e.target.value })
            }
            className="px-4 py-3 border rounded-xl"
          >
            <option value="agent">Agent</option>
            <option value="landlord">Landlord</option>
            <option value="edlonggroup">Edlong Group</option>
          </select>

          {/* STATUS */}
          <select
            value={form.status}
            onChange={e =>
              setForm({ ...form, status: e.target.value })
            }
            className="px-4 py-3 border rounded-xl"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          onClick={handleAddApartment}
          className="mt-4 w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold"
        >
          Add Apartment
        </button>
      </div>

      {/* APARTMENTS LIST */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Apartment</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Floors</th>
              <th className="px-4 py-3 text-left">Managed By</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {apartments.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400">
                  No apartments added yet
                </td>
              </tr>
            )}

            {apartments.map(apartment => (
              <tr key={apartment.id} className="border-t">
                <td className="px-4 py-3 font-medium">
                  {apartment.name}
                </td>
                <td className="px-4 py-3">
                  {apartment.county} – {apartment.subCounty}
                </td>
                <td className="px-4 py-3">{apartment.floors}</td>
                <td className="px-4 py-3 capitalize">
                  {apartment.managedBy}
                </td>
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
