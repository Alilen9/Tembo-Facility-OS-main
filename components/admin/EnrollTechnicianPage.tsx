
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { 
  X, CheckCircle2, UserCheck, Shield, MapPin, Wrench, ArrowRight, ArrowLeft, Camera, 
  Phone, AlertTriangle, Briefcase, Zap, ShieldCheck, FileCheck, ClipboardList, 
  RefreshCw, AlertCircle, Send, Mail, Upload, Clock, Star, History, Target, 
  Droplets, Hammer, SprayCan, Thermometer, Layers, List, Users, ShieldAlert, 
  FileText, Activity, Navigation, Box 
} from 'lucide-react';
import React, { useState } from "react";

// Constants
const SKILLS = ["Electrical", "Plumbing", "HVAC", "Networking", "Mechanical"];
const STATUS = ["Active", "Inactive"];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract"];
const GENDERS = ["Male", "Female", "Other"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const EnrollTechnician = () => {
  const [step, setStep] = useState(1);

  const [technician, setTechnician] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    gender: "",
    idNumber: "",
    profilePic: null,
    idFront: null,
    idBack: null,
    kycCertificate: null,
    additionalCertificates: null,
    department: "",
    skills: [],
    experience: "",
    employmentType: "Full-time",
    availability: [],
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    status: "Active",
    notes: "",
  });

  const [techniciansList, setTechniciansList] = useState([]);

  // Handle text/select/file changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setTechnician((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setTechnician((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Remove file
  const handleRemoveFile = (fileKey) => {
    setTechnician((prev) => ({ ...prev, [fileKey]: null }));
  };

  // Toggle skills
  const handleSkillToggle = (skill) => {
    setTechnician((prev) => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  // Toggle availability
  const handleAvailabilityToggle = (day) => {
    setTechnician((prev) => {
      const availability = prev.availability.includes(day)
        ? prev.availability.filter((d) => d !== day)
        : [...prev.availability, day];
      return { ...prev, availability };
    });
  };

  // Navigation
  const handleNext = () => {
    if (step === 1 && (!technician.fullName || !technician.email || !technician.phone)) {
      alert("Please fill Full Name, Email, and Phone.");
      return;
    }
    if (step === 2 && (!technician.profilePic || !technician.idFront || !technician.idBack)) {
      alert("Please upload Profile Picture and ID Front & Back.");
      return;
    }
    setStep(step + 1);
  };

  const handlePrev = () => setStep(step - 1);

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const newTechnician = {
      ...technician,
      id: `TECH-${Date.now()}`,
      profilePicURL: technician.profilePic ? URL.createObjectURL(technician.profilePic) : null,
      idFrontURL: technician.idFront ? URL.createObjectURL(technician.idFront) : null,
      idBackURL: technician.idBack ? URL.createObjectURL(technician.idBack) : null,
      kycURL: technician.kycCertificate ? URL.createObjectURL(technician.kycCertificate) : null,
      certificatesURL: technician.additionalCertificates ? URL.createObjectURL(technician.additionalCertificates) : null,
    };

    setTechniciansList((prev) => [...prev, newTechnician]);

    // Reset form
    setTechnician({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      dob: "",
      gender: "",
      idNumber: "",
      profilePic: null,
      idFront: null,
      idBack: null,
      kycCertificate: null,
      additionalCertificates: null,
      department: "",
      skills: [],
      experience: "",
      employmentType: "Full-time",
      availability: [],
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      status: "Active",
      notes: "",
    });
    setStep(1);
    alert("Technician added successfully!");
  };

  // Toggle technician status in the list
  const toggleTechnicianStatus = (id) => {
    setTechniciansList((prev) =>
      prev.map((tech) =>
        tech.id === id ? { ...tech, status: tech.status === "Active" ? "Inactive" : "Active" } : tech
      )
    );
  };

  return (
    <div style={{ maxWidth: "900px", margin: "30px auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ color: "#58181C", marginBottom: "20px" }}>Enroll Technician</h2>

      {/* Step Progress */}
      <div style={{ display: "flex", marginBottom: "25px", justifyContent: "space-between" }}>
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "5px 0",
              borderBottom: step === s ? "3px solid #C81E1E" : "1px solid #ccc",
              fontWeight: step === s ? "bold" : "normal",
            }}
          >
            Step {s}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "15px" }}>
        {/* Step 1 */}
        {step === 1 && (
          <>
            <input type="text" name="fullName" value={technician.fullName} onChange={handleChange} placeholder="Full Name *" />
            <input type="email" name="email" value={technician.email} onChange={handleChange} placeholder="Email *" />
            <input type="tel" name="phone" value={technician.phone} onChange={handleChange} placeholder="Phone Number *" />
            <input type="text" name="address" value={technician.address} onChange={handleChange} placeholder="Address" />
            <input type="date" name="dob" value={technician.dob} onChange={handleChange} placeholder="Date of Birth" />
            <select name="gender" value={technician.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div style={{ display: "grid", gap: "15px" }}>
            {[
              { label: "Profile Picture", key: "profilePic", accept: "image/*" },
              { label: "ID Front", key: "idFront", accept: "image/*,application/pdf" },
              { label: "ID Back", key: "idBack", accept: "image/*,application/pdf" },
              { label: "KYC Certificate (Optional)", key: "kycCertificate", accept: "application/pdf,image/*" },
              { label: "Additional Certificates (Optional)", key: "additionalCertificates", accept: "application/pdf,image/*" }
            ].map((file) => (
              <div key={file.key} style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
                <p>{file.label}</p>
                {technician[file.key] && (
                  <div style={{ marginBottom: "10px" }}>
                    {technician[file.key].type.startsWith("image") ? (
                      <img
                        src={URL.createObjectURL(technician[file.key])}
                        alt={file.label}
                        style={{ width: "120px", height: "80px", objectFit: "cover", marginBottom: "5px" }}
                      />
                    ) : (
                      <p style={{ fontSize: "12px", color: "#555" }}>{technician[file.key].name}</p>
                    )}
                    <br />
                    <button type="button" onClick={() => handleRemoveFile(file.key)} style={{ padding: "5px 10px", background: "#C81E1E", color: "#fff", border: "none", cursor: "pointer" }}>
                      Remove
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept={file.accept}
                  onChange={handleChange}
                  name={file.key}
                />
              </div>
            ))}
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <>
            <input type="text" name="department" value={technician.department} onChange={handleChange} placeholder="Department / Expertise" />
            <input type="number" name="experience" value={technician.experience} onChange={handleChange} placeholder="Experience (years)" />
            <select name="employmentType" value={technician.employmentType} onChange={handleChange}>
              {EMPLOYMENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>

            <div>
              <label>Availability:</label>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {DAYS.map((day) => (
                  <label key={day} style={{ cursor: "pointer", background: technician.availability.includes(day) ? "#F4C542" : "#eee", padding: "5px 10px", borderRadius: "5px" }}>
                    <input type="checkbox" checked={technician.availability.includes(day)} onChange={() => handleAvailabilityToggle(day)} /> {day}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label>Skills:</label>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {SKILLS.map((skill) => (
                  <label key={skill} style={{ cursor: "pointer", background: technician.skills.includes(skill) ? "#F4C542" : "#eee", padding: "5px 10px", borderRadius: "5px" }}>
                    <input type="checkbox" checked={technician.skills.includes(skill)} onChange={() => handleSkillToggle(skill)} /> {skill}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <>
            <input type="text" name="emergencyContactName" value={technician.emergencyContactName} onChange={handleChange} placeholder="Emergency Contact Name" />
            <input type="tel" name="emergencyContactPhone" value={technician.emergencyContactPhone} onChange={handleChange} placeholder="Emergency Contact Phone" />
            <input type="text" name="emergencyContactRelation" value={technician.emergencyContactRelation} onChange={handleChange} placeholder="Emergency Contact Relation" />
            <select name="status" value={technician.status} onChange={handleChange}>
              {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <textarea name="notes" value={technician.notes} onChange={handleChange} placeholder="Notes" />
          </>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
          {step > 1 && <button type="button" onClick={handlePrev} style={{ padding: "10px" }}>Previous</button>}
          {step < 4 && <button type="button" onClick={handleNext} style={{ padding: "10px", backgroundColor: "#C81E1E", color: "#fff", border: "none", cursor: "pointer" }}>Next</button>}
          {step === 4 && <button type="submit" style={{ padding: "10px", backgroundColor: "#58181C", color: "#fff", border: "none", cursor: "pointer" }}>Submit</button>}
        </div>
      </form>

      {/* Technicians List */}
      <hr style={{ margin: "30px 0" }} />
      <h3 style={{ color: "#C81E1E" }}>Technicians List</h3>
      {techniciansList.length === 0 ? (
        <p>No technicians enrolled yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "15px" }}>
          {techniciansList.map((tech) => (
            <div key={tech.id} style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "8px", display: "grid", gridTemplateColumns: "80px 1fr", gap: "15px", alignItems: "center" }}>
              {tech.profilePicURL ? <img src={tech.profilePicURL} alt={tech.fullName} style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover" }} /> : <div style={{ width: "80px", height: "80px", background: "#eee", borderRadius: "50%" }} />}
              <div>
                <strong>{tech.fullName} ({tech.status})</strong><br />
                ID: {tech.id} | Email: {tech.email} | Phone: {tech.phone}<br />
                Department: {tech.department} | Experience: {tech.experience} yrs | Employment: {tech.employmentType}<br />
                Skills: {tech.skills.join(", ")}<br />
                Availability: {tech.availability.join(", ")}<br />
                <button
                  type="button"
                  onClick={() => toggleTechnicianStatus(tech.id)}
                  style={{
                    padding: "5px 10px",
                    marginTop: "5px",
                    background: tech.status === "Active" ? "#C81E1E" : "#58181C",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {tech.status === "Active" ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnrollTechnician;
