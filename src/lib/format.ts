export function formatPrice(value: number, locale = 'es-ES') {
  return value.toLocaleString(locale, { style: 'currency', currency: 'EUR' })
}
