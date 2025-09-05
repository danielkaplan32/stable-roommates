// Helper to fill missing preferences
export function fillMissingPreferences(participants, method = "random") {
  // Fill missing preferences for each participant
  const names = participants.map(p => p.name.trim()).filter(Boolean);
  return participants.map(p => {
    let prefs = p.preferences.map(x => x.trim()).filter(x => x && x !== p.name);
    // Add missing names
    const missing = names.filter(n => n !== p.name && !prefs.includes(n));
    if (method === "random") {
      // Shuffle missing
      for (let i = missing.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [missing[i], missing[j]] = [missing[j], missing[i]];
      }
    }
    // Add missing names at the end
    prefs = prefs.concat(missing);
    return { ...p, preferences: prefs };
  });
}