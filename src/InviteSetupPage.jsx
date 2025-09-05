import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaFileAlt } from "react-icons/fa";
import { createSession } from "./utils/generateSession";

export default function InviteSetupPage() {
  const [names, setNames] = useState([""]);
  const [links, setLinks] = useState([]);
  const [adminLink, setAdminLink] = useState("");
  const [warning, setWarning] = useState("");
  const [csvWarning, setCsvWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (idx, value) => {
    const updated = [...names];
    updated[idx] = value;
    setNames(updated);
  };

  const addName = () => setNames([...names, ""]);
  const removeName = idx => setNames(names.filter((_, i) => i !== idx));

  // Check for duplicate names
  const hasDuplicates = () => {
    const filtered = names.filter(name => name.trim());
    const lower = filtered.map(n => n.toLowerCase());
    return new Set(lower).size !== lower.length;
  };

  const generateLinks = async () => {
    if (hasDuplicates()) {
      setWarning("Duplicate names detected. Please ensure all participant names are unique.");
      setLinks([]);
      setAdminLink("");
      return;
    }
    setWarning("");
    setLoading(true);
    try {
      const filteredNames = names.filter(name => name.trim());
      const { session_id, admin_secret } = await createSession(filteredNames);
      const base = window.location.origin;
      const inviteLinks = filteredNames.map(name =>
        `${base}/invite?session=${session_id}&user=${encodeURIComponent(name)}`
      );
      setLinks(inviteLinks);
      setAdminLink(`${base}/admin?session=${session_id}&secret=${admin_secret}`);
    } catch (err) {
      setWarning("Error creating session. Please try again.");
      setLinks([]);
      setAdminLink("");
    }
    setLoading(false);
  };

  // CSV/TXT upload logic (names only)
  const handleCsvChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      setCsvWarning("");
      // Split on newlines, then split each line on comma, tab, or whitespace
      let namesArr = evt.target.result
        .split(/\r?\n/)
        .flatMap(line => line.split(/,|\t|\s+/))
        .map(name => name.trim())
        .filter(Boolean);
      // Remove empty and duplicate names
      const seen = new Set();
      let warning = "";
      namesArr = namesArr.filter(name => {
        if (!name || seen.has(name)) {
          warning = "Duplicate or empty participant names detected in file. Duplicates have been removed.";
          return false;
        }
        seen.add(name);
        return true;
      });
      if (namesArr.length === 0) {
        setCsvWarning("No valid participant names found in file.");
        return;
      }
      setNames(namesArr);
      setCsvWarning(warning);
    };
    reader.readAsText(file);
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
      {/* Left: Manual entry */}
      <div style={{
        flex: 1,
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        padding: "2rem 1.5rem",
        minWidth: "320px",
        border: "1px solid #e0e7ef"
      }}>
        <h2 style={{ marginBottom: "1.2rem", color: "#357ae8" }}>Invite Setup</h2>
        <div style={{ marginBottom: "1.2rem" }}>
          {names.map((name, idx) => (
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
                onChange={e => handleChange(idx, e.target.value)}
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
                onClick={() => removeName(idx)}
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
            onClick={addName}
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
            Add Name
          </button>
          <button
            type="button"
            onClick={generateLinks}
            disabled={hasDuplicates()}
            style={{
              background: hasDuplicates() ? "#bfc8d6" : "#357ae8",
              color: "#fff",
              borderRadius: "6px",
              padding: "0.7rem 1.5rem",
              border: "none",
              fontWeight: "500",
              fontSize: "1rem",
              cursor: hasDuplicates() ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Generating..." : "Generate Links"}
          </button>
        </div>
        {hasDuplicates() && (
          <div style={{ color: "#d32f2f", marginTop: "1rem", fontWeight: "500" }}>
            Duplicate names detected. Please ensure all participant names are unique.
          </div>
        )}
        {warning && (
          <div style={{ color: "#d32f2f", marginTop: "1rem", fontWeight: "500" }}>
            {warning}
          </div>
        )}
        {/* Show admin link if available */}
        {adminLink && (
          <div style={{ marginTop: "1.5rem" }}>
            <h3 style={{ color: "#357ae8" }}>Admin Link:</h3>
            <div style={{
              background: "#f5f7fa",
              padding: "0.5rem",
              borderRadius: "6px",
              marginBottom: "0.5rem",
              fontSize: "0.95rem",
              wordBreak: "break-all"
            }}>
              <a href={adminLink} target="_blank" rel="noopener noreferrer" style={{ color: "#357ae8" }}>
                {adminLink}
              </a>
            </div>
          </div>
        )}
      </div>
      {/* Right: CSV/TXT upload */}
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
Alice,
Bob,
Charlie,
David,
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
        {/* Generate Links button for upload, only after upload */}
        {csvWarning !== "No valid participant names found in file." && names.length > 1 && csvWarning !== "" && (
          <button
            type="button"
            onClick={generateLinks}
            disabled={hasDuplicates()}
            style={{
              background: hasDuplicates() ? "#bfc8d6" : "#357ae8",
              color: "#fff",
              borderRadius: "6px",
              padding: "0.7rem 1.5rem",
              border: "none",
              fontWeight: "500",
              fontSize: "1rem",
              marginTop: "1.5rem",
              cursor: hasDuplicates() ? "not-allowed" : "pointer",
              width: "100%"
            }}
          >
            {loading ? "Generating..." : "Generate Links"}
          </button>
        )}
        {/* Show links below upload if generated */}
        {(links.length > 0 || adminLink) && (
          <div style={{ marginTop: "2rem" }}>
            <h3 style={{ color: "#357ae8" }}>Share these links:</h3>
            <div style={{ marginTop: "0.5rem" }}>
              {links.map((link, idx) => (
                <div key={idx} style={{
                  background: "#f5f7fa",
                  padding: "0.5rem",
                  borderRadius: "6px",
                  marginBottom: "0.5rem",
                  fontSize: "0.95rem",
                  wordBreak: "break-all"
                }}>
                  <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: "#357ae8" }}>
                    {link}
                  </a>
                </div>
              ))}
              {adminLink && (
                <div style={{
                  background: "#fef3c7",
                  padding: "0.5rem",
                  borderRadius: "6px",
                  marginBottom: "0.5rem",
                  fontSize: "0.95rem",
                  wordBreak: "break-all",
                  border: "2px solid #f59e42"
                }}>
                  <strong>Admin Link: </strong>
                  <a href={adminLink} target="_blank" rel="noopener noreferrer" style={{ color: "#b45309" }}>
                    {adminLink}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
        {loading && <div style={{ marginTop: 16, color: "#357ae8" }}>Generating links...</div>}
      </div>
    </div>
  );
}