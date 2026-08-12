import { createClient } from '@supabase/supabase-js'

// Safe to keep in the client bundle: this is Supabase's public/publishable
// key, meant to be exposed — access is enforced by Row Level Security
// policies in the database, not by keeping this key secret.
const SUPABASE_URL = 'https://iysedpsjheqfvjdinzgc.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_1nyBvSRcc7iMTpt0PR2SWg_JvBr6DwR'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    flowType: 'pkce',
  },
})
