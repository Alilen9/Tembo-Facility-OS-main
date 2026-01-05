import React, { useState, useEffect } from "react";

/* =====================
   Types
===================== */

type Material = {
  itemName: string;
  quantity: number;
  unit: string;
};

type ComplianceDocument = {
  name: string;
  fileUrl: string;
  fileType: "pdf" | "jpg" | "png";
  issueDate: string;
};

type AuditJobReport = {
  jobId: string;
  ticketNumber: string;
  category: string;
  completedAt: string;
  technician: { name: string; id: string };
  workSummary: { findings: string; actionsTaken: string; completionNotes: string };
  materials: Material[];
  complianceDocs: ComplianceDocument[];
  images?: string[];
  approvedBy: string;
};

/* =====================
   Props
===================== */

type Props = {
  reportId: string; // job or ticket ID to fetch from backend
  clientId?: string;
  fetchReport: (reportId: string) => Promise<AuditJobReport>;
  submitRating?: (data: {
    jobId: string;
    technicianId: string;
    clientId: string;
    rating: number;
    feedback?: string;
  }) => Promise<void>;
};

/* =====================
   Component
===================== */

const ClientJobReport: React.FC<Props> = ({ reportId, clientId, fetchReport, submitRating }) => {
  const [report, setReport] = useState<AuditJobReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchReport(reportId)
      .then((data) => setReport(data))
      .catch((err) => setError("Failed to fetch report"))
      .finally(() => setLoading(false));
  }, [reportId]);

  if (loading) return <div style={{ padding: 32 }}>Loading report...</div>;
  if (error) return <div style={{ padding: 32, color: "red" }}>{error}</div>;
  if (!report) return <div style={{ padding: 32 }}>No report found</div>;

  const handleStarClick = (star: number) => {
    if (submitted) return;
    setRating(star);
  };

  const handleSubmitRating = async () => {
    if (!rating || !clientId || !submitRating) return;
    setSubmitted(true);

    await submitRating({
      jobId: report.jobId,
      technicianId: report.technician.id,
      clientId,
      rating,
      feedback: feedback || undefined,
    });
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    padding: 24,
    marginBottom: 24,
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 12,
    borderBottom: "1px solid #eee",
    paddingBottom: 6,
  };

  const labelStyle: React.CSSProperties = { fontWeight: 500 };
  const valueStyle: React.CSSProperties = { marginLeft: 6 };

  return (
    <div style={{ padding: 32, maxWidth: 1000, fontFamily: "Arial, sans-serif", backgroundColor: "#f9f9f9" }}>
      <h1 style={{ marginBottom: 32, color: "#58181C" }}>Job Completion Report</h1>

      {/* Job Summary */}
      <div style={cardStyle}>
        <div style={sectionTitle}>Job Summary</div>
        <p><span style={labelStyle}>Job ID:</span> <span style={valueStyle}>{report.jobId}</span></p>
        <p><span style={labelStyle}>Ticket Number:</span> <span style={valueStyle}>{report.ticketNumber}</span></p>
        <p><span style={labelStyle}>Category:</span> <span style={valueStyle}>{report.category}</span></p>
        <p><span style={labelStyle}>Completed At:</span> <span style={valueStyle}>{report.completedAt}</span></p>
      </div>

      {/* Technician */}
      <div style={cardStyle}>
        <div style={sectionTitle}>Technician</div>
        <p>{report.technician.name} (<span style={{ fontWeight: 500 }}>{report.technician.id}</span>)</p>
      </div>

      {/* Work Summary */}
      <div style={cardStyle}>
        <div style={sectionTitle}>Work Performed</div>
        <p><span style={labelStyle}>Findings:</span> {report.workSummary.findings}</p>
        <p><span style={labelStyle}>Actions Taken:</span> {report.workSummary.actionsTaken}</p>
        <p><span style={labelStyle}>Notes:</span> {report.workSummary.completionNotes}</p>
      </div>

      {/* Materials */}
      <div style={cardStyle}>
        <div style={sectionTitle}>Materials & Parts Used</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
              <th style={{ padding: 8 }}>Item Name</th>
              <th style={{ padding: 8 }}>Quantity</th>
              <th style={{ padding: 8 }}>Unit</th>
            </tr>
          </thead>
          <tbody>
            {report.materials.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{item.itemName}</td>
                <td style={{ padding: 8 }}>{item.quantity}</td>
                <td style={{ padding: 8 }}>{item.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Compliance Docs */}
      <div style={cardStyle}>
        <div style={sectionTitle}>Compliance Certificates</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {report.complianceDocs.map((doc, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: "#fafafa",
                borderRadius: 6,
                padding: 12,
                border: "1px solid #ddd",
                width: 220,
                textAlign: "center",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <p style={{ fontWeight: 500 }}>{doc.name}</p>
              <p style={{ fontSize: 12, color: "#666" }}>Issued: {doc.issueDate}</p>
              <a
                href={doc.fileUrl}
                download
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  padding: "4px 8px",
                  borderRadius: 4,
                  backgroundColor: "#58181C",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 12,
                }}
              >
                Download ({doc.fileType})
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Client Uploaded Images */}
      {report.images && report.images.length > 0 && (
        <div style={cardStyle}>
          <div style={sectionTitle}>Client Uploaded Images</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {report.images.map((img, idx) => (
              <div key={idx} style={{
                width: 220,
                height: 220,
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid #ddd",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                cursor: "pointer",
                position: "relative"
              }}>
                <img
                  src={img}
                  alt={`Client Upload ${idx + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <span style={{
                  position: "absolute",
                  bottom: 4,
                  left: 4,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "#fff",
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontSize: 12
                }}>
                  {idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating */}
      <div style={cardStyle}>
        <div style={sectionTitle}>Rate Your Experience</div>
        <p>
          How would you rate the service provided by <strong>{report.technician.name}</strong>?
        </p>

        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleStarClick(star)}
              style={{
                fontSize: 32,
                cursor: submitted ? "default" : "pointer",
                color: rating && star <= rating ? "#FFC107" : "#ccc",
                transition: "color 0.2s",
              }}
            >
              ★
            </span>
          ))}
        </div>

        {!submitted && (
          <textarea
            placeholder="Leave feedback (optional)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            style={{
              width: "100%",
              marginTop: 12,
              padding: 12,
              borderRadius: 6,
              border: "1px solid #ddd",
              fontFamily: "inherit",
              fontSize: 14,
            }}
          />
        )}

        {rating && (
          <p style={{ marginTop: 8 }}>
            You rated this service: <strong>{rating} / 5</strong>
          </p>
        )}

        {!submitted && submitRating && (
          <button
            onClick={handleSubmitRating}
            style={{
              marginTop: 12,
              padding: "8px 16px",
              borderRadius: 6,
              backgroundColor: "#58181C",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Submit Rating
          </button>
        )}

        {submitted && <p style={{ color: "green", marginTop: 8 }}>Thank you for your feedback!</p>}
      </div>

      <div style={{ textAlign: "right", marginTop: 12, fontSize: 14, color: "#555" }}>
        Audit Approved By: <strong>{report.approvedBy}</strong>
      </div>
    </div>
  );
};

export default ClientJobReport;
