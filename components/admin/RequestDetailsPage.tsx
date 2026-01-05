import React from "react";

/* =====================
   Types
===================== */

type Request = {
  ticketNumber: string;
  clientName: string;
  category: string;
  apartmentName?: string; // only if category is Apartment
  issueTitle: string;
  description: string;
  urgency: string;
  timeAvailable: string;
  images?: string[]; // URLs of uploaded images
};

/* =====================
   Props
===================== */

type Props = {
  request: Request | null;
  onBack: () => void; // go back to queue page
};

/* =====================
   Component
===================== */

const RequestDetailsPage: React.FC<Props> = ({ request, onBack }) => {
  if (!request) return <div>No request selected</div>;

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          marginBottom: 16,
          padding: "6px 12px",
          borderRadius: 4,
          backgroundColor: "#58181C",
          color: "#fff",
          border: "none",
          cursor: "pointer"
        }}
      >
        ← Back to Request Queue
      </button>

      <h2>Request Details</h2>

      {/* Request Info */}
      <section style={{ marginTop: 16, lineHeight: 1.6 }}>
        <p><strong>Client Name:</strong> {request.clientName}</p>
        <p><strong>Ticket Number:</strong> {request.ticketNumber}</p>
        <p><strong>Category:</strong> {request.category}</p>
        {request.category === "Apartment" && (
          <p><strong>Apartment Name:</strong> {request.apartmentName}</p>
        )}
        <p><strong>Issue:</strong> {request.issueTitle}</p>
        <p><strong>Description:</strong> {request.description}</p>
        <p><strong>Urgency Level:</strong> {request.urgency}</p>
        <p><strong>Time Available:</strong> {request.timeAvailable}</p>
      </section>

      {/* Uploaded Images */}
      {request.images && request.images.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <h4>Uploaded Images</h4>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {request.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Uploaded ${index + 1}`}
                style={{
                  width: 200,
                  height: 200,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid #ccc"
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default RequestDetailsPage;
