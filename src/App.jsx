import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import ManualEntryPage from "./ManualEntryPage";
import PreferencesEntryPage from "./PreferencesEntryPage";
import InviteSetupPage from "./InviteSetupPage";
import InviteEntryPage from "./InviteEntryPage";
import ResultsPage from "./ResultsPage";
import InviteResultsPage from "./InviteResultsPage";
import AdminPage from "./AdminPage";
import "./styles/main.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/manual" element={<ManualEntryPage />} />
        <Route path="/preferences" element={<PreferencesEntryPage />} />
        <Route path="/invite-setup" element={<InviteSetupPage />} />
        <Route path="/invite" element={<InviteEntryPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/inviteresults" element={<InviteResultsPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;