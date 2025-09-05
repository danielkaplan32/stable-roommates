import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { saveResultsToDB } from "./utils/saveResultsToDB";
import { fillMissingPreferences } from "./utils";
import { stableRoommates } from "./stableRoommates";
import { FaRegClipboard, FaDownload } from "react-icons/fa";
import { downloadResultsAsPDF } from "./downloadResultsAsPDF";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session");
  let { results: navResults, participants: navParticipants, simulatedPrefs } = location.state || {};
  const [results, setResults] = useState(navResults || null);
  const [participants, setParticipants] = useState(navParticipants || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // For manual flow: generate a random sessionId if needed
  function generateRandomId(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for (let i = 0; i < length; i++) str += chars[Math.floor(Math.random() * chars.length)];
    return str;
  }
  const [shareLoading, setShareLoading] = useState(false);

  // Always reconstruct from simulatedPrefs if present
  useEffect(() => {
    if (simulatedPrefs && navParticipants) {
      const filled = navParticipants.map((name, i) => ({ name, preferences: simulatedPrefs[i].filter(Boolean) }));
      setParticipants(filled);
      setResults(stableRoommates(filled));
      return;
    }
    async function fetchData() {
      if (results && participants) return;
      if (!sessionId) return;
      setLoading(true);
      setError("");
      // Get session for participants
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("participants")
        .eq("session_id", sessionId)
        .single();
      if (sessionError || !session) {
        setError("Session not found.");
        setLoading(false);
        return;
      }
      // Get preferences
      const { data: prefs, error: prefsError } = await supabase
        .from("preferences")
        .select("username, preferences")
        .eq("session_id", sessionId);
      if (prefsError) {
        setError("Could not load preferences.");
        setLoading(false);
        return;
      }
      // Build participants array with preferences
      const partArr = (session.participants || []).map(name => {
        const found = (prefs || []).find(p => p.username === name);
        return {
          name,
          preferences: found ? found.preferences : []
        };
      });
      setParticipants(partArr);
      // Run stable roommates
      const filled = fillMissingPreferences(
        partArr.map(p => ({ name: p.name, preferences: p.preferences.filter(Boolean) })),
        "random"
      );
      const res = stableRoommates(filled);
      setResults(res);
      setLoading(false);
    }
    fetchData();
    // eslint-disable-next-line
  }, [sessionId, simulatedPrefs, navParticipants]);

  // Build a lookup for matches
  const matchMap = {};
  if (results && results.length > 0) {
    results.forEach(pair => {
      matchMap[pair[0]] = pair[1];
      matchMap[pair[1]] = pair[0];
    });
  }

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (error) return <div style={{ color: "#d32f2f", padding: 40 }}>{error}</div>;

  // Defensive: ensure participants is array of objects with preferences
  const validParticipants = Array.isArray(participants) && participants.length > 0 && typeof participants[0] === 'object' && participants[0] !== null && 'preferences' in participants[0];

  return (
    <div className="results-page" style={{ maxWidth: "1400px", margin: "3rem auto", background: "#fff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", padding: "2.5rem 2.5rem", border: "1px solid #e0e7ef", display: "flex", gap: "0", alignItems: "flex-start", position: "relative" }}>
      {/* Share/Download buttons */}
      <div style={{ position: "absolute", top: 24, right: 32, display: "flex", gap: 16, zIndex: 10 }}>
        {/* Only show one of these two buttons at a time */}
        {!sessionId && results && participants ? (
          <button
            title="Share results with a unique link"
            onClick={async () => {
              setShareLoading(true);
              const newSessionId = generateRandomId();
              try {
                await saveResultsToDB({ sessionId: newSessionId, pairings: results, participants });
                navigate(`/results?session=${newSessionId}`);
              } catch (e) {
                alert("Error sharing results: " + (e.message || e));
              }
              setShareLoading(false);
            }}
            style={{ background: "#e0e7ef", color: "#357ae8", border: "none", borderRadius: 6, padding: "0.6rem 1.2rem", fontWeight: 500, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8, cursor: shareLoading ? "not-allowed" : "pointer" }}
            disabled={shareLoading}
          >
            <FaRegClipboard style={{ fontSize: 18 }} /> {shareLoading ? "Sharing..." : "Share"}
          </button>
        ) : sessionId ? (
          <button
            title={copied ? "Link copied!" : "Copy link"}
            onClick={async () => {
              await navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            style={{ background: copied ? "#22c55e" : "#e0e7ef", color: copied ? "#fff" : "#357ae8", border: "none", borderRadius: 6, padding: "0.6rem 1.2rem", fontWeight: 500, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
          >
            <FaRegClipboard style={{ fontSize: 18 }} /> {copied ? "Copied!" : "Copy Link"}
          </button>
        ) : null}
        <button
          title="Download as PDF"
          onClick={() => downloadResultsAsPDF({ results, participants, filename: "results.pdf" })}
          style={{ background: "#e0e7ef", color: "#357ae8", border: "none", borderRadius: 6, padding: "0.6rem 1.2rem", fontWeight: 500, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
        >
          <FaDownload style={{ fontSize: 18 }} /> Download
        </button>
      </div>
      <div id="results-content" style={{ flex: 1, padding: "2rem 2rem 2rem 0", boxSizing: "border-box", minWidth: 0 }}>
        <h2 style={{ color: "#357ae8", marginBottom: "1.2rem", fontSize: "1.5rem" }}>Results</h2>
        {!results || results.length === 0 ? (
          <p style={{ fontSize: "1.15rem" }}>No stable matching found or data incomplete.</p>
        ) : (
          <div style={{ marginBottom: "2rem", fontSize: "1.15rem", display: "flex", flexDirection: "column", gap: "1.5rem", justifyContent: "flex-start" }}>
            {results.map((pair, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", background: "#f5f7fa", borderRadius: "8px", padding: "1rem 2rem", minWidth: "320px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                <span style={{ fontWeight: "500", color: "#357ae8", minWidth: "120px", textAlign: "right", fontSize: "1.15rem" }}>{pair[0]}</span>
                <span style={{ display: "inline-block", minWidth: "60px", textAlign: "center", fontSize: "1.5rem", color: "#bfc8d6" }}>&mdash;</span>
                <span style={{ fontWeight: "500", color: "#357ae8", minWidth: "120px", textAlign: "left", fontSize: "1.15rem" }}>{pair[1]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ width: "2px", background: "#e0e7ef", margin: "2.5rem 0", alignSelf: "stretch", borderRadius: "2px" }}></div>
      {/* Preferences grid visualization */}
      {validParticipants && (
        <div style={{ flex: 1, marginTop: "0", padding: "2rem 0 2rem 2rem", boxSizing: "border-box" }}>
          <h3 style={{ color: "#357ae8", marginBottom: "1rem", fontSize: "1.5rem" }}>Preferences Overview</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 0.5rem", marginBottom: "1rem" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "0.5rem 0.5rem 0.5rem 0" }}>Name</th>
                  {participants[0].preferences.map((_, idx) => (
                    <th key={idx} style={{ padding: "0.5rem" }}>{`${idx + 1}${idx === 0 ? "st" : idx === 1 ? "nd" : idx === 2 ? "rd" : "th"}`}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {participants.map((p, rowIdx) => (
                  <tr key={rowIdx}>
                    <td style={{ fontWeight: "500", color: "#357ae8", padding: "0.5rem" }}>{p.name}</td>
                    {Array.isArray(p.preferences) && p.preferences.map((other, colIdx) => {
                      const isMatch = matchMap[p.name] === other;
                      return (
                        <td key={colIdx} style={{ padding: "0.5rem", minWidth: "120px" }}>
                          <div style={{
                            background: isMatch ? "#dbeafe" : "#f5f7fa",
                            borderRadius: "6px",
                            padding: "0.6rem 0.8rem",
                            fontSize: "1rem",
                            textAlign: "center",
                            fontWeight: isMatch ? 600 : 400,
                            color: isMatch ? "#357ae8" : undefined,
                            border: isMatch ? "2px solid #357ae8" : "1px solid #e0e7ef"
                          }}>
                            {other}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
