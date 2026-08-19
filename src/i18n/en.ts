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
  teeColors: {
    blanco: 'White',
    amarillo: 'Yellow',
    azul: 'Blue',
    rojo: 'Red',
    negro: 'Black',
    naranja: 'Orange',
  },
  explanations: {
    pcc:
      'The PCC (Playing Conditions Calculation) is an adjustment the course ' +
      "committee can apply when the day's conditions (strong wind, rain, a " +
      'very fast or very slow course...) make play harder or easier than ' +
      'usual for everyone. It can be positive or negative, typically between ' +
      '-1 and +3. It defaults to 0 — only change it if the club has told you ' +
      'to after the round.',
    grossStableford:
      'The Gross Stableford result is the total Stableford points where each ' +
      'hole only counts up to gross double bogey at most — so on a Par 4, if ' +
      'you score 1 point your maximum is 7 strokes, with 2 points it\'s 8 ' +
      'strokes, and with no points it\'s 6 strokes. ' +
      "In simple terms: it's your total gross score, but strokes beyond " +
      'double bogey on any hole (adjusted for the handicap strokes you get ' +
      "on it) don't count, so one disastrous hole can't blow up your result.",
  },
  infoTooltip: {
    ariaLabel: 'More information',
  },
  antesDeJugar: {
    title: 'Course Handicap',
    subtitle:
      "Calculate your Course Handicap for the tee you're playing, from your " +
      'Handicap Index (WHS).',
    numPlayers: 'Number of players',
    yourHi: 'Your Handicap Index (HI)',
    playerHi: 'Player {{n}} — Handicap Index (HI)',
    allowance: 'Format / handicap allowance',
    selectCoursePrompt: 'Select a course and tee to calculate your Course Handicap.',
    courseHandicap: 'Course Handicap',
    exactValue: 'Exact value',
    player: 'Player {{n}}',
    scratch: 'Plays scratch',
    receivesStroke: 'Gets {{n}} stroke',
    receivesStrokes: 'Gets {{n}} strokes',
    distributeHandicap: 'Distribute handicap',
    calculateRoundButton: 'Calculate playing handicap and Stableford points',
    grossStableford: 'Gross Stableford result',
    pccAdjustment: 'PCC adjustment',
    strokesReceived: 'Strokes received',
    netScore: 'Net score',
    stablefordPoints: 'Stableford points',
    playedHandicap: 'Playing handicap',
    roundSummaryLine:
      'Strokes received {{strokesReceived}} · Net {{netScore}} · Stableford {{stablefordPoints}} pts · Playing handicap {{differential}}',
    newCalculation: 'New calculation',
  },
  despuesDeJugar: {
    title: 'After Playing',
    subtitle:
      'Enter your gross score to get strokes received, net score, ' +
      'Stableford points, and the round\'s Score Differential.',
    numPlayers: 'Number of players',
    player: 'Player {{n}}',
    handicapIndex: 'Handicap Index (HI)',
    grossStableford: 'Gross Stableford result',
    pccAdjustment: 'PCC adjustment',
    date: 'Date',
    selectCoursePrompt: 'Select a course and tee to see your result.',
    hcpDeJuego: 'Course Handicap',
    strokesReceived: 'Strokes received',
    netScore: 'Net score',
    stablefordPoints: 'Stableford points',
    scoreDifferential: 'Score Differential (playing handicap)',
    scoreDifferentialFormula: '(113 / Slope) x (Gross - Course Rating - PCC)',
    multiPlayerSummary:
      'Hcp {{courseHandicap}} · Strokes received {{strokesReceived}} · Net {{netScore}} · Stableford {{stablefordPoints}} pts · Diff {{differential}}',
    savedButton: 'Round saved ✓',
    savingButton: 'Saving...',
    saveRoundsButton: 'Save rounds to history',
    saveRoundButton: 'Save round to my history',
    viewHistoryLink: 'View round history →',
    newCalculation: 'New calculation',
  },
  federatedHandicap: {
    title: 'Federated Handicap',
    subtitle: 'Look up your official Handicap Index (RFEG), by name or license number.',
    iframeTitle: 'Federated Handicap Lookup',
    searchAgain: '← Search again',
  },
  courseTeeSelect: {
    courseLabel: 'Golf course',
    searchPlaceholder: 'Search course or location...',
    notInList: "Not on the list? Search GolfCourseAPI",
    change: 'Change',
    outboundTee: 'Tee',
    changeTee: 'Change tee',
    apiSearchTitle: 'Search GolfCourseAPI',
    cancel: 'Cancel',
    courseNamePlaceholder: 'Course name...',
    search: 'Search',
    searching: 'Searching...',
    noResults: 'No results.',
    loadingSuffix: ' (loading...)',
    searchError: 'Error searching GolfCourseAPI',
    noTeesError: "That course doesn't have tee data available.",
    loadError: 'Could not load the course',
  },
}
