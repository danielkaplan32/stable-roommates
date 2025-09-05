import React, { useEffect, useState } from "react";
// ...existing code...
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function InviteEntryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const user = params.get("user");
  const session = params.get("session");
  const [participants, setParticipants] = useState([]);
  const [prefs, setPrefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);
  const [finalized, setFinalized] = useState(false);

  // Fetch session participants
  useEffect(() => {
    async function fetchSession() {
      setLoading(true);
      setError("");
      // Fetch participants and finalized
      const { data: sessionData, error } = await supabase
        .from("sessions")
        .select("participants, finalized")
        .eq("session_id", session)
        .single();
      if (error || !sessionData) {
        setError("Session not found.");
        setLoading(false);
        return;
      }
      setParticipants(sessionData.participants || []);
      setFinalized(!!sessionData.finalized);
      // Fetch existing preferences for this user
      const { data: prefData, error: prefError } = await supabase
        .from("preferences")
        .select("preferences")
        .eq("session_id", session)
        .eq("username", user)
        .single();
      if (prefData && prefData.preferences) {
        setPrefs(prefData.preferences);
        setLocked(true);
      } else {
        setPrefs(Array((sessionData.participants || []).length - 1).fill(""));
        setLocked(false);
      }
      setLoading(false);
    }
    fetchSession();
  }, [session, user]);

  const handlePrefChange = (idx, value) => {
    const updated = [...prefs];
    updated[idx] = value;
    setPrefs(updated);
  };

  // Get available options for each dropdown (not already selected, except for this idx)
  const getOptions = idx => {
    const others = participants.filter(n => n !== user);
    const selected = prefs.filter((v, i) => v && i !== idx);
    return ["", ...others.filter(n => !selected.includes(n))];
  };

  // Randomize remaining empty slots
  const randomizeRemaining = () => {
    const others = participants.filter(n => n !== user);
    const filled = prefs.filter(Boolean);
    const remaining = others.filter(n => !filled.includes(n));
    const shuffled = [...remaining];
    for (let j = shuffled.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
    }
    const newPrefs = prefs.map((v, i) => v || shuffled.shift() || "");
    setPrefs(newPrefs);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    // Fetch latest finalized state before submitting
    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .select("finalized")
      .eq("session_id", session)
      .single();
    if (sessionError || !sessionData) {
      setSubmitting(false);
      setError("Could not verify session status. Please try again.");
      return;
    }
    if (sessionData.finalized) {
      setSubmitting(false);
      setFinalized(true);
      setLocked(true);
      setError("Preferences have been finalized by the admin. You can no longer submit edits.");
      return;
    }
    // Upsert preferences to Supabase
    const { error } = await supabase.from("preferences").upsert([
      {
        session_id: session,
        username: user,
        preferences: prefs
      }
    ], { onConflict: ["session_id", "username"] });
    setSubmitting(false);
    if (error) {
      setError("Error submitting preferences. Please try again.");
      return;
    }
    setLocked(true);
    // Optionally: navigate to waiting room or show a message
  };

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (error) return <div style={{ color: "#d32f2f", padding: 40 }}>{error}</div>;

  return (
    <form onSubmit={handleSubmit} className="invite-entry-form" style={{ maxWidth: 500, margin: "2rem auto", background: "#fff", borderRadius: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", padding: "2rem 1.5rem", border: "1px solid #e0e7ef", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
  <h2 style={{ color: "#357ae8" }}>Preferences for {user}</h2>
      <div style={{ marginBottom: "1.2rem", display: "flex", flexDirection: "row", gap: 36 }}>
        {participants.filter(n => n !== user).map((name, idx) => {
          const selected = prefs.filter((v, i) => i !== idx);
          const isDuplicate = selected.includes(prefs[idx]);
          const isInvalid = prefs[idx] && !participants.filter(n => n !== user).includes(prefs[idx]);
          return (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <label style={{ marginBottom: 4, color: "#357ae8", fontWeight: 500 }}>{idx + 1}</label>
              <input
                type="text"
                value={isDuplicate || isInvalid ? "" : prefs[idx] || ""}
                onChange={e => {
                  const value = e.target.value;
                  const validOptions = participants.filter(n => n !== user);
                  if (!validOptions.includes(value) || selected.includes(value)) {
                    handlePrefChange(idx, "");
                  } else {
                    handlePrefChange(idx, value);
                  }
                }}
                placeholder={name}
                list={`prefs-list-${idx}`}
                style={{
                  width: "100%",
                  minWidth: "100px",
                  padding: "0.6rem 0.8rem",
                  borderRadius: "6px",
                  border: isDuplicate || isInvalid ? "2px solid #d32f2f" : "1px solid #bfc8d6",
                  background: locked ? "#f0f2f7" : "#f5f7fa",
                  fontSize: "1rem",
                  marginRight: "0.2rem"
                }}
                disabled={locked || finalized}
              />
              <datalist id={`prefs-list-${idx}`}>
                {participants.filter(n => n !== user && !selected.includes(n)).map((opt, i) => (
                  <option key={i} value={opt} />
                ))}
              </datalist>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "row", gap: 12, alignItems: "center" }}>
        {locked && !finalized && (
          <button
            type="button"
            onClick={() => setLocked(false)}
            style={{ background: "#e0e7ef", color: "#357ae8", borderRadius: 6, padding: "0.7rem 1.2rem", border: "none", fontWeight: 500, fontSize: "1rem", marginRight: 4, cursor: "pointer" }}
          >
            Edit
          </button>
        )}
        <button
          type="button"
          onClick={randomizeRemaining}
          style={{ background: "#4f8cff", color: "#fff", borderRadius: 6, padding: "0.7rem 1.5rem", border: "none", fontWeight: 500, fontSize: "1rem" }}
          disabled={locked || finalized}
        >
          Randomize Remaining
        </button>
        <button type="submit" disabled={submitting || locked || finalized} style={{ background: submitting || locked || finalized ? "#bfc8d6" : "#357ae8", color: "#fff", borderRadius: 6, padding: "0.7rem 1.5rem", border: "none", fontWeight: 500, fontSize: "1rem", cursor: submitting || locked || finalized ? "not-allowed" : "pointer" }}>
          {submitting ? "Submitting..." : "Submit Preferences"}
        </button>
      </div>
      <button
        type="button"
        disabled={!locked}
        style={{
          background: !locked ? "#bfc8d6" : "#22c55e",
          color: "#fff",
          borderRadius: 6,
          padding: "0.7rem 1.5rem",
          border: "none",
          fontWeight: 500,
          fontSize: "1rem",
          cursor: !locked ? "not-allowed" : "pointer",
          marginTop: 16,
          width: "100%"
        }}
        onClick={() => navigate(`/inviteresults?session=${session}&user=${user}`)}
      >
        View Results
      </button>
    </form>
  );
}
