import { createClient } from '@supabase/supabase-js'

// Safe to keep in the client bundle: this is Supabase's public/publishable
// key, meant to be exposed — access is enforced by Row Level Security
// policies in the database, not by keeping this key secret.
export const SUPABASE_URL = 'https://iysedpsjheqfvjdinzgc.supabase.co'
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_1nyBvSRcc7iMTpt0PR2SWg_JvBr6DwR'

// Captured before `createClient` runs its own (async) session-from-URL
// detection, which may rewrite/strip the query string — see
// requestPasswordReset in AuthContext.tsx, which puts this marker in the
// redirect URL itself instead of relying on Supabase's own `type=recovery`
// param (unreliable under the PKCE flow).
export const isPasswordRecoveryRedirect =
  new URLSearchParams(window.location.search).get('recovery') === '1'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    flowType: 'pkce',
  },
})
