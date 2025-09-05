import { supabase } from '../supabaseClient';

export async function createSession(participants) {
  // Generate unique session_id and admin_secret
  const session_id = Math.random().toString(36).substring(2, 10);
  const admin_secret = Math.random().toString(36).substring(2, 12);
  // Insert session into Supabase
  const { data, error } = await supabase
    .from('sessions')
    .insert([
      {
        session_id,
        admin_secret,
        participants
      }
    ])
    .select()
    .single();
  if (error) throw error;
  return { session_id, admin_secret };
}
