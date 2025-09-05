
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { stableRoommates } from "./stableRoommates";
import { fillMissingPreferences } from "./utils";

function ordinal(n) {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

export default function InviteResultsPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session");
  const username = params.get("user");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [participants, setParticipants] = useState([]);
  const [prefs, setPrefs] = useState([]);
  const [finalized, setFinalized] = useState(false);
  const [allowViewOthers, setAllowViewOthers] = useState(false);
  const [matchings, setMatchings] = useState(null);


  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      // Get session info
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("participants, finalized, allow_view_others")
        .eq("session_id", sessionId)
        .single();
      if (sessionError || !session) {
        setError("Session not found.");
        setLoading(false);
        return;
      }
      setParticipants(session.participants || []);
      setFinalized(!!session.finalized);
      setAllowViewOthers(!!session.allow_view_others);

      // Get all preferences
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

      // Only run matching if finalized
      if (session.finalized) {
        const prefsObj = {};
        for (const p of preferences) prefsObj[p.username] = p.preferences;
        // Build array of { name, preferences }
        const participantObjs = (session.participants || []).map(name => ({
          name,
          preferences: prefsObj[name] || []
        }));
        // Fill missing preferences as in ResultsPage
        const filled = fillMissingPreferences(participantObjs, "random");
        try {
          const pairs = stableRoommates(filled);
          // Convert pairs to a matching object: { P1: P2, P2: P1, ... }
          const matchingObj = {};
          for (const [a, b] of pairs) {
            matchingObj[a] = b;
            matchingObj[b] = a;
          }
          setMatchings(matchingObj);
        } catch (e) {
          setMatchings(null);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [sessionId, username]);

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (error) return <div style={{ color: "#d32f2f", padding: 40 }}>{error}</div>;

  // Check if user has submitted
  const userPref = prefs.find(p => p.username === username);
  if (!userPref) {
    return (
      <div style={{ padding: 40, color: "#357ae8" }}>
        Hi {username}, please submit your preferences first.
        <br />
        <button
          style={{
            marginTop: 24,
            background: "#357ae8",
            color: "#fff",
            borderRadius: "6px",
            padding: "0.7rem 1.5rem",
            border: "none",
            fontWeight: "500",
            fontSize: "1rem",
            cursor: "pointer"
          }}
          onClick={() => navigate(`/stable-roommates/invite?session=${sessionId}&user=${username}`)}
        >
          Go to Preferences Entry
        </button>
      </div>
    );
  }

  // Not finalized
  if (!finalized) {
    return (
      <div style={{ padding: 40, color: "#357ae8" }}>
        Hi {username}, thank you for submitting. Waiting on admin to finalize the results.
      </div>
    );
  }

  // Finalized, get user's match and pick number
  let userMatch = null, userPick = null;
  if (matchings && matchings[username]) {
    userMatch = matchings[username];
    if (userPref && Array.isArray(userPref.preferences) && userMatch) {
      const idx = userPref.preferences.indexOf(userMatch);
      userPick = idx !== -1 ? idx + 1 : null;
    }
  }

  // Finalized, not view others
  if (!allowViewOthers) {
    return (
      <div style={{ padding: 40, color: "#357ae8" }}>
        {userPick
          ? <>Hi {username}, the results are in and you got your {ordinal(userPick)} pick with <b>{userMatch}</b>!</>
          : <>Hi {username}, the results are in but you did not rank your match (<b>{userMatch}</b>) in your preferences.</>
        }
      </div>
    );
  }

  // Finalized, view others enabled
  return (
    <div style={{
      display: "flex",
      gap: "2rem",
      alignItems: "flex-start",
      padding: 40,
      flexWrap: "wrap"
    }}>
      {/* Left: user result */}
      <div style={{
        minWidth: 320,
        background: "#f5f7fa",
        borderRadius: 10,
        padding: "2rem 1.5rem",
        border: "1px solid #e0e7ef",
        flex: 1
      }}>
        <div style={{ color: "#357ae8", fontSize: "1.2rem", marginBottom: 16 }}>
          Hi {username}, the results are in and you got your {ordinal(userPick)} pick with <b>{userMatch}</b>!
        </div>
      </div>
      {/* Divider */}
      <div style={{
        width: 2,
        background: "#e0e7ef",
        minHeight: 180,
        alignSelf: "stretch"
      }} />
      {/* Right: all matches, no preferences */}
      <div style={{
        minWidth: 320,
        background: "#fff",
        borderRadius: 10,
        padding: "2rem 1.5rem",
        border: "1px solid #e0e7ef",
        flex: 1
      }}>
        <div style={{ color: "#357ae8", fontWeight: 500, marginBottom: 16 }}>
          All Matches
        </div>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1.2rem"
        }}>
          {matchings && participants.map(name => {
            const match = matchings[name];
            // Only show each pair once
            if (!match || name > match) return null;
            return (
              <div key={name} style={{
                background: "#f5f7fa",
                borderRadius: 8,
                padding: "1rem 1.5rem",
                minWidth: 120,
                textAlign: "center",
                border: "1px solid #e0e7ef",
                fontWeight: 500,
                fontSize: "1.1rem",
                position: "relative"
              }}>
                <span style={{ color: "#357ae8" }}>{name}</span>
                <span style={{
                  margin: "0 8px",
                  color: "#bfc8d6",
                  fontWeight: 400
                }}>↔</span>
                <span style={{ color: "#357ae8" }}>{match}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
