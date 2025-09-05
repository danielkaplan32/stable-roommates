import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fillMissingPreferences } from "./utils";
import { stableRoommates } from "./stableRoommates";

export default function PreferencesEntryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { participants: initialParticipants = [], prefs: initialPrefs = [] } = location.state || {};

  const [participants, setParticipants] = useState(initialParticipants);
  const [prefs, setPrefs] = useState(
    initialPrefs.length === initialParticipants.length
      ? initialPrefs
      : initialParticipants.map(() => Array(initialParticipants.length - 1).fill(""))
  );
  const [loading, setLoading] = useState(false);

  const handlePrefChange = (rowIdx, colIdx, value) => {
    const updated = prefs.map(arr => [...arr]);
    updated[rowIdx][colIdx] = value;
    setPrefs(updated);
  };

  const handlePrefsSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const data = participants.map((name, i) => ({ name, preferences: prefs[i].filter(Boolean) }));
      const filled = fillMissingPreferences(data, "random");
      const results = stableRoommates(filled);
      setLoading(false);
      navigate("/results", { state: { results, participants: filled } });
    }, 300);
  };

  return (
    <form
      onSubmit={handlePrefsSubmit}
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
      <h2 style={{ marginBottom: "1.2rem", color: "#357ae8" }}>Enter Preferences</h2>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.2rem" }}>
        <button
          type="button"
          onClick={() => {
            const randomized = participants.map((name, i) => {
              const others = participants.filter(n => n !== name);
              const shuffled = [...others];
              for (let j = shuffled.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
              }
              return shuffled;
            });
            setPrefs(randomized);
          }}
          style={{
            background: "#4f8cff",
            color: "#fff",
            borderRadius: "6px",
            padding: "0.7rem 1.5rem",
            border: "none",
            fontWeight: "500",
            fontSize: "1rem"
          }}
        >
          Randomize All
        </button>
        <button
          type="button"
          onClick={() => {
            const randomized = prefs.map((row, i) => {
              const name = participants[i];
              const others = participants.filter(n => n !== name);
              const filled = row.filter(x => x && others.includes(x));
              const remaining = others.filter(n => !filled.includes(n));
              for (let j = remaining.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [remaining[j], remaining[k]] = [remaining[k], remaining[j]];
              }
              return [...filled, ...remaining];
            });
            setPrefs(randomized);
          }}
          style={{
            background: "#357ae8",
            color: "#fff",
            borderRadius: "6px",
            padding: "0.7rem 1.5rem",
            border: "none",
            fontWeight: "500",
            fontSize: "1rem"
          }}
        >
          Randomize Remaining
        </button>
      </div>
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
              {participants.map((name, idx) => (
                <th key={idx} style={{ padding: "0.5rem" }}>{`${idx + 1}${idx === 0 ? "st" : idx === 1 ? "nd" : idx === 2 ? "rd" : "th"}`}</th>
              )).slice(0, participants.length - 1)}
            </tr>
          </thead>
          <tbody>
            {participants.map((name, rowIdx) => (
              <tr key={rowIdx}>
                <td style={{ fontWeight: "500", color: "#357ae8", padding: "0.5rem" }}>{name}</td>
                {participants.filter(n => n !== name).map((other, colIdx) => {
                  const selected = prefs[rowIdx].filter((v, i) => i !== colIdx);
                  const isDuplicate = selected.includes(prefs[rowIdx][colIdx]);
                  const isInvalid = prefs[rowIdx][colIdx] && !participants.filter(n => n !== name).includes(prefs[rowIdx][colIdx]);
                  return (
                    <td key={colIdx} style={{ padding: "0.5rem", minWidth: "120px" }}>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input
                          type="text"
                          value={isDuplicate || isInvalid ? "" : prefs[rowIdx][colIdx] || ""}
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
                            background: "#f5f7fa",
                            fontSize: "1rem",
                            marginRight: "0.2rem"
                          }}
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
      <button
        type="submit"
        disabled={loading}
        style={{
          background: loading ? "#bfc8d6" : "#357ae8",
          color: "#fff",
          borderRadius: "6px",
          padding: "0.7rem 1.5rem",
          border: "none",
          fontWeight: "500",
          fontSize: "1rem",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Finding matches..." : "Submit Preferences"}
      </button>
    </form>
  );
}
