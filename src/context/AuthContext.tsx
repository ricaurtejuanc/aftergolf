import type { User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { takePendingRounds } from '../lib/pendingRounds'
import { saveRound } from '../lib/storage'
import { supabase } from '../lib/supabaseClient'

export interface Profile {
  firstName: string
  lastName: string
  email: string
}

interface SignUpInput {
  firstName: string
  lastName: string
  email: string
  password: string
}

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  passwordRecovery: boolean
  signUp: (input: SignUpInput) => Promise<{ needsConfirmation: boolean }>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  completePasswordRecovery: (password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)
const PENDING_PROFILE_KEY = 'aftergolf.pendingProfile'
const PENDING_REDIRECT_KEY = 'aftergolf.pendingRedirect'
const PENDING_RECOVERY_KEY = 'aftergolf.pendingRecovery'

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', userId)
    .maybeSingle()
  if (!data) return null
  return { firstName: data.first_name, lastName: data.last_name, email: data.email }
}

async function completePendingProfile(userId: string, fallbackEmail: string) {
  const raw = localStorage.getItem(PENDING_PROFILE_KEY)
  if (!raw) return
  localStorage.removeItem(PENDING_PROFILE_KEY)
  try {
    const pending = JSON.parse(raw) as Omit<SignUpInput, 'password'>
    await supabase.from('profiles').upsert({
      id: userId,
      first_name: pending.firstName,
      last_name: pending.lastName,
      email: pending.email || fallbackEmail,
    })
  } catch {
    // malformed pending data — nothing to recover
  }
}

// A Google sign-in never goes through signUp(), so there's no pending
// profile for completePendingProfile() to pick up — build one from
// whatever Google handed back instead, the first time we see that user.
async function ensureProfile(sessionUser: User): Promise<Profile | null> {
  const existing = await fetchProfile(sessionUser.id)
  if (existing) return existing

  const meta = sessionUser.user_metadata as Record<string, string | undefined>
  const email = sessionUser.email ?? ''
  const fullName = meta.full_name || meta.name || ''
  const [nameFirst, ...nameRest] = fullName.split(' ').filter(Boolean)
  const firstName = meta.given_name || nameFirst || email.split('@')[0] || 'Usuario'
  const lastName = meta.family_name || nameRest.join(' ')

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: sessionUser.id, first_name: firstName, last_name: lastName, email })
  if (error) return null
  return { firstName, lastName, email }
}

async function flushPendingRounds(userId: string) {
  const pending = takePendingRounds()
  for (const round of pending) {
    try {
      await saveRound(round, userId)
    } catch {
      // best-effort: skip a round that fails rather than lose the rest
    }
  }
}

// Redirect targets (signup confirmation, password reset) can't include the
// HashRouter route — the PKCE `?code=` param has to land in the real query
// string, not inside the `#...` fragment — so they always come back to the
// site root. Stash which in-app route the user was on before triggering the
// email and restore it once the session is established.
function stashPendingRedirect() {
  localStorage.setItem(PENDING_REDIRECT_KEY, window.location.hash)
}

function restorePendingRedirect() {
  const hash = localStorage.getItem(PENDING_REDIRECT_KEY)
  if (hash === null) return
  localStorage.removeItem(PENDING_REDIRECT_KEY)
  window.location.hash = hash
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [passwordRecovery, setPasswordRecovery] = useState(false)

  useEffect(() => {
    async function syncUser(sessionUser: User | null) {
      setUser(sessionUser)
      if (!sessionUser) {
        setProfile(null)
        return
      }
      // Supabase doesn't reliably preserve any marker we put in the
      // redirectTo URL (it can rebuild the redirect with just its own
      // `?code=`, dropping ours) and doesn't reliably fire a distinct
      // PASSWORD_RECOVERY event either — so the one thing we can trust is
      // a flag we stashed in this browser right before requesting the
      // recovery email, checked as soon as a session shows up.
      if (localStorage.getItem(PENDING_RECOVERY_KEY) === '1') {
        localStorage.removeItem(PENDING_RECOVERY_KEY)
        setPasswordRecovery(true)
      }
      await completePendingProfile(sessionUser.id, sessionUser.email ?? '')
      await flushPendingRounds(sessionUser.id)
      setProfile(await ensureProfile(sessionUser))
      restorePendingRedirect()
    }

    supabase.auth.getSession().then(({ data }) => {
      syncUser(data.session?.user ?? null).finally(() => setLoading(false))
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true)
      syncUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signUp({ firstName, lastName, email, password }: SignUpInput) {
    localStorage.setItem(
      PENDING_PROFILE_KEY,
      JSON.stringify({ firstName, lastName, email }),
    )
    stashPendingRedirect()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    })
    if (error) {
      localStorage.removeItem(PENDING_PROFILE_KEY)
      localStorage.removeItem(PENDING_REDIRECT_KEY)
      throw error
    }
    // Supabase returns success with no identities when the email is already
    // registered (to avoid leaking which emails exist) — surface it as an
    // error instead of a fake "check your email" confirmation.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      localStorage.removeItem(PENDING_PROFILE_KEY)
      localStorage.removeItem(PENDING_REDIRECT_KEY)
      throw new Error('User already registered')
    }
    return { needsConfirmation: !data.session }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  // Redirects away to Google's consent screen and back — unlike signIn(),
  // there's no session to react to here; the app picks it up from the
  // onAuthStateChange listener once the redirect completes.
  async function signInWithGoogle() {
    stashPendingRedirect()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname },
    })
    if (error) {
      localStorage.removeItem(PENDING_REDIRECT_KEY)
      throw error
    }
  }

  async function requestPasswordReset(email: string) {
    stashPendingRedirect()
    localStorage.setItem(PENDING_RECOVERY_KEY, '1')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname,
    })
    if (error) {
      localStorage.removeItem(PENDING_REDIRECT_KEY)
      localStorage.removeItem(PENDING_RECOVERY_KEY)
      throw error
    }
  }

  async function completePasswordRecovery(password: string) {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
    setPasswordRecovery(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        passwordRecovery,
        signUp,
        signIn,
        signInWithGoogle,
        requestPasswordReset,
        completePasswordRecovery,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
