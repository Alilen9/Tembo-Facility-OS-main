import React from "react";
import { Camera, ClipboardList, Download, Package, Shield, Star } from "../Icons";


type Material = {
  name: string;
  quantity: number;
  unit: string;
};

type ComplianceDoc = {
  name: string;
  issuedDate?: string;
  fileUrl?: string;
};

type ReviewReport = {
  ticketNumber: string;
  jobId: string;
  category: string;
  completedAt: string;
  technicianName: string;
  clientName: string;
  workSummary: string;
  proofImages?: { before: string; after: string };
  materialsUsed?: Material[];
  complianceDocs?: ComplianceDoc[];
  rating?: number;
  feedback?: string;
};

type Props = {
  report: ReviewReport;
};

const AdminReviewPage: React.FC<Props> = ({ report }) => {
  return (
    <div className="p-8 max-w-5xl mx-auto font-sans bg-gray-50 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList size={24} className="text-blue-600" /> Job Review
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Ticket: <strong>{report.ticketNumber}</strong> | Job ID: <strong>{report.jobId}</strong>
        </p>
      </div>

      {/* Technician & Client */}
      <div className="bg-white p-5 rounded-xl shadow-sm flex justify-between">
        <div>
          <p className="text-sm text-gray-500">Technician</p>
          <p className="text-lg font-semibold">{report.technicianName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Client</p>
          <p className="text-lg font-semibold">{report.clientName}</p>
        </div>
      </div>

      {/* Work Summary */}
      <section className="bg-white p-5 rounded-xl shadow-sm">
        <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Work Summary</h3>
        <p className="text-gray-700 leading-relaxed">{report.workSummary}</p>
      </section>

      {/* Proof Images */}
      {report.proofImages && (
        <section className="bg-white p-5 rounded-xl shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
            <Camera size={18} /> Proof of Work
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
              <img src={report.proofImages.before} alt="Before" className="w-full h-56 object-cover" />
              <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Before</span>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
              <img src={report.proofImages.after} alt="After" className="w-full h-56 object-cover" />
              <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">After</span>
            </div>
          </div>
        </section>
      )}

      {/* Materials Used */}
      {report.materialsUsed && report.materialsUsed.length > 0 && (
        <section className="bg-white p-5 rounded-xl shadow-sm overflow-x-auto">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
            <Package size={18} /> Materials Used
          </h3>
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 border-b">Item</th>
                <th className="p-3 border-b">Quantity</th>
                <th className="p-3 border-b">Unit</th>
              </tr>
            </thead>
            <tbody>
              {report.materialsUsed.map((mat, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-3">{mat.name}</td>
                  <td className="p-3">{mat.quantity}</td>
                  <td className="p-3">{mat.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Compliance Docs */}
      {report.complianceDocs && report.complianceDocs.length > 0 && (
        <section className="bg-white p-5 rounded-xl shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
            <Shield size={18} /> Compliance Certificates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.complianceDocs.map((doc, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-blue-400 transition"
              >
                <div>
                  <p className="text-sm font-semibold">{doc.name}</p>
                  {doc.issuedDate && <p className="text-xs text-gray-500">Issued: {doc.issuedDate}</p>}
                </div>
                {doc.fileUrl && (
                  <a href={doc.fileUrl} download className="text-blue-600 hover:underline">
                    <Download size={16} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Rating & Feedback */}
      <section className="bg-white p-5 rounded-xl shadow-sm text-center">
        <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Rating</h3>
        <div className="flex justify-center space-x-2 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={28}
              fill={report.rating && report.rating >= star ? "currentColor" : "none"}
              className={`text-yellow-400 ${!report.rating ? "text-gray-300" : ""}`}
            />
          ))}
        </div>
        {report.feedback && <p className="text-gray-700">{report.feedback}</p>}
      </section>
    </div>
  );
};

export default AdminReviewPage;
