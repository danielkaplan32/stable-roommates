

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserFriends, FaListOl, FaHandshake, FaRegQuestionCircle, FaExternalLinkAlt } from "react-icons/fa";
import HowItWorksDialog from "./HowItWorksDialog";
import AdminReturnDialog from "./AdminReturnDialog";

export default function LandingPage() {
  const navigate = useNavigate();
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const year = new Date().getFullYear();
  return (
  <div style={{ position: 'relative', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Animated SVG background */}
      {/* Animated SVG backgrounds */}
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow-x: hidden;
          overflow-y: auto;
        }
        @keyframes bounceSpinBg1 {
          0%   { top: 0; left: 0; transform: rotate(0deg); }
          20%  { top: 0; left: calc(100vw - 500px); transform: rotate(90deg); }
          40%  { top: calc(100vh - 200px); left: calc(100vw - 500px); transform: rotate(180deg); }
          60%  { top: calc(100vh - 200px); left: 0; transform: rotate(270deg); }
          80%  { top: 0; left: 0; transform: rotate(360deg); }
          100% { top: 0; left: 0; transform: rotate(360deg); }
        }
        @keyframes bounceSpinBg2 {
          0%   { top: 10vh; left: 10vw; transform: rotate(0deg); }
          25%  { top: 10vh; left: calc(90vw - 400px); transform: rotate(-120deg); }
          50%  { top: calc(80vh - 150px); left: calc(90vw - 400px); transform: rotate(-240deg); }
          75%  { top: calc(80vh - 150px); left: 10vw; transform: rotate(-360deg); }
          100% { top: 10vh; left: 10vw; transform: rotate(-360deg); }
        }
        @keyframes bounceSpinBg3 {
          0%   { top: 30vh; left: 50vw; transform: rotate(0deg); }
          30%  { top: 0; left: 0; transform: rotate(180deg); }
          60%  { top: calc(100vh - 120px); left: calc(100vw - 300px); transform: rotate(360deg); }
          100% { top: 30vh; left: 50vw; transform: rotate(720deg); }
        }
        @keyframes bounceSpinBg4 {
          0%   { top: 60vh; left: 20vw; transform: rotate(0deg); }
            html, body, #root {
              margin: 0;
              padding: 0;
              height: 100%;
              min-height: 100vh;
              overflow-x: hidden;
              overflow-y: hidden;
            }
          30%  { top: 0; left: 0; transform: rotate(-180deg); }
          60%  { top: calc(100vh - 80px); left: calc(100vw - 200px); transform: rotate(-360deg); }
          100% { top: 50vh; left: 70vw; transform: rotate(-540deg); }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '500px',
        height: '200px',
        zIndex: 0,
        opacity: 0.22,
        pointerEvents: 'none',
        userSelect: 'none',
        animation: 'bounceSpinBg1 18s linear infinite',
      }}>
        <svg width="500" height="200" viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="30" fill="#3db6c6" />
          <line x1="90" y1="60" x2="210" y2="60" stroke="#888b90" strokeWidth="4" />
          <rect x="100" y="52" width="100" height="16" rx="8" fill="#6d6be6" />
          <circle cx="240" cy="60" r="30" fill="#d16ba5" />
        </svg>
      </div>
      <div style={{
        position: 'fixed',
        top: '10vh',
        left: '10vw',
        width: '400px',
        height: '150px',
        zIndex: 0,
        opacity: 0.16,
        pointerEvents: 'none',
        userSelect: 'none',
        animation: 'bounceSpinBg2 22s linear infinite',
      }}>
        <svg width="400" height="150" viewBox="0 0 240 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="45" r="22" fill="#eab308" />
          <line x1="62" y1="45" x2="158" y2="45" stroke="#888b90" strokeWidth="3" />
          <rect x="70" y="38" width="70" height="10" rx="5" fill="#22c55e" />
          <circle cx="180" cy="45" r="22" fill="#eab308" />
        </svg>
      </div>
      <div style={{
        position: 'fixed',
        top: '30vh',
        left: '50vw',
        width: '300px',
        height: '120px',
        zIndex: 0,
        opacity: 0.13,
        pointerEvents: 'none',
        userSelect: 'none',
        animation: 'bounceSpinBg3 26s linear infinite',
      }}>
        <svg width="300" height="120" viewBox="0 0 180 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="36" cy="36" r="16" fill="#f59e42" />
          <line x1="52" y1="36" x2="128" y2="36" stroke="#888b90" strokeWidth="2.5" />
          <rect x="60" y="32" width="50" height="8" rx="4" fill="#16a34a" />
          <circle cx="144" cy="36" r="16" fill="#be185d" />
        </svg>
      </div>
      {/* Fourth SVG background */}
      <div style={{
        position: 'fixed',
        top: '60vh',
        left: '20vw',
        width: '350px',
        height: '100px',
        zIndex: 0,
        opacity: 0.11,
        pointerEvents: 'none',
        userSelect: 'none',
        animation: 'bounceSpinBg4 30s linear infinite',
      }}>
        <svg width="350" height="100" viewBox="0 0 210 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="30" cy="30" r="15" fill="#6366f1" />
          <line x1="45" y1="30" x2="165" y2="30" stroke="#888b90" strokeWidth="2.5" />
          <rect x="60" y="25" width="90" height="10" rx="5" fill="#e11d48" />
          <circle cx="180" cy="30" r="15" fill="#22d3ee" />
        </svg>
      </div>
      <div className="landing-container" style={{
        maxWidth: 700,
        margin: "0 auto",
        padding: "3.5rem 1.5rem 2.5rem 1.5rem",
        background: "none",
        minHeight: "100vh",
        position: 'relative',
        zIndex: 1
      }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
        <h1 style={{
          fontSize: "2.7rem",
          color: "#357ae8",
          fontWeight: 800,
          letterSpacing: 1,
          margin: 0,
          textAlign: "center",
          fontFamily: 'inherit'
        }}>Stable Roommates</h1>
        <button
          onClick={() => setShowHowItWorks(true)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            marginLeft: 4,
            cursor: "pointer",
            display: "flex",
            alignItems: "center"
          }}
          aria-label="How this works"
        >
          <FaRegQuestionCircle size={26} color="#357ae8" />
        </button>
      </div>
      <p style={{
        fontSize: "1.25rem",
        color: "#555",
        marginBottom: 38,
        textAlign: "center",
        fontWeight: 500,
        fontFamily: 'inherit'
      }}>
        A pairing where no one wants to trade places.{' '}
        <a
          href="https://en.wikipedia.org/wiki/Stable_roommates_problem"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#357ae8",
            fontWeight: 700,
            textDecoration: "underline",
            fontSize: "1.18rem",
            marginLeft: 2,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            Seriously.
            <FaExternalLinkAlt size={15} style={{ marginLeft: 4, position: 'relative', top: '-2px' }} />
          </span>
        </a>
      </p>

      {/* Notion-style horizontal steps */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: 48,
        marginBottom: 20,
        flexWrap: "wrap"
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 120 }}>
          <FaUserFriends size={38} color="#357ae8" style={{ marginBottom: 8 }} />
          <div style={{ fontWeight: 600, color: "#222", fontSize: "1.08rem" }}>Add Names</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 120 }}>
          <FaListOl size={38} color="#357ae8" style={{ marginBottom: 8 }} />
          <div style={{ fontWeight: 600, color: "#222", fontSize: "1.08rem" }}>Set Preferences</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 120 }}>
          <FaHandshake size={38} color="#357ae8" style={{ marginBottom: 8 }} />
          <div style={{ fontWeight: 600, color: "#222", fontSize: "1.08rem" }}>Get Matches</div>
        </div>
      </div>


      <div className="options" style={{
        display: "flex",
        flexDirection: "row",
        gap: 18,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 0,
        flexWrap: "wrap"
      }}>
        <button onClick={() => navigate("/manual")}
          style={{
            background: "#357ae8",
            color: "#fff",
            padding: "0.9rem 2.5rem",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: "1.13rem",
            border: "none",
            minWidth: 180,
            boxShadow: "0 2px 8px rgba(53,122,232,0.07)",
            transition: "background 0.2s",
            cursor: "pointer"
          }}>
          Manual Entry
        </button>
        <button onClick={() => navigate("/invite-setup")}
          style={{
            background: "#4f8cff",
            color: "#fff",
            padding: "0.9rem 2.5rem",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: "1.13rem",
            border: "none",
            minWidth: 180,
            boxShadow: "0 2px 8px rgba(79,140,255,0.07)",
            transition: "background 0.2s",
            cursor: "pointer"
          }}>
          Send Out Links
        </button>
      </div>
      <div style={{ marginTop: 8, textAlign: "center", marginBottom: 0 }}>
        <button onClick={() => setShowAdminDialog(true)} style={{
          background: "#d97706",
          color: "#fff",
          padding: "0.7rem 2rem",
          borderRadius: 10,
          fontWeight: 700,
          fontSize: "1.08rem",
          border: "none",
          boxShadow: "0 2px 8px rgba(217,119,6,0.07)",
          cursor: "pointer"
        }}>
          Admin: Return to Session
        </button>
      </div>
      <HowItWorksDialog open={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
      <AdminReturnDialog open={showAdminDialog} onClose={() => setShowAdminDialog(false)} />
      {/* Footer note */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        color: "#888",
        fontSize: "1.01rem",
        textAlign: "center",
        padding: "10px 0",
    background: "none",
        zIndex: 2
      }}>
          {year} Stable Roommates ·{' '}
          <a href="https://github.com/danielkaplan32/stable-roommates" target="_blank" rel="noopener noreferrer" style={{ color: '#357ae8', textDecoration: 'none', fontWeight: 500 }}>
            GitHub
          </a>
      </div>
    </div>
  </div>
  );
}
