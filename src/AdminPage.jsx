// Dialog for sharing links
function LinksDialog({ open, onClose, links, participants }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.18)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "#f5f7fa", borderRadius: 12, padding: "2rem 2.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", minWidth: 420 }}>
        <h3 style={{ color: "#357ae8", marginBottom: 18 }}>Share these links:</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
          {participants.map((name, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "#fff", borderRadius: 8, padding: "0.7rem 1rem", boxShadow: "0 1px 4px rgba(53,122,232,0.07)",
              fontSize: 15, wordBreak: "break-all"
            }}>
              <span style={{ fontWeight: 500, color: "#357ae8", minWidth: 60 }}>{name}:</span>
              <a href={links.participantLinks[i]} target="_blank" rel="noopener noreferrer" style={{ color: "#357ae8", textDecoration: "underline", wordBreak: "break-all" }}>{links.participantLinks[i]}</a>
            </div>
          ))}
        </div>
        <div style={{ fontWeight: 500, color: "#d97706", marginBottom: 6 }}>Admin Link:</div>
        <div style={{
          background: "#fff", borderRadius: 8, padding: "0.7rem 1rem", boxShadow: "0 1px 4px rgba(53,122,232,0.07)",
          fontSize: 15, wordBreak: "break-all", marginBottom: 24, display: "flex", alignItems: "center", gap: 10
        }}>
          <span style={{ fontWeight: 500, color: "#357ae8", minWidth: 60 }}>Admin:</span>
          <a href={links.adminLink} target="_blank" rel="noopener noreferrer" style={{ color: "#357ae8", textDecoration: "underline", wordBreak: "break-all" }}>{links.adminLink}</a>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "#357ae8", color: "#fff", border: "none", borderRadius: 6, padding: "0.6rem 1.2rem", fontWeight: 500, fontSize: "1rem" }}>Close</button>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import FinalizeDialog from "./FinalizeDialog";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { FaRegClipboard, FaEye, FaEyeSlash } from "react-icons/fa";

