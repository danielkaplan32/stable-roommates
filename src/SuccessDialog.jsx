import React from "react";

export default function SuccessDialog({ open, onClose, message }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.18)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "#fff", borderRadius: 10, padding: "2rem 2.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", minWidth: 320, textAlign: "center" }}>
        <h3 style={{ color: "#22c55e", marginBottom: 16 }}>Success!</h3>
        <p style={{ marginBottom: 24, color: "#222" }}>{message || "Preferences finalized and saved for all participants."}</p>
        <button onClick={onClose} style={{ background: "#357ae8", color: "#fff", border: "none", borderRadius: 6, padding: "0.6rem 1.2rem", fontWeight: 500, fontSize: "1rem" }}>OK</button>
      </div>
    </div>
  );
}
