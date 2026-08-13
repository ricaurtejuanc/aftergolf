export function formatPrice(value: number) {
  return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}
