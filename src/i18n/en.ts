import type { es } from './es'

// Same key structure as es.ts (any missing/extra key fails the build), but
// leaves are widened to `string` instead of es.ts's literal values, since
// this file's whole point is to hold different text at each of those leaves.
type SameShape<T> = T extends string ? string : { [K in keyof T]: SameShape<T[K]> }

export const en: SameShape<typeof es> = {
  sidebar: {
    home: 'Home',
    antesDeJugar: 'Before Playing',
    despuesDeJugar: 'After Playing',
    historial: 'Round History',
    shop: 'Shop',
    contacto: 'Contact',
    handicapCta: "Don't know your handicap?",
    handicapCtaLink: 'Look it up here',
    viewCart: 'View cart',
  },
  home: {
    heroText:
      "Calculate your Course Handicap before you play and your Playing " +
      "Handicap once the round is done, using the official World " +
      "Handicap System (WHS) formulas.",
    antesKicker: 'Before playing',
    antesTitle: 'Course Handicap',
    antesDesc:
      "Enter your Handicap Index and the tee you're playing to find out " +
      'how many strokes you get on that course.',
    despuesKicker: 'After playing',
    despuesTitle: 'Playing Handicap',
    despuesDesc:
      'Enter your gross score to get your net score, Stableford points, ' +
      'the Score Differential, and your round history.',
    shopKicker: '19th hole',
    shopTitle: 'Shop',
    shopDesc: 'AfterGolf merchandise: golf balls and accessories with the club crest.',
  },
  footer: {
    calculationsNote: 'Calculations based on the World Handicap System (WHS) / RFEG.',
    contacto: 'Contact',
    terminos: 'Terms and conditions',
    privacidad: 'Privacy',
  },
}
