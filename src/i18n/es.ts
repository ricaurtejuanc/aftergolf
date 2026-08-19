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
  teeColors: {
    blanco: 'Blanco',
    amarillo: 'Amarillo',
    azul: 'Azul',
    rojo: 'Rojo',
    negro: 'Negro',
    naranja: 'Naranja',
  },
  explanations: {
    pcc:
      'El PCC (Playing Conditions Calculation) es un ajuste que puede aplicar el ' +
      'comité del campo cuando las condiciones del día (viento fuerte, lluvia, ' +
      'campo muy rápido o muy lento...) hacen que jugar sea más difícil o más ' +
      'fácil de lo normal para todos los jugadores. Puede ser positivo o ' +
      'negativo, normalmente entre -1 y +3. Por defecto es 0 — solo cámbialo si ' +
      'el club te lo ha comunicado tras la ronda.',
    grossStableford:
      'El resultado Bruto Stableford es el número total de golpes Stableford donde ' +
      'únicamente se cuenta como máximo el doble bogey bruto, es decir en un Par 4 ' +
      'si tienes 1 punto, tu resultado máximo es 7, si tienes 2 puntos, tu resultado ' +
      'máximo es 8 y sin punto el resultado máximo es 6. ' +
      'Dicho de forma sencilla: es tu resultado bruto total, pero en cada hoyo no ' +
      'cuentan los golpes que superen el doble bogey (ajustado a los golpes de ' +
      'hándicap que recibes en ese hoyo), para que un hoyo desastroso no dispare tu ' +
      'resultado.',
  },
  infoTooltip: {
    ariaLabel: 'Más información',
  },
  antesDeJugar: {
    title: 'Handicap de Juego',
    subtitle:
      'Calcula tu Course Handicap para el tee que vas a jugar, a partir de tu ' +
      'Handicap Index (WHS/RFEG).',
    numPlayers: 'Número de jugadores',
    yourHi: 'Tu Handicap Index (HI)',
    playerHi: 'Jugador {{n}} — Handicap Index (HI)',
    allowance: 'Modalidad / % de handicap',
    selectCoursePrompt: 'Selecciona un campo y tee para calcular tu handicap de juego.',
    courseHandicap: 'Handicap de juego',
    exactValue: 'Valor exacto',
    player: 'Jugador {{n}}',
    scratch: 'Juega scratch',
    receivesStroke: 'Recibe {{n}} golpe',
    receivesStrokes: 'Recibe {{n}} golpes',
    distributeHandicap: 'Distribuir Handicap',
    calculateRoundButton: 'Calcular handicap jugado y puntos Stableford',
    grossStableford: 'Resultado Bruto Stableford',
    pccAdjustment: 'Ajuste PCC',
    strokesReceived: 'Golpes recibidos',
    netScore: 'Resultado neto',
    stablefordPoints: 'Puntos Stableford',
    playedHandicap: 'Handicap jugado',
    roundSummaryLine:
      'Golpes recibidos {{strokesReceived}} · Neto {{netScore}} · Stableford {{stablefordPoints}} pts · Handicap jugado {{differential}}',
    newCalculation: 'Nuevo cálculo',
  },
  despuesDeJugar: {
    title: 'Después de Jugar',
    subtitle:
      'Introduce tu resultado bruto para obtener strokes recibidos, resultado ' +
      'neto, puntos Stableford y el Score Differential de la ronda.',
    numPlayers: 'Número de jugadores',
    player: 'Jugador {{n}}',
    handicapIndex: 'Handicap Index (HI)',
    grossStableford: 'Resultado Bruto Stableford',
    pccAdjustment: 'Ajuste PCC',
    date: 'Fecha',
    selectCoursePrompt: 'Selecciona un campo y tee para ver tu resultado.',
    hcpDeJuego: 'Hcp de juego',
    strokesReceived: 'Golpes recibidos',
    netScore: 'Resultado neto',
    stablefordPoints: 'Puntos Stableford',
    scoreDifferential: 'Score Differential (handicap jugado)',
    scoreDifferentialFormula: '(113 / Slope) x (Bruto - Course Rating - PCC)',
    multiPlayerSummary:
      'Hcp {{courseHandicap}} · Golpes recibidos {{strokesReceived}} · Neto {{netScore}} · Stableford {{stablefordPoints}} pts · Diff {{differential}}',
    savedButton: 'Ronda guardada ✓',
    savingButton: 'Guardando...',
    saveRoundsButton: 'Guardar rondas en el historial',
    saveRoundButton: 'Guardar ronda en mi historial',
    viewHistoryLink: 'Ver historial de rondas →',
    newCalculation: 'Nuevo cálculo',
  },
  federatedHandicap: {
    title: 'Handicap Federado',
    subtitle: 'Busca tu Handicap Index oficial (RFEG), por nombre o licencia.',
    iframeTitle: 'Consulta de Handicap Federado',
    searchAgain: '← Buscar de nuevo',
  },
  courseTeeSelect: {
    courseLabel: 'Campo de golf',
    searchPlaceholder: 'Buscar campo o ubicación...',
    notInList: '¿No está en la lista? Buscar en GolfCourseAPI',
    change: 'Cambiar',
    outboundTee: 'Tee de salida',
    changeTee: 'Cambiar tee',
    apiSearchTitle: 'Buscar en GolfCourseAPI',
    cancel: 'Cancelar',
    courseNamePlaceholder: 'Nombre del campo...',
    search: 'Buscar',
    searching: 'Buscando...',
    noResults: 'Sin resultados.',
    loadingSuffix: ' (cargando...)',
    searchError: 'Error al buscar en GolfCourseAPI',
    noTeesError: 'Ese campo no tiene datos de tees disponibles.',
    loadError: 'No se pudo cargar el campo',
  },
}
