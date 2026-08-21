// Spanish strings for every customer-facing page/component. The admin panel
// (AdminPage and its tabs) is intentionally not part of this dictionary —
// it's used only by the single Spanish-speaking site owner, so translating
// it would be pure overhead. en.ts is typed against this file's shape, so a
// missing/extra key in either file fails the build.
export const es = {
  sidebar: {
    home: 'Inicio',
    antesDeJugar: 'Antes',
    despuesDeJugar: 'Después',
    historial: 'Historial',
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
  authErrors: {
    invalidCredentials: 'Email o contraseña incorrectos.',
    alreadyRegistered: 'Ya existe una cuenta con este email. Inicia sesión.',
    emailNotConfirmed: 'Confirma tu cuenta desde el correo que te enviamos antes de iniciar sesión.',
    passwordTooShort: 'La contraseña debe tener al menos 6 caracteres.',
    rateLimit: 'Se han enviado demasiados correos. Espera unos minutos y vuelve a intentarlo.',
    googleNotEnabled: 'El inicio de sesión con Google todavía no está activado.',
    generic: 'No se pudo completar la operación. Inténtalo de nuevo.',
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
  registerGate: {
    continueWithGoogle: 'Continuar con Google',
    or: 'o',
    login: 'Iniciar sesión',
    signup: 'Crear cuenta',
    signupNote:
      'Para guardar tu ronda necesitamos que te registres — así tu ' +
      'historial queda ligado a tu cuenta, no solo a este navegador.',
    firstName: 'Nombre',
    lastName: 'Apellidos',
    email: 'Email',
    password: 'Contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    sending: 'Enviando...',
    sendResetEmail: 'Enviar correo de recuperación',
    back: 'Volver',
    cancel: 'Cancelar',
    signupConfirmationSent: 'Te hemos enviado un correo para confirmar tu cuenta. Ábrelo y luego inicia sesión aquí.',
    resetEmailSent: 'Te hemos enviado un correo para restablecer tu contraseña.',
  },
  passwordRecoveryGate: {
    passwordTooShort: 'La contraseña debe tener al menos 6 caracteres.',
    passwordsDontMatch: 'Las contraseñas no coinciden.',
    updateFailed: 'No se pudo actualizar la contraseña. Inténtalo de nuevo.',
    done: 'Contraseña actualizada. Ya puedes seguir usando la app.',
    title: 'Elige una nueva contraseña',
    newPassword: 'Nueva contraseña',
    repeatPassword: 'Repite la contraseña',
    saving: 'Guardando...',
    save: 'Guardar contraseña',
  },
  history: {
    title: 'Historial de rondas',
    subtitle: 'Tu historial está ligado a tu cuenta, así lo ves igual desde cualquier dispositivo.',
    greetingPrefix: 'Hola, ',
    signOut: 'Cerrar sesión',
    loading: 'Cargando historial...',
    empty: 'Aún no has guardado ninguna ronda. Calcula tu handicap jugado y pulsa "Guardar ronda".',
    avgDifferential: 'Differential medio de las últimas {{n}} rondas:',
    delete: 'Eliminar',
    grossNetStableford: 'Bruto {{gross}} · Neto {{net}} · Stableford {{stableford}} pts · Diff {{diff}}',
    pccSuffix: ' (PCC {{pcc}})',
  },
  shop: {
    title: 'Shop',
    subtitle: 'Aquí puedes ver el catálogo de merchandising de AfterGolf.',
    ropaFilter: 'Ropa',
    articulosFilter: 'Artículos',
    emptyCategory: 'Todavía no hay productos en esta categoría.',
    viewDetails: 'Ver detalles',
    close: 'Cerrar',
    previousPhoto: 'Foto anterior',
    nextPhoto: 'Foto siguiente',
    enlargePhoto: 'Ampliar foto de {{name}}',
    photoNOf: 'Foto {{n}} de {{name}}',
    color: 'Color',
    size: 'Talla',
    selectSize: 'Selecciona talla',
    addToCart: 'Añadir',
    addedToast: 'Producto añadido al carrito correctamente',
    copyLink: 'Copiar enlace',
    linkCopiedToast: 'Enlace copiado al portapapeles',
  },
  cartPanel: {
    orderRegistered: '¡Pedido registrado!',
    payPrefix: 'Paga ',
    payMiddle: ' por Bizum al número ',
    paySuffix: ', indicando esta referencia en el concepto:',
    confirmationNote:
      'En cuanto verifiquemos el pago te lo confirmaremos por correo y tu pedido pasará a producción.',
    close: 'Cerrar',
    cartTitle: 'Carrito',
    emptyCart: 'Tu carrito está vacío.',
    size: 'Talla',
    each: 'c/u',
    remove: 'Quitar {{name}}',
    subtotal: 'Subtotal',
    shipping: 'Envío',
    free: 'Gratis',
    freeShippingNote: 'Envío gratis en pedidos superiores a {{amount}}.',
    total: 'Total',
    loginToContinue: 'Inicia sesión para continuar con tu pedido.',
    ordersDisabled: 'En breve podrás realizar tus pedidos.',
    shippingAddress: 'Dirección de envío',
    fullName: 'Nombre completo',
    phone: 'Teléfono',
    address: 'Dirección',
    postalCode: 'Código postal',
    city: 'Ciudad',
    acceptTermsPrefix: 'He leído y acepto los ',
    termsAndConditions: 'términos y condiciones',
    registeringOrder: 'Registrando pedido...',
    finalizeOrder: 'Finalizar pedido (pago por Bizum)',
    emptyCartButton: 'Vaciar carrito',
    orderFailed: 'No se pudo registrar el pedido',
  },
  termsModal: {
    close: 'Cerrar',
  },
  courseTeeSelect: {
    courseLabel: 'Campo de golf',
    searchPlaceholder: 'Buscar campo o ubicación...',
    notInList: '¿No está en la lista? Buscar en GolfCourseAPI',
    change: 'Cambiar',
    recorridoLabel: 'Recorrido',
    changeRecorrido: 'Cambiar recorrido',
    outboundTee: 'Tee de salida',
    changeTee: 'Cambiar tee',
    apiSearchTitle: 'Buscar en GolfCourseAPI',
    cancel: 'Cancelar',
    courseNamePlaceholder: 'Nombre del campo...',
    search: 'Buscar',
    searching: 'Buscando...',
    noResults: 'Sin resultados.',
    noResultsContactPrefix: '¿No encuentras tu campo? ',
    noResultsContactLinkText: 'Contáctanos',
    noResultsContactSuffix: ' y en menos de 30 minutos lo tendrás disponible.',
    loadingSuffix: ' (cargando...)',
    searchError: 'Error al buscar en GolfCourseAPI',
    noTeesError: 'Ese campo no tiene datos de tees disponibles.',
    loadError: 'No se pudo cargar el campo',
  },
  contact: {
    title: 'Contacto',
    subtitle: '¿Alguna duda, sugerencia o incidencia? Escríbenos y te responderemos a {{email}}.',
    sentTitle: 'Tu consulta ha sido enviada correctamente.',
    sentSubtitle: 'Te responderemos lo antes posible al email que nos has indicado.',
    sendAnother: 'Enviar otra consulta',
    name: 'Nombre',
    yourEmail: 'Tu email',
    message: 'Mensaje',
    sendError: 'No se pudo enviar el mensaje. Inténtalo de nuevo en un momento.',
    sending: 'Enviando...',
    send: 'Enviar mensaje',
  },
  terms: {
    pageTitle: 'Términos y condiciones de venta',
    pageSubtitle: 'Aplicables a las compras realizadas en la Shop de aftergolf.es.',
    section1Title: '1. Identificación',
    section1Body:
      'AfterGolf (aftergolf.es) es un proyecto operado por Juan Carlos Ricaurte, con ' +
      'NIF 03186893J y domicilio en C/ Circunvalación, 25, Madrid, actuando como ' +
      'persona física. Para cualquier consulta puedes escribir a info@aftergolf.es.',
    section2Title: '2. Objeto',
    section2Body:
      'Estas condiciones regulan la compra de artículos de merchandising (ropa y ' +
      'accesorios de golf) a través de la Shop de AfterGolf. Los productos se ' +
      'fabrican bajo pedido a través de nuestro proveedor de impresión bajo demanda ' +
      'en el momento en que se confirma cada compra.',
    section3Title: '3. Precios',
    section3Body:
      'Todos los precios se muestran en euros (€) y corresponden al importe total a ' +
      'pagar; al vender como particular, no se repercute IVA sobre el precio. Los ' +
      'gastos de envío se calculan durante el proceso de compra y se muestran antes ' +
      'de confirmar el pedido.',
    section4Title: '4. Proceso de compra y pago',
    section4Body:
      'Los pedidos se realizan a través de la Shop de aftergolf.es y requieren una ' +
      'cuenta con email y contraseña. Al finalizar el pedido se te indicará el número ' +
      'de Bizum al que hacer el pago junto con la referencia de tu pedido, que debes ' +
      'incluir en el concepto para que podamos identificarlo. El pedido queda ' +
      'pendiente de pago hasta que verificamos manualmente que lo hemos recibido; en ' +
      'ese momento te lo confirmamos por correo electrónico y pasa a producción.',
    section5Title: '5. Envío',
    section5Body:
      'Actualmente solo enviamos a España. El plazo de entrega estimado se indica en ' +
      'la ficha de cada producto y puede variar según el artículo, ya que se fabrica ' +
      'bajo pedido. Te avisaremos por correo si hay algún retraso relevante.',
    section6Title: '6. Derecho de desistimiento',
    section6Body:
      'Como consumidor, dispones con carácter general de 14 días naturales desde la ' +
      'recepción del pedido para desistir de la compra sin necesidad de justificación. ' +
      'No obstante, dado que nuestros productos se fabrican bajo pedido para cada ' +
      'compra concreta, este derecho puede no ser de aplicación conforme al artículo ' +
      '103.c) del Texto Refundido de la Ley General para la Defensa de los ' +
      'Consumidores y Usuarios, que excluye los bienes confeccionados conforme a ' +
      'especificaciones del consumidor o claramente personalizados. En cualquier ' +
      'caso, si tienes algún problema con tu pedido, escríbenos a info@aftergolf.es y ' +
      'buscaremos una solución.',
    section7Title: '7. Productos defectuosos o incorrectos',
    section7Body:
      'Si recibes un artículo defectuoso, dañado o distinto al que pediste, ' +
      'contáctanos en info@aftergolf.es con fotos del producto en un plazo de 14 días ' +
      'desde la recepción, y gestionaremos la sustitución o el reembolso sin coste ' +
      'para ti.',
    section8Title: '8. Protección de datos',
    section8Body:
      'Los datos que nos facilitas (nombre, email, dirección de envío) se usan ' +
      'exclusivamente para gestionar tu pedido y se comparten solo con nuestro ' +
      'proveedor de impresión bajo demanda, necesario para la fabricación y el envío. ' +
      'No cedemos tus datos a terceros con fines comerciales.',
    section9Title: '9. Ley aplicable',
    section9Body:
      'Estas condiciones se rigen por la legislación española. Cualquier ' +
      'controversia se someterá a los juzgados y tribunales que correspondan según la ' +
      'normativa de protección de consumidores.',
    section10Title: '10. Contacto',
    section10Body: 'Para cualquier duda sobre estas condiciones o sobre tu pedido, escríbenos a info@aftergolf.es.',
  },
  privacy: {
    pageTitle: 'Política de privacidad',
    pageSubtitle:
      'Aplicable al uso de aftergolf.es, incluida la calculadora de handicap, el ' +
      'historial de rondas y la Shop.',
    section1Title: '1. Responsable del tratamiento',
    section1Body:
      'AfterGolf (aftergolf.es) es un proyecto operado por Juan Carlos Ricaurte, con ' +
      'NIF 03186893J y domicilio en C/ Circunvalación, 25, Madrid, actuando como ' +
      'persona física. Para cualquier consulta sobre tus datos puedes escribir a ' +
      'info@aftergolf.es.',
    section2Title: '2. Qué datos recogemos',
    section2Intro: 'Dependiendo de cómo uses la app, podemos tratar:',
    section2Item1: 'Si te registras con email y contraseña: nombre, apellidos y email.',
    section2Item2:
      'Si inicias sesión con Google: el nombre y el email que tu cuenta de Google ' +
      'nos proporciona al autorizar el acceso.',
    section2Item3:
      'El historial de rondas que guardas voluntariamente (campo jugado, tee, ' +
      'resultado bruto y neto, differential y fecha).',
    section2Item4Prefix: 'Si realizas un pedido en la Shop: nombre, teléfono y dirección de envío, necesarios para gestionarlo (ver también nuestros ',
    section2Item4LinkText: 'Términos y condiciones',
    section2Item4Suffix: ').',
    section2Item5:
      'Un registro anónimo de qué páginas se visitan, sin dirección IP ni ningún ' +
      'identificador personal, que usamos solo para estadísticas internas de uso.',
    section3Title: '3. Para qué usamos tus datos',
    section3Body:
      'Para crear y gestionar tu cuenta, guardar y mostrarte tu historial de rondas, ' +
      'tramitar los pedidos que hagas en la Shop, y responder a tus consultas de ' +
      'contacto. No usamos tus datos con fines publicitarios ni de perfilado.',
    section4Title: '4. Base legal',
    section4Body:
      'El tratamiento se basa en tu consentimiento al registrarte y usar la app de ' +
      'forma voluntaria, y en la ejecución del contrato de compraventa cuando haces ' +
      'un pedido en la Shop.',
    section5Title: '5. Con quién compartimos tus datos',
    section5Body:
      'Tus datos se almacenan en Supabase, nuestro proveedor de base de datos, ' +
      'autenticación y alojamiento. Si inicias sesión con Google, Google trata los ' +
      'datos de tu cuenta conforme a su propia política de privacidad. Si haces un ' +
      'pedido en la Shop, tu nombre y dirección de envío se comparten con nuestro ' +
      'proveedor de impresión bajo demanda, necesario para fabricar y enviar el ' +
      'producto. No cedemos ni vendemos tus datos a terceros con fines comerciales.',
    section6Title: '6. Cuánto tiempo conservamos tus datos',
    section6Body:
      'Mientras mantengas tu cuenta activa. Puedes pedir la eliminación de tu cuenta ' +
      'y de todos tus datos en cualquier momento escribiendo a info@aftergolf.es.',
    section7Title: '7. Tus derechos',
    section7Body:
      'Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, ' +
      'limitación del tratamiento y portabilidad escribiendo a info@aftergolf.es. ' +
      'También tienes derecho a presentar una reclamación ante la Agencia Española ' +
      'de Protección de Datos (aepd.es) si consideras que no hemos tratado tus datos ' +
      'correctamente.',
    section8Title: '8. Almacenamiento local',
    section8Body:
      'Usamos el almacenamiento local de tu navegador (localStorage) para mantener ' +
      'tu sesión iniciada y algunas preferencias mientras usas la app. No usamos ' +
      'cookies de publicidad ni de rastreo de terceros.',
    section9Title: '9. Cambios en esta política',
    section9Body:
      'Podemos actualizar esta política si cambia cómo tratamos tus datos. Los ' +
      'cambios relevantes se reflejarán en esta misma página.',
    section10Title: '10. Contacto',
    section10Body: 'Para cualquier duda sobre esta política, escríbenos a info@aftergolf.es.',
  },
}
