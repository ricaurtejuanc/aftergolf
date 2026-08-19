// Spanish strings for every customer-facing page/component. The admin panel
// (AdminPage and its tabs) is intentionally not part of this dictionary —
// it's used only by the single Spanish-speaking site owner, so translating
// it would be pure overhead. en.ts is typed against this file's shape, so a
// missing/extra key in either file fails the build.
export const es = {
  sidebar: {
    home: 'Inicio',
    antesDeJugar: 'Antes de Jugar',
    despuesDeJugar: 'Después de Jugar',
    historial: 'Historial de Rondas',
    shop: 'Shop',
    contacto: 'Contacto',
    handicapCta: '¿No sabes tu handicap?',
    handicapCtaLink: 'Consúltalo aquí',
    viewCart: 'Ver carrito',
  },
  home: {
    heroText:
      'Calcula tu handicap de juego antes de salir y tu handicap jugado al ' +
      'terminar la ronda, con las fórmulas oficiales del World Handicap ' +
      'System (WHS / RFEG).',
    antesKicker: 'Antes de jugar',
    antesTitle: 'Handicap de Juego',
    antesDesc:
      'Introduce tu Handicap Index y el tee que vas a jugar para saber ' +
      'cuántos golpes de ventaja tienes en ese campo.',
    despuesKicker: 'Después de jugar',
    despuesTitle: 'Handicap Jugado',
    despuesDesc:
      'Introduce tu resultado bruto y obtén tu resultado neto, puntos ' +
      'Stableford, el Score Differential y tu historial de rondas.',
    shopKicker: '19º hoyo',
    shopTitle: 'Shop',
    shopDesc: 'Merchandising AfterGolf: bolas de golf y accesorios con el escudo del club.',
  },
  footer: {
    calculationsNote: 'Cálculos basados en el World Handicap System (WHS) / RFEG.',
    contacto: 'Contacto',
    terminos: 'Términos y condiciones',
    privacidad: 'Privacidad',
  },
}
