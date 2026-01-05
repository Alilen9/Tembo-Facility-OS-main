import React from "react";

/* =======================
   Types
======================= */

export type Technician = {
  id: string;
  name: string;
  status: string;
  available: boolean;
  distance: number;
  load: number;
  match: number;
  skills: string[];
};

/* =======================
   Props
======================= */

type TechnicianDetailsProps = {
  technician: Technician | null;
  onBack?: () => void;
};

/* =======================
   Component
======================= */

const TechnicianDetails: React.FC<TechnicianDetailsProps> = ({
  technician,
  onBack
}) => {
  if (!technician) {
    return <div>No technician selected</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      {onBack && (
        <button onClick={onBack} style={{ marginBottom: 16 }}>
          ← Back
        </button>
      )}

      <h2>Technician Audit Record</h2>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 16,
          maxWidth: 500
        }}
      >
        <p><strong>Name:</strong> {technician.name}</p>
        <p><strong>Technician ID:</strong> {technician.id}</p>
        <p><strong>Status:</strong> {technician.status}</p>
        <p><strong>Availability:</strong> {technician.available ? "Available" : "Busy"}</p>
        <p><strong>Distance:</strong> {technician.distance} mi</p>
        <p><strong>Current Load:</strong> {technician.load}/5</p>
        <p><strong>Match Score:</strong> {technician.match}%</p>
        <p><strong>Skills:</strong> {technician.skills.join(", ")}</p>
      </div>
    </div>
  );
};

export default TechnicianDetails;
