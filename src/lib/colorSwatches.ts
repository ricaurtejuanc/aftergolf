// Printful gives us color names, not hex codes, so this maps the common
// apparel color words (Spanish and English) to a swatch color. Matching is
// substring-based (not exact) because Printful color names often carry
// extra words we don't need to enumerate — "Verde botella", "Heather Navy",
// "Dark Heather Grey" — as long as the name contains a known color word.
// More specific multi-word entries are listed first so they win over a
// generic substring also present in the name (e.g. "azul marino" before
// "azul").
const COLOR_KEYWORDS: [string, string][] = [
  ['verde militar', '#4b5320'],
  ['military green', '#4b5320'],
  ['azul marino', '#1e2a4a'],
  ['navy blue', '#1e2a4a'],
  ['navy', '#1e2a4a'],
  ['gris oscuro', '#4b5563'],
  ['dark grey', '#4b5563'],
  ['dark gray', '#4b5563'],
  ['heather grey', '#9ca3af'],
  ['heather gray', '#9ca3af'],
  ['heather', '#9ca3af'],
  ['negro', '#111111'],
  ['black', '#111111'],
  ['blanco', '#ffffff'],
  ['white', '#ffffff'],
  ['gris', '#9ca3af'],
  ['grey', '#9ca3af'],
  ['gray', '#9ca3af'],
  ['azul', '#2563eb'],
  ['blue', '#2563eb'],
  ['rojo', '#dc2626'],
  ['red', '#dc2626'],
  ['verde', '#16a34a'],
  ['green', '#16a34a'],
  ['khaki', '#8a8360'],
  ['caqui', '#8a8360'],
  ['beige', '#d9c8a9'],
  ['arena', '#d9c8a9'],
  ['sand', '#d9c8a9'],
  ['marron', '#6b4226'],
  ['marrón', '#6b4226'],
  ['brown', '#6b4226'],
  ['rosa', '#f472b6'],
  ['pink', '#f472b6'],
  ['amarillo', '#facc15'],
  ['yellow', '#facc15'],
  ['naranja', '#f97316'],
  ['orange', '#f97316'],
  ['morado', '#7c3aed'],
  ['purple', '#7c3aed'],
  ['lila', '#a78bfa'],
  ['granate', '#7f1d1d'],
  ['maroon', '#7f1d1d'],
  ['vino', '#7f1d1d'],
  ['burgundy', '#7f1d1d'],
]

export function colorNameToHex(name: string): string {
  const lower = name.trim().toLowerCase()
  const match = COLOR_KEYWORDS.find(([keyword]) => lower.includes(keyword))
  return match ? match[1] : '#d3bd85'
}
