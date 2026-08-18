export function translateAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  const lower = message.toLowerCase()

  if (lower.includes('invalid login credentials')) return 'Email o contraseña incorrectos.'
  if (lower.includes('already registered')) return 'Ya existe una cuenta con este email. Inicia sesión.'
  if (lower.includes('email not confirmed'))
    return 'Confirma tu cuenta desde el correo que te enviamos antes de iniciar sesión.'
  if (lower.includes('password') && lower.includes('at least'))
    return 'La contraseña debe tener al menos 6 caracteres.'
  if (lower.includes('rate limit'))
    return 'Se han enviado demasiados correos. Espera unos minutos y vuelve a intentarlo.'
  if (lower.includes('provider is not enabled'))
    return 'El inicio de sesión con Google todavía no está activado.'
  return 'No se pudo completar la operación. Inténtalo de nuevo.'
}
