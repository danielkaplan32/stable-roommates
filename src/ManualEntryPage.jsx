import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";

export default function ManualEntryPage() {
  const [participants, setParticipants] = useState([""]);
  const [csvText, setCsvText] = useState("");
  const [csvParticipants, setCsvParticipants] = useState([]);
  const [csvPrefs, setCsvPrefs] = useState([]);
  const [csvReady, setCsvReady] = useState(false);
  const [csvWarning, setCsvWarning] = useState("");
  const [manualWarning, setManualWarning] = useState("");
  const [oddNote, setOddNote] = useState("");
  const navigate = useNavigate();

  const handleCsvChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      setCsvText(evt.target.result);
      const lines = evt.target.result.trim().split(/\r?\n/);
      let parsed = lines.map(line => line.split(",").map(cell => cell.trim()));
      // Remove duplicate names in first column
      const seen = new Set();
      let warning = "";
      parsed = parsed.filter((row, idx) => {
        const name = row[0];
        if (!name || seen.has(name)) {
          warning = "Duplicate participant names detected in CSV. Duplicates have been removed.";
          return false;
        }
        seen.add(name);
        return true;
      });
      // Remove duplicate names from each preference row
      const names = parsed.map(row => row[0]);
      const prefs = parsed.map(row => {
        const uniquePrefs = [];
        const prefSet = new Set();
        row.slice(1).forEach(cell => {
          if (cell && !prefSet.has(cell) && names.includes(cell)) {
            prefSet.add(cell);
            uniquePrefs.push(cell);
          }
        });
        return uniquePrefs;
      });
      let finalNames = names;
      let finalPrefs = prefs;
      let oddMsg = "";
      if (finalNames.length % 2 === 1) {
        finalNames = [...finalNames, "Dummy"];
        finalPrefs = [...finalPrefs, []];
        oddMsg = "Odd number of participants detected in CSV. A 'Dummy' participant has been added and will be paired with someone.";
      }
      setCsvParticipants(finalNames);
      setCsvPrefs(finalPrefs);
      setCsvWarning(warning);
      setOddNote(oddMsg);
      setCsvReady(true);
    };
    reader.readAsText(file);
  };

  const handleNameChange = (idx, value) => {
    const updated = [...participants];
    updated[idx] = value;
    setParticipants(updated);
    // Check for duplicates
    const filtered = updated.filter(n => n.trim());
    const lower = filtered.map(n => n.toLowerCase());
    if (new Set(lower).size !== lower.length) {
      setManualWarning("Duplicate participant names detected. Please ensure all names are unique.");
    } else {
      setManualWarning("");
    }
  };
  const addParticipant = () => setParticipants([...participants, ""]);
  const removeParticipant = idx => setParticipants(participants.filter((_, i) => i !== idx));

  const goToPrefs = () => {
    const filtered = participants.filter(n => n.trim());
    const lower = filtered.map(n => n.toLowerCase());
    if (filtered.length < 2) {
      setManualWarning("Add at least 2 participants.");
      return;
    }
    if (new Set(lower).size !== lower.length) {
      setManualWarning("Duplicate participant names detected. Please ensure all names are unique.");
      return;
    }
    setManualWarning("");
    let finalFiltered = filtered;
    let oddMsg = "";
    if (finalFiltered.length % 2 === 1) {
      finalFiltered = [...finalFiltered, "Dummy"];
      oddMsg = "Odd number of participants detected. A 'Dummy' participant has been added and will be paired with someone.";
    }
    setOddNote(oddMsg);
    navigate("/preferences", {
      state: {
        participants: finalFiltered,
        prefs: finalFiltered.map(() => Array(finalFiltered.length - 1).fill(""))
      }
    });
  };

  return (
  <div style={{
      display: "flex",
      flexDirection: "row",
      gap: "2rem",
      justifyContent: "center",
      alignItems: "flex-start",
      maxWidth: "900px",
      margin: "2rem auto"
    }}>
      <div style={{
        flex: 1,
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        padding: "2rem 1.5rem",
        minWidth: "320px",
        border: "1px solid #e0e7ef"
      }}>
        <h2 style={{ marginBottom: "1.2rem", color: "#357ae8" }}>Add Participants</h2>
        {manualWarning && (
          <div style={{ color: "#d32f2f", marginBottom: "0.8rem", fontWeight: "500" }}>{manualWarning}</div>
        )}
        {oddNote && (
          <div style={{ color: "#357ae8", marginBottom: "0.8rem", fontWeight: "500" }}>{oddNote}</div>
        )}
        <div style={{ marginBottom: "1.2rem" }}>
          {participants.map((name, idx) => (
            <div key={idx} style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.75rem"
            }}>
              <input
                type="text"
                placeholder={`Participant ${idx + 1}`}
                value={name}
                onChange={e => handleNameChange(idx, e.target.value)}
                required
                style={{
                  flex: 1,
                  padding: "0.7rem",
                  borderRadius: "6px",
                  border: "1px solid #bfc8d6",
                  background: "#f5f7fa",
                  fontSize: "1rem"
                }}
              />
              <button
                type="button"
                onClick={() => removeParticipant(idx)}
                style={{
                  background: "none",
                  color: "#d32f2f",
                  padding: "0.3rem",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.2rem"
                }}
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button
            type="button"
            onClick={addParticipant}
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
            Add Another
          </button>
          <button
            type="button"
            onClick={goToPrefs}
            disabled={!!manualWarning}
            style={{
              background: !!manualWarning ? "#bfc8d6" : "#357ae8",
              color: "#fff",
              borderRadius: "6px",
              padding: "0.7rem 1.5rem",
              border: "none",
              fontWeight: "500",
              fontSize: "1rem",
              cursor: !!manualWarning ? "not-allowed" : "pointer"
            }}
          >
            Next
          </button>
        </div>
      </div>
      <div style={{
        flex: 1,
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        padding: "2rem 1.5rem",
        minWidth: "320px",
        borderLeft: "1px solid #e0e7ef",
        border: "1px solid #e0e7ef"
      }}>
        <h2 style={{ marginBottom: "1.2rem", color: "#357ae8" }}>Or Upload CSV/TXT</h2>
        {csvWarning && (
          <div style={{ color: "#d32f2f", marginBottom: "0.8rem", fontWeight: "500" }}>{csvWarning}</div>
        )}
        {oddNote && csvReady && (
          <div style={{ color: "#357ae8", marginBottom: "0.8rem", fontWeight: "500" }}>{oddNote}</div>
        )}
        <div style={{ marginBottom: "1rem", fontSize: "0.95rem", color: "#555" }}>
          <strong>Example format:</strong>
          <pre style={{
            background: "#f5f7fa",
            padding: "0.5rem",
            borderRadius: "6px",
            fontSize: "0.95rem",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            maxWidth: "100%",
            overflowX: "auto"
          }}>
Name,Pref1,Pref2,Pref3
Alice,Bob,Charlie,David
Bob,Charlie,David,Alice
Charlie,David,Alice,Bob
David,Alice,Bob,Charlie
          </pre>
        </div>
        <label htmlFor="csv-upload" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.7rem",
          background: "#4f8cff",
          color: "#fff",
          borderRadius: "8px",
          padding: "1rem 2rem",
          fontSize: "1.15rem",
          fontWeight: "500",
          cursor: "pointer",
          marginTop: "0.5rem",
          border: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
        }}>
          <FaFileAlt size={28} style={{ marginRight: "0.5rem" }} />
          Upload CSV or TXT
          <input
            id="csv-upload"
            type="file"
            accept=".csv,.txt"
            onChange={handleCsvChange}
            style={{ display: "none" }}
          />
        </label>
        {csvReady && (
          <button
            type="button"
            style={{
              background: "#357ae8",
              color: "#fff",
              borderRadius: "6px",
              padding: "0.7rem 1.5rem",
              border: "none",
              fontWeight: "500",
              fontSize: "1rem",
              marginTop: "1rem"
            }}
            onClick={() => {
              navigate("/preferences", {
                state: {
                  participants: csvParticipants,
                  prefs: csvPrefs
                }
              });
              setCsvReady(false);
            }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}