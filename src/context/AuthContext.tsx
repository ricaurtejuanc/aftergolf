import type { User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { takePendingRounds } from '../lib/pendingRounds'
import { saveRound } from '../lib/storage'
import { isPasswordRecoveryRedirect, supabase } from '../lib/supabaseClient'

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
  requestPasswordReset: (email: string) => Promise<void>
  completePasswordRecovery: (password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)
const PENDING_PROFILE_KEY = 'aftergolf.pendingProfile'
const PENDING_REDIRECT_KEY = 'aftergolf.pendingRedirect'

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
  const [passwordRecovery, setPasswordRecovery] = useState(isPasswordRecoveryRedirect)

  useEffect(() => {
    async function syncUser(sessionUser: User | null) {
      setUser(sessionUser)
      if (!sessionUser) {
        setProfile(null)
        return
      }
      await completePendingProfile(sessionUser.id, sessionUser.email ?? '')
      await flushPendingRounds(sessionUser.id)
      setProfile(await fetchProfile(sessionUser.id))
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

  async function requestPasswordReset(email: string) {
    stashPendingRedirect()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname + '?recovery=1',
    })
    if (error) {
      localStorage.removeItem(PENDING_REDIRECT_KEY)
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
