/**
 * TCC Verzuimspiegel — Supabase Client
 * Auth + TCC data operations.
 * Requires @supabase/supabase-js v2 loaded before this file.
 */
const SupabaseClient = (() => {
  'use strict';

  const SUPABASE_URL = 'https://noyfodeeyanayyurnbsy.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_P5LgA-SHM-uyS46QE2mhTQ_iqCXrGbI';
  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  /* ── Auth ── */

  async function signIn(email, password) {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await db.auth.signOut();
    if (error) throw error;
  }

  async function getSession() {
    const { data: { session } } = await db.auth.getSession();
    return session;
  }

  /**
   * Call at the top of every protected page.
   * Returns { session } or redirects to login.html.
   */
  async function requireAuth() {
    const session = await getSession();
    if (!session) {
      window.location.replace('login.html');
      return null;
    }
    return { session };
  }

  /* ── Data mapping (camelCase ↔ snake_case) ── */

  function toRow(sub) {
    return {
      id:                    sub.id,
      submitted_at:          new Date(sub.submittedAt).toISOString(),
      dossiernummer:         sub.dossiernummer,
      team:                  sub.team,
      type_verzuim:          sub.typeVerzuim,
      dimensions:            sub.dimensions,
      kernvraag:             sub.kernvraag,
      eerste_signaal:        sub.eersteSignaal,
      voorkombaarheid:       sub.voorkombaarheid,
      belangrijkste_oorzaak: sub.belangrijksteOorzaak,
    };
  }

  function fromRow(row) {
    return {
      id:                   row.id,
      submittedAt:          new Date(row.submitted_at).getTime(),
      dossiernummer:        row.dossiernummer,
      team:                 row.team,
      typeVerzuim:          row.type_verzuim,
      dimensions:           row.dimensions,
      kernvraag:            row.kernvraag,
      eersteSignaal:        row.eerste_signaal,
      voorkombaarheid:      row.voorkombaarheid,
      belangrijksteOorzaak: row.belangrijkste_oorzaak,
    };
  }

  /* ── TCC submissions ── */

  async function saveTccSubmission(sub) {
    const { error } = await db.from('tcc_submissions').insert(toRow(sub));
    if (error) throw error;
    return sub;
  }

  async function getTccSubmissions() {
    const { data, error } = await db
      .from('tcc_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(fromRow);
  }

  /* ── Public API ── */
  return {
    signIn,
    signOut,
    getSession,
    requireAuth,
    saveTccSubmission,
    getTccSubmissions,
  };
})();
