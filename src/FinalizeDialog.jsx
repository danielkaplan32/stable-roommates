import React from "react";

export default function FinalizeDialog({ open, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.25)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "#fff", borderRadius: 10, padding: "2rem 2.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", minWidth: 320 }}>
        <h3 style={{ color: "#d97706", marginBottom: 16 }}>Are you sure?</h3>
        <p style={{ marginBottom: 24, color: "#222" }}>
          Finalizing will overwrite all participant preferences in the database with the current values shown here. This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ background: "#e0e7ef", color: "#357ae8", border: "none", borderRadius: 6, padding: "0.6rem 1.2rem", fontWeight: 500, fontSize: "1rem" }}>Cancel</button>
          <button onClick={onConfirm} style={{ background: "#d97706", color: "#fff", border: "none", borderRadius: 6, padding: "0.6rem 1.2rem", fontWeight: 500, fontSize: "1rem" }}>Finalize</button>
        </div>
      </div>
    </div>
  );
}
