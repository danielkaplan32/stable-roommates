import { supabase } from "../supabaseClient";

/**
 * Save or update results for a session in the DB (upsert).
 * @param {Object} params
 * @param {string} params.sessionId - The session_id for this results set
 * @param {Array|Object} params.pairings - The pairings/results to save (array or object)
 * @param {boolean} [params.finalized=true] - Whether the session is finalized
 * @param {Array} [params.participants] - The participants array to save (optional)
 * @returns {Promise<void>}
 */
export async function saveResultsToDB({ sessionId, pairings, participants, finalized = true }) {
  const upsertObj = {
    session_id: sessionId,
    results: pairings,
    finalized: finalized
  };
  let participantNames = [];
  if (participants) {
    participantNames = participants.map(p => typeof p === 'string' ? p : p.name);
    upsertObj.participants = participantNames;
  }
  // Upsert session row
  const { error } = await supabase
    .from("sessions")
    .upsert([
      upsertObj
    ], { onConflict: ["session_id"] });
  if (error) throw error;

  // Also upsert preferences for each participant if provided
  if (participants && Array.isArray(participants) && participants.length > 0 && participants[0].preferences) {
    const prefsRows = participants.map(p => ({
      session_id: sessionId,
      username: p.name,
      preferences: p.preferences
    }));
    const { error: prefsError } = await supabase
      .from("preferences")
      .upsert(prefsRows, { onConflict: ["session_id", "username"] });
    if (prefsError) throw prefsError;
  }
}
