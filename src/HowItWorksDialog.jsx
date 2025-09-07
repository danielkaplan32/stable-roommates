import React from "react";

export default function HowItWorksDialog({ open, onClose }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.22)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 18,
        maxWidth: 1000,
        width: "98%",
        padding: "2.7rem 2.8rem 2.2rem 2.8rem",
        boxShadow: "0 8px 48px rgba(0,0,0,0.16)",
        position: "relative",
        display: "flex",
        flexDirection: "row",
        gap: 48,
        alignItems: "flex-start",
        flexWrap: "wrap"
      }}>
        <button onClick={onClose} style={{
          position: "absolute",
          top: 18,
          right: 18,
          background: "none",
          border: "none",
          fontSize: 28,
          color: "#888",
          cursor: "pointer"
        }} aria-label="Close">&times;</button>
        <div style={{ flex: 2, minWidth: 260, minHeight: 0 }}>
          <h2 style={{ color: "#357ae8", fontWeight: 800, fontSize: "1.7rem", marginBottom: 18, letterSpacing: 0.5 }}>About the Application</h2>
          <div style={{ color: "#222", fontSize: "1.13rem", marginBottom: 22, lineHeight: 1.7 }}>
            You can either invite others to share their preferences and build a matching together, or run it by yourself manually. This is an implementation of <a href="https://uvacs2102.github.io/docs/roomates.pdf" target="_blank" rel="noopener noreferrer" style={{ color: "#357ae8", textDecoration: "underline" }}>Irving's algorithm</a> (1985) based on the <a href="https://en.wikipedia.org/wiki/Stable_roommates_problem" target="_blank" rel="noopener noreferrer" style={{ color: "#357ae8", textDecoration: "underline" }}>Stable Roommates problem</a>.
          </div>
          <div style={{ color: "#222", fontSize: "1.13rem", marginBottom: 22, lineHeight: 1.7 }}>
            The Stable Roommates problem is a twist on the <a href="https://en.wikipedia.org/wiki/Stable_marriage_problem" target="_blank" rel="noopener noreferrer" style={{ color: "#357ae8", textDecoration: "underline" }}>Stable Marriage problem</a>, which was introduced by <a href="https://en.wikipedia.org/wiki/Gale%E2%80%93Shapley_algorithm" target="_blank" rel="noopener noreferrer" style={{ color: "#357ae8", textDecoration: "underline" }}>Gale and Shapley</a> in 1962. Irving's algorithm provided the first efficient solution for finding stable matchings in one-sided roommate groups. This application brings that theory to life for a practical application.
          </div>
          <div style={{ color: "#222", fontSize: "1.13rem", marginBottom: 22, lineHeight: 1.7 }}>
            If a solution exists <span style={{ fontStyle: "italic" }}>(which it doesn't always! <a href="https://arxiv.org/abs/1705.08340" target="_blank" rel="noopener noreferrer" style={{ color: "#357ae8", textDecoration: "underline" }}>why?</a>)</span>, the output of this algorithm guarantees that there are no "unstable pairs". In other words, there will be no two people who would both rather be matched with each other than with their assigned roommate. This makes the matching stable.
          </div>
          <div style={{ marginTop: 18, color: "#888", fontSize: "0.99rem" }}>
            <a href="https://en.wikipedia.org/wiki/Stable_roommates_problem" target="_blank" rel="noopener noreferrer" style={{ color: "#357ae8", textDecoration: "underline" }}>Learn more about the Stable Roommates problem</a>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 320, marginLeft: 18, marginTop: 0 }}>
          <div style={{ color: "#333", fontSize: "1.08rem", marginBottom: 0, lineHeight: 1.7, background: "#f5f7fa", borderRadius: 12, padding: "1.5rem 1.2rem", border: "1px solid #e0e7ef", minWidth: 0 }}>
            <b>How it works:</b>
            <ul style={{ marginLeft: 22, marginTop: 8, marginBottom: 0, paddingLeft: 0, listStyle: 'disc' }}>
              <li>Each participant ranks all others in order of roommate preference.</li>
              <li>The algorithm proceeds in two phases to eliminate unstable pairings and find a stable matching (if one exists).</li>
              <li>If the number of participants is odd, a dummy participant is added so everyone can be matched. One person will be paired with the dummy.</li>
              <li>The result is a set of pairings where no two people would both prefer each other over their assigned roommate.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
