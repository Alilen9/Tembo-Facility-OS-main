import React from "react";

type Request = {
  ticketNumber: string;
  clientName: string;
  category: string;
  apartmentName?: string;
  issueTitle: string;
  description: string;
  urgency: string;
  timeAvailable: string;
  images?: string[];
};

type Props = {
  request: Request | null;
  onBack: () => void;
};

const RequestDetailsPage: React.FC<Props> = ({ request, onBack }) => {
  if (!request) {
    return (
      <div className="p-6 text-slate-400 text-sm">
        No request selected
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2"
        >
          ← Back to Request Queue
        </button>

        <span className="text-[11px] font-mono text-slate-400">
          Ticket #{request.ticketNumber}
        </span>
      </div>

      {/* Title */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {request.issueTitle}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Submitted by {request.clientName}
            </p>
          </div>

          <div className="flex gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {request.category}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                request.urgency === "High"
                  ? "bg-red-100 text-red-700"
                  : request.urgency === "Medium"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {request.urgency} Urgency
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Request Details */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            Request Information
          </h3>

          <Detail label="Client Name" value={request.clientName} />
          <Detail label="Category" value={request.category} />

          {request.category === "Apartment" && (
            <Detail
              label="Apartment Name"
              value={request.apartmentName || "-"}
            />
          )}

          <Detail label="Time Available" value={request.timeAvailable} />
        </div>

        {/* Right: Description */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
            Issue Description
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {request.description}
          </p>
        </div>
      </div>

      {/* Images */}
      {request.images && request.images.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
            Uploaded Evidence
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {request.images.map((img, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden border border-slate-200"
              >
                <img
                  src={img}
                  alt={`Evidence ${index + 1}`}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col">
    <span className="text-[11px] font-bold text-slate-400 uppercase">
      {label}
    </span>
    <span className="text-sm font-medium text-slate-800">
      {value}
    </span>
  </div>
);

export default RequestDetailsPage;
