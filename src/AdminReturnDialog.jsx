import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function AdminReturnDialog({ open, onClose }) {
  const [sessionId, setSessionId] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    // Validate credentials
    const { data, error: fetchError } = await supabase
      .from("sessions")
      .select("session_id")
      .eq("session_id", sessionId)
      .eq("admin_secret", adminSecret)
      .single();
    if (fetchError || !data) {
      setError("Session ID or Admin Secret is incorrect.");
      return;
    }
    onClose();
  navigate(`/admin?session=${sessionId}&secret=${adminSecret}`);
  };

  if (!open) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.18)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "#fff", borderRadius: 10, padding: "2rem 2.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", minWidth: 340 }}>
        <h3 style={{ color: "#357ae8", marginBottom: 16 }}>Return to Admin Session</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 500, marginBottom: 4 }}>Session ID</label>
            <input type="text" value={sessionId} onChange={e => setSessionId(e.target.value)} style={{ width: "100%", padding: "0.6rem", borderRadius: 6, border: "1px solid #e0e7ef" }} required />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 500, marginBottom: 4 }}>Admin Secret</label>
            <input type="password" value={adminSecret} onChange={e => setAdminSecret(e.target.value)} style={{ width: "100%", padding: "0.6rem", borderRadius: 6, border: "1px solid #e0e7ef" }} required />
          </div>
          {error && <div style={{ color: "#d32f2f", marginBottom: 12 }}>{error}</div>}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ background: "#e0e7ef", color: "#357ae8", border: "none", borderRadius: 6, padding: "0.6rem 1.2rem", fontWeight: 500, fontSize: "1rem" }}>Cancel</button>
            <button type="submit" style={{ background: "#357ae8", color: "#fff", border: "none", borderRadius: 6, padding: "0.6rem 1.2rem", fontWeight: 500, fontSize: "1rem" }}>Go</button>
          </div>
        </form>
      </div>
    </div>
  );
}
