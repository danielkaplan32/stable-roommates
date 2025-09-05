
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminReturnDialog from "./AdminReturnDialog";

export default function LandingPage() {
  const navigate = useNavigate();
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  return (
    <div className="landing-container">
      <h1>Stable Roommates Simulator</h1>
      <p>Find fair roommate pairings based on everyone’s preferences.</p>
      <div className="options">
        <button onClick={() => navigate("/manual")}>Manual Entry</button>
        <button onClick={() => navigate("/invite-setup")}>Send Out Links</button>
      </div>
      <div style={{ marginTop: "2.5rem" }}>
        <button onClick={() => setShowAdminDialog(true)} style={{ background: "#d97706", color: "#fff", padding: "0.7rem 2rem", borderRadius: 6, fontWeight: 500, fontSize: "1.1rem", border: "none" }}>Admin: Return to Session</button>
      </div>
      <AdminReturnDialog open={showAdminDialog} onClose={() => setShowAdminDialog(false)} />
    </div>
  );
}
