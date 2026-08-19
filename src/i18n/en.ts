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
  authErrors: {
    invalidCredentials: 'Incorrect email or password.',
    alreadyRegistered: 'An account with this email already exists. Log in instead.',
    emailNotConfirmed: 'Confirm your account from the email we sent you before logging in.',
    passwordTooShort: 'Your password must be at least 6 characters.',
    rateLimit: 'Too many emails sent. Wait a few minutes and try again.',
    googleNotEnabled: "Google sign-in isn't enabled yet.",
    generic: "Couldn't complete the request. Please try again.",
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
  registerGate: {
    continueWithGoogle: 'Continue with Google',
    or: 'or',
    login: 'Log in',
    signup: 'Create account',
    signupNote:
      'To save your round we need you to sign up — that way your history ' +
      "is tied to your account, not just this browser.",
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot your password?',
    sending: 'Sending...',
    sendResetEmail: 'Send reset email',
    back: 'Back',
    cancel: 'Cancel',
    signupConfirmationSent: "We've sent you an email to confirm your account. Open it, then log in here.",
    resetEmailSent: "We've sent you an email to reset your password.",
  },
  passwordRecoveryGate: {
    passwordTooShort: 'Your password must be at least 6 characters.',
    passwordsDontMatch: "Passwords don't match.",
    updateFailed: "Couldn't update your password. Please try again.",
    done: "Password updated. You're all set to keep using the app.",
    title: 'Choose a new password',
    newPassword: 'New password',
    repeatPassword: 'Repeat password',
    saving: 'Saving...',
    save: 'Save password',
  },
  history: {
    title: 'Round history',
    subtitle: "Your history is tied to your account, so it's the same on any device.",
    greetingPrefix: 'Hi, ',
    signOut: 'Sign out',
    loading: 'Loading history...',
    empty: 'You haven\'t saved any rounds yet. Calculate your playing handicap and hit "Save round".',
    avgDifferential: 'Average differential of the last {{n}} rounds:',
    delete: 'Delete',
    grossNetStableford: 'Gross {{gross}} · Net {{net}} · Stableford {{stableford}} pts · Diff {{diff}}',
    pccSuffix: ' (PCC {{pcc}})',
  },
  shop: {
    title: 'Shop',
    subtitle: 'Browse the AfterGolf merchandise catalog here.',
    ropaFilter: 'Clothing',
    articulosFilter: 'Items',
    emptyCategory: 'No products in this category yet.',
    viewDetails: 'View details',
    close: 'Close',
    previousPhoto: 'Previous photo',
    nextPhoto: 'Next photo',
    enlargePhoto: 'Enlarge photo of {{name}}',
    photoNOf: 'Photo {{n}} of {{name}}',
    color: 'Color',
    size: 'Size',
    selectSize: 'Select size',
    addToCart: 'Add',
    addedToast: 'Product added to cart',
  },
  cartPanel: {
    orderRegistered: 'Order registered!',
    payPrefix: 'Pay ',
    payMiddle: ' via Bizum to the number ',
    paySuffix: ', including this reference in the payment concept:',
    confirmationNote:
      "Once we've verified the payment we'll confirm it by email and your order will go into production.",
    close: 'Close',
    cartTitle: 'Cart',
    emptyCart: 'Your cart is empty.',
    size: 'Size',
    each: 'each',
    remove: 'Remove {{name}}',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    free: 'Free',
    freeShippingNote: 'Free shipping on orders over {{amount}}.',
    total: 'Total',
    loginToContinue: 'Log in to continue with your order.',
    shippingAddress: 'Shipping address',
    fullName: 'Full name',
    phone: 'Phone',
    address: 'Address',
    postalCode: 'Postal code',
    city: 'City',
    acceptTermsPrefix: 'I have read and accept the ',
    termsAndConditions: 'terms and conditions',
    registeringOrder: 'Registering order...',
    finalizeOrder: 'Place order (pay by Bizum)',
    emptyCartButton: 'Empty cart',
    orderFailed: "Couldn't register the order",
  },
  termsModal: {
    close: 'Close',
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
  contact: {
    title: 'Contact',
    subtitle: 'Any questions, suggestions, or issues? Write to us and we\'ll get back to you at {{email}}.',
    sentTitle: 'Your message has been sent successfully.',
    sentSubtitle: "We'll get back to you as soon as possible at the email you provided.",
    sendAnother: 'Send another message',
    name: 'Name',
    yourEmail: 'Your email',
    message: 'Message',
    sendError: "Couldn't send the message. Please try again in a moment.",
    sending: 'Sending...',
    send: 'Send message',
  },
  terms: {
    pageTitle: 'Terms and conditions of sale',
    pageSubtitle: 'Applicable to purchases made in the AfterGolf.es Shop.',
    section1Title: '1. Identification',
    section1Body:
      'AfterGolf (aftergolf.es) is a project operated by Juan Carlos Ricaurte, with ' +
      'Spanish tax ID (NIF) 03186893J and address at C/ Circunvalación, 25, Madrid, ' +
      'Spain, acting as a private individual. For any questions you can write to ' +
      'info@aftergolf.es.',
    section2Title: '2. Purpose',
    section2Body:
      'These terms govern the purchase of merchandising items (golf clothing and ' +
      'accessories) through the AfterGolf Shop. Products are manufactured to order ' +
      'through our print-on-demand supplier at the time each purchase is confirmed.',
    section3Title: '3. Prices',
    section3Body:
      'All prices are shown in euros (€) and correspond to the total amount payable; ' +
      'since sales are made as a private individual, VAT is not charged on the price. ' +
      'Shipping costs are calculated during checkout and shown before you confirm ' +
      'the order.',
    section4Title: '4. Purchase and payment process',
    section4Body:
      'Orders are placed through the aftergolf.es Shop and require an account with ' +
      'an email and password. When you finish placing an order you will be given the ' +
      'Bizum number to pay to, along with your order reference, which you must ' +
      'include in the payment concept so we can identify it. The order remains ' +
      'pending until we manually verify that we have received payment; at that point ' +
      "we'll confirm it by email and it will go into production.",
    section5Title: '5. Shipping',
    section5Body:
      'We currently only ship within Spain. The estimated delivery time is shown on ' +
      'each product page and may vary by item, since it is manufactured to order. ' +
      "We'll let you know by email if there is any significant delay.",
    section6Title: '6. Right of withdrawal',
    section6Body:
      'As a consumer, you generally have 14 calendar days from receipt of the order ' +
      'to withdraw from the purchase without needing to give a reason. However, ' +
      'since our products are manufactured to order for each specific purchase, this ' +
      'right may not apply under article 103.c) of the Spanish Consolidated Text of ' +
      'the General Law for the Defense of Consumers and Users, which excludes goods ' +
      "made to the consumer's specifications or clearly personalized. In any case, " +
      'if you have any problem with your order, write to us at info@aftergolf.es and ' +
      "we'll look for a solution.",
    section7Title: '7. Defective or incorrect products',
    section7Body:
      'If you receive a defective, damaged, or incorrect item, contact us at ' +
      'info@aftergolf.es with photos of the product within 14 days of receiving it, ' +
      'and we will arrange a replacement or refund at no cost to you.',
    section8Title: '8. Data protection',
    section8Body:
      'The data you provide us (name, email, shipping address) is used exclusively ' +
      'to manage your order and is shared only with our print-on-demand supplier, ' +
      'as needed to manufacture and ship it. We do not share your data with third ' +
      'parties for commercial purposes.',
    section9Title: '9. Applicable law',
    section9Body:
      'These terms are governed by Spanish law. Any dispute will be submitted to the ' +
      'courts that correspond under consumer protection regulations.',
    section10Title: '10. Contact',
    section10Body: 'For any questions about these terms or your order, write to us at info@aftergolf.es.',
  },
  privacy: {
    pageTitle: 'Privacy policy',
    pageSubtitle:
      'Applicable to the use of aftergolf.es, including the handicap calculator, ' +
      'round history, and the Shop.',
    section1Title: '1. Data controller',
    section1Body:
      'AfterGolf (aftergolf.es) is a project operated by Juan Carlos Ricaurte, with ' +
      'Spanish tax ID (NIF) 03186893J and address at C/ Circunvalación, 25, Madrid, ' +
      'Spain, acting as a private individual. For any question about your data you ' +
      'can write to info@aftergolf.es.',
    section2Title: '2. What data we collect',
    section2Intro: 'Depending on how you use the app, we may process:',
    section2Item1: 'If you sign up with email and password: first name, last name, and email.',
    section2Item2:
      'If you sign in with Google: the name and email your Google account provides ' +
      'us when you authorize access.',
    section2Item3:
      'The round history you voluntarily save (course played, tee, gross and net ' +
      'score, differential, and date).',
    section2Item4Prefix: 'If you place an order in the Shop: name, phone number, and shipping address, needed to manage it (see also our ',
    section2Item4LinkText: 'terms and conditions',
    section2Item4Suffix: ').',
    section2Item5:
      'An anonymous record of which pages are visited, without IP address or any ' +
      'personal identifier, used only for internal usage statistics.',
    section3Title: '3. What we use your data for',
    section3Body:
      'To create and manage your account, save and show you your round history, ' +
      "process orders you place in the Shop, and reply to your contact queries. We " +
      "don't use your data for advertising or profiling purposes.",
    section4Title: '4. Legal basis',
    section4Body:
      'Processing is based on your consent when you voluntarily sign up and use the ' +
      'app, and on performance of the sales contract when you place an order in the ' +
      'Shop.',
    section5Title: '5. Who we share your data with',
    section5Body:
      'Your data is stored in Supabase, our database, authentication, and hosting ' +
      'provider. If you sign in with Google, Google processes your account data ' +
      'under its own privacy policy. If you place an order in the Shop, your name ' +
      'and shipping address are shared with our print-on-demand supplier, needed to ' +
      "manufacture and ship the product. We don't share or sell your data to third " +
      'parties for commercial purposes.',
    section6Title: '6. How long we keep your data',
    section6Body:
      'For as long as you keep your account active. You can request the deletion of ' +
      'your account and all your data at any time by writing to info@aftergolf.es.',
    section7Title: '7. Your rights',
    section7Body:
      'You can exercise your rights of access, rectification, erasure, objection, ' +
      'restriction of processing, and portability by writing to info@aftergolf.es. ' +
      'You also have the right to file a complaint with the Spanish Data Protection ' +
      "Agency (aepd.es) if you believe we haven't handled your data correctly.",
    section8Title: '8. Local storage',
    section8Body:
      'We use your browser\'s local storage (localStorage) to keep you signed in ' +
      "and remember some preferences while you use the app. We don't use " +
      'advertising or third-party tracking cookies.',
    section9Title: '9. Changes to this policy',
    section9Body:
      'We may update this policy if the way we process your data changes. Relevant ' +
      'changes will be reflected on this same page.',
    section10Title: '10. Contact',
    section10Body: 'For any questions about this policy, write to us at info@aftergolf.es.',
  },
}
