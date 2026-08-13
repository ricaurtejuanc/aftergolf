import { SUPABASE_URL, supabase } from './supabaseClient'

export interface AdminUser {
  id: string
  email: string | null
  createdAt: string
  lastSignInAt: string | null
}

export async function listAdminUsers(): Promise<{ users: AdminUser[]; total: number }> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Inicia sesión de administrador')

  const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-users`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result?.error ?? 'No se pudieron cargar los usuarios')
  return result
}