export default function AdminPage() {
  // Info box state
  const [showInfo, setShowInfo] = useState(true);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session");
  const adminSecret = params.get("secret");
  const navigate = useNavigate();

  const [participants, setParticipants] = useState([]);
  const [prefs, setPrefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [localPrefs, setLocalPrefs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [showFinalize, setShowFinalize] = useState(false);
  const [allowViewOthers, setAllowViewOthers] = useState(false);
  const [finalized, setFinalized] = useState(false);

  // Credential box state
  const [showSessionId, setShowSessionId] = useState(false);
  const [showAdminSecret, setShowAdminSecret] = useState(false);
  const [copiedSessionId, setCopiedSessionId] = useState(false);
  const [copiedAdminSecret, setCopiedAdminSecret] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("participants, allow_view_others, finalized")
        .eq("session_id", sessionId)
        .eq("admin_secret", adminSecret)
        .single();
      if (sessionError || !session) {
        setError("Session not found or admin secret invalid.");
        setLoading(false);
        return;
      }
      setParticipants(session.participants || []);
      setAllowViewOthers(!!session.allow_view_others);
      setFinalized(!!session.finalized);
      const { data: preferences, error: prefsError } = await supabase
        .from("preferences")
        .select("username, preferences")
        .eq("session_id", sessionId);
      if (prefsError) {
        setError("Error loading preferences.");
        setLoading(false);
        return;
      }
      setPrefs(preferences || []);
      const arr = (session.participants || []).map(name => {
        const found = (preferences || []).find(p => p.username === name);
        return found
          ? [...found.preferences, ...Array((session.participants.length - 1) - found.preferences.length).fill("")]
          : Array((session.participants.length || 0) - 1).fill("");
      });
      setLocalPrefs(arr);
      setLoading(false);
    }
    fetchData();
  }, [sessionId, adminSecret]);

  const submitted = new Set(prefs.map(p => p.username));

  const handlePrefChange = (rowIdx, colIdx, value) => {
    setLocalPrefs(prev => {
      const updated = prev.map(arr => [...arr]);
      updated[rowIdx][colIdx] = value;
      return updated;
    });
  };

  const randomizeAll = () => {
    setLocalPrefs(
      participants.map((name, i) => {
        const others = participants.filter(n => n !== name);
        const shuffled = [...others];
        for (let j = shuffled.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
        }
        return shuffled;
      })
    );
  };

  const randomizeRemaining = () => {
    setLocalPrefs(prev =>
      prev.map((row, i) => {
        const name = participants[i];
        const others = participants.filter(n => n !== name);
        const filled = row.filter((x, idx) => x && others.includes(x));
        const used = new Set(filled);
        const remaining = others.filter(n => !used.has(n));
        for (let j = remaining.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [remaining[j], remaining[k]] = [remaining[k], remaining[j]];
        }
        const newRow = row.map((v, idx) => {
          if (v && others.includes(v)) return v;
          return remaining.shift() || "";
        });
        return newRow;
      })
    );
  };

  const allFilled = localPrefs.length === participants.length && localPrefs.every(row => row.every(v => v));

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      navigate(`/results?session=${sessionId}&admin=1`, {
        state: { simulatedPrefs: localPrefs, participants }
      });
    }, 800);
  };

  const handleFinalize = async () => {
    setFinalizing(true);
    const updates = participants.map((name, i) => ({
      session_id: sessionId,
      username: name,
      preferences: localPrefs[i]
    }));
    const { error: prefsError } = await supabase.from("preferences").upsert(updates, { onConflict: ["session_id", "username"] });
    if (prefsError) {
      setFinalizing(false);
      setShowFinalize(false);
      setError("Error finalizing preferences. Please try again.");
      return;
    }
    const { error: sessionError } = await supabase
      .from("sessions")
      .update({ finalized: true })
      .eq("session_id", sessionId)
      .eq("admin_secret", adminSecret);
    setFinalizing(false);
    setShowFinalize(false);
    if (sessionError) {
      setError("Error updating session as finalized. Please try again.");
      return;
    }
    setFinalized(true);
    window.alert("Preferences finalized and saved for all participants.");
  };

  const handleUnfinalize = async () => {
    setFinalizing(true);
    const { error } = await supabase
      .from("sessions")
      .update({ finalized: false })
      .eq("session_id", sessionId)
      .eq("admin_secret", adminSecret);
    setFinalizing(false);
    if (error) {
      setError("Error unfinalizing session. Please try again.");
      return;
    }
    setFinalized(false);
    window.location.reload();
  };

  const handleAllowViewOthersChange = async e => {
    const val = e.target.checked;
    setAllowViewOthers(val);
    await supabase
      .from("sessions")
      .update({ allow_view_others: val })
      .eq("session_id", sessionId)
      .eq("admin_secret", adminSecret);
  };

  // Credential box component
  // State for links dialog
  const [showLinks, setShowLinks] = useState(false);
  // Generate links for dialog
  const baseUrl = window.location.origin;
  const participantLinks = participants.map(
    name => `${baseUrl}/invite?session=${sessionId}&user=${encodeURIComponent(name)}`
  );
  const adminLink = `${baseUrl}/admin?session=${sessionId}&secret=${adminSecret}`;
  const CredentialBox = ({
    label,
    value,
    show,
    setShow,
    copied,
    setCopied
  }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: 180, marginLeft: 16 }}>
      <span style={{ fontSize: 13, color: "#357ae8", fontWeight: 500, marginBottom: 2 }}>{label}</span>
      <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          readOnly
          style={{
            width: "100%",
            padding: "0.5rem 2.2rem 0.5rem 0.7rem",
            borderRadius: 6,
            border: "1px solid #e0e7ef",
            background: "#f5f7fa",
            fontSize: 14,
            letterSpacing: show ? "normal" : "0.2em"
          }}
        />
        <span
          style={{
            position: "absolute",
            right: 32,
            cursor: "pointer",
            color: "#357ae8",
            fontSize: 18,
            padding: 2
          }}
          title={show ? "Hide" : "Show"}
          onClick={() => setShow(s => !s)}
        >
          {show ? <FaEye /> : <FaEyeSlash />}
        </span>
        <span
          style={{
            position: "absolute",
            right: 6,
            cursor: "pointer",
            color: copied ? "#22c55e" : "#357ae8",
            fontSize: 18,
            padding: 2
          }}
          title="Copy"
          onClick={() => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
        >
          <FaRegClipboard />
        </span>
      </div>
    </div>
  );

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (error) return <div style={{ color: "#d32f2f", padding: 40 }}>{error}</div>;

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: "100%",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        padding: "2rem 1.5rem",
        minWidth: "320px",
        border: "1px solid #e0e7ef"
      }}
    >
      {/* Header row with Admin Monitor and credentials */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem" }}>
        <h2 style={{ margin: 0, color: "#357ae8", fontWeight: 700 }}>Admin Monitor</h2>
        <div style={{ display: "flex", flexDirection: "row", gap: 16 }}>
          <CredentialBox
            label="Session ID"
            value={sessionId}
            show={showSessionId}
            setShow={setShowSessionId}
            copied={copiedSessionId}
            setCopied={setCopiedSessionId}
          />
          <CredentialBox
            label="Admin Secret"
            value={adminSecret}
            show={showAdminSecret}
            setShow={setShowAdminSecret}
            copied={copiedAdminSecret}
            setCopied={setCopiedAdminSecret}
          />
        </div>
      </div>
      {/* Info box for saving credentials */}
      {showInfo && (
        <div style={{
          display: "flex", alignItems: "center", background: "#e0e7ef", color: "#357ae8", borderRadius: 8,
          padding: "0.8rem 1.2rem", marginBottom: 18, fontSize: 15, boxShadow: "0 1px 4px rgba(53,122,232,0.07)", position: "relative"
        }}>
          <FaInfoCircle style={{ marginRight: 10, fontSize: 20 }} />
          <span style={{ flex: 1 }}>
            Save your <b>Session ID</b> and <b>Admin Secret</b> to return to this admin page in the future.
          </span>
          <button onClick={() => setShowInfo(false)} style={{ background: "none", border: "none", color: "#357ae8", fontSize: 20, cursor: "pointer", marginLeft: 10, lineHeight: 1 }} title="Dismiss">×</button>
        </div>
      )}
      {/* Action buttons row */}
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "1.2rem", justifyContent: "flex-start", width: "100%" }}>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-start", width: "100%" }}>
          <button
            type="button"
            onClick={randomizeAll}
            style={{
              background: "#4f8cff",
              color: "#fff",
              borderRadius: "6px",
              padding: "0.7rem 1.5rem",
              border: "none",
              fontWeight: "500",
              fontSize: "1rem"
            }}
            disabled={finalized}
          >
            Randomize All
          </button>
          <button
            type="button"
            onClick={randomizeRemaining}
            style={{
              background: "#357ae8",
              color: "#fff",
              borderRadius: "6px",
              padding: "0.7rem 1.5rem",
              border: "none",
              fontWeight: "500",
              fontSize: "1rem"
            }}
            disabled={finalized}
          >
            Randomize Remaining
          </button>
          <button
            type="button"
            onClick={() => setShowLinks(true)}
            style={{
              background: "#eab308",
              color: "#fff",
              borderRadius: "6px",
              padding: "0.7rem 1.5rem",
              border: "none",
              fontWeight: "500",
              fontSize: "1rem"
            }}
          >
            Links
          </button>
          {finalized ? (
            <button
              type="button"
              onClick={handleUnfinalize}
              style={{
                background: "#ef4444",
                color: "#fff",
                borderRadius: "6px",
                padding: "0.7rem 1.5rem",
                border: "none",
                fontWeight: "500",
                fontSize: "1rem",
                cursor: finalizing ? "not-allowed" : "pointer"
              }}
              disabled={finalizing}
            >
              {finalizing ? "Unfinalizing..." : "Unfinalize"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowFinalize(true)}
              disabled={!allFilled || finalizing}
              style={{
                background: !allFilled || finalizing ? "#bfc8d6" : "#d97706",
                color: "#fff",
                borderRadius: "6px",
                padding: "0.7rem 1.5rem",
                border: "none",
                fontWeight: "500",
                fontSize: "1rem",
                cursor: !allFilled || finalizing ? "not-allowed" : "pointer"
              }}
            >
              {finalizing ? "Finalizing..." : "Finalize"}
            </button>
          )}
  <LinksDialog open={showLinks} onClose={() => setShowLinks(false)} links={{ participantLinks, adminLink }} participants={participants} />
        </div>
  {/* Credentials removed from here */}
      </div>
      <FinalizeDialog open={showFinalize} onCancel={() => setShowFinalize(false)} onConfirm={handleFinalize} />
      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: "0 0.5rem",
          marginBottom: "1rem"
        }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "0.5rem 0.5rem 0.5rem 0" }}>Name</th>
              <th>Status</th>
              {participants.map((name, idx) => (
                <th key={idx} style={{ padding: "0.5rem" }}>{`${idx + 1}${idx === 0 ? "st" : idx === 1 ? "nd" : idx === 2 ? "rd" : "th"}`}</th>
              )).slice(0, participants.length - 1)}
            </tr>
          </thead>
          <tbody>
            {participants.map((name, rowIdx) => (
              <tr key={rowIdx}>
                <td style={{ fontWeight: "500", color: "#357ae8", padding: "0.5rem" }}>{name}</td>
                <td style={{ padding: "0.5rem" }}>
                  <span style={{
                    display: "inline-block",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: submitted.has(name) ? "#22c55e" : "#ef4444",
                    marginRight: 8,
                    verticalAlign: "middle"
                  }} />
                  {submitted.has(name) ? "Submitted" : "Waiting"}
                </td>
                {participants.filter(n => n !== name).map((other, colIdx) => {
                  const selected = localPrefs[rowIdx].filter((v, i) => i !== colIdx);
                  const isDuplicate = selected.includes(localPrefs[rowIdx][colIdx]);
                  const isInvalid = localPrefs[rowIdx][colIdx] && !participants.filter(n => n !== name).includes(localPrefs[rowIdx][colIdx]);
                  return (
                    <td key={colIdx} style={{ padding: "0.5rem", minWidth: "120px" }}>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input
                          type="text"
                          value={isDuplicate || isInvalid ? "" : localPrefs[rowIdx][colIdx] || ""}
                          onChange={e => {
                            const value = e.target.value;
                            const validOptions = participants.filter(n => n !== name);
                            if (!validOptions.includes(value) || selected.includes(value)) {
                              handlePrefChange(rowIdx, colIdx, "");
                            } else {
                              handlePrefChange(rowIdx, colIdx, value);
                            }
                          }}
                          placeholder={other}
                          list={`prefs-list-${rowIdx}`}
                          style={{
                            width: "100%",
                            minWidth: "100px",
                            padding: "0.6rem 0.8rem",
                            borderRadius: "6px",
                            border: isDuplicate || isInvalid ? "2px solid #d32f2f" : "1px solid #bfc8d6",
                            background: finalized ? "#f0f2f7" : "#f5f7fa",
                            fontSize: "1rem",
                            marginRight: "0.2rem"
                          }}
                          disabled={finalized}
                        />
                        <datalist id={`prefs-list-${rowIdx}`}>
                          {participants.filter(n => n !== name && !selected.includes(n)).map((opt, i) => (
                            <option key={i} value={opt} />
                          ))}
                        </datalist>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ margin: "1.2rem 0" }}>
        <span style={{ fontWeight: 500, color: "#357ae8", marginRight: 16 }}>
          Allow participants to view all matchings
        </span>
        <label style={{ position: "relative", display: "inline-block", width: 48, height: 24, verticalAlign: "middle" }}>
          <input
            type="checkbox"
            checked={allowViewOthers}
            onChange={handleAllowViewOthersChange}
            disabled={finalized}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{
            position: "absolute",
            cursor: finalized ? "not-allowed" : "pointer",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: allowViewOthers ? "#357ae8" : "#bfc8d6",
            borderRadius: 24,
            transition: "background 0.2s"
          }} />
          <span style={{
            position: "absolute",
            left: allowViewOthers ? 24 : 2,
            top: 2,
            width: 20,
            height: 20,
            background: "#fff",
            borderRadius: "50%",
            boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
            transition: "left 0.2s"
          }} />
        </label>
      </div>
      <button
        type="submit"
        disabled={submitting}
        style={{
          background: submitting ? "#bfc8d6" : "#357ae8",
          color: "#fff",
          borderRadius: "6px",
          padding: "0.7rem 1.5rem",
          border: "none",
          fontWeight: "500",
          fontSize: "1rem",
          cursor: submitting ? "not-allowed" : "pointer"
        }}
      >
        {submitting ? "Loading..." : "Submit Preferences"}
      </button>
    </form>
  );
}