# AfterGolf

Calculadora de handicap de golf (fórmulas WHS/RFEG) que ha crecido hasta ser
una pequeña app de club de golf: historial de rondas, una Shop de
merchandising con fulfillment de Printful, y un panel de administración.
Es una SPA de React/Vite contra un backend de Supabase, desplegada en
GitHub Pages en [aftergolf.es](https://aftergolf.es).

## Qué hace

El menú principal tiene estas secciones:

- **Antes de Jugar**: busca tu Handicap Index oficial en el buscador
  federado embebido y, con ese valor, calcula tu Course Handicap para el
  campo, recorrido y tee que vas a jugar, usando la fórmula del World
  Handicap System (WHS), el sistema adoptado por la RFEG. Con 2 o más
  jugadores, reparte los golpes de hándicap entre ellos. Un botón "Ver
  tarjeta" muestra los 18 hoyos (distancia, par, hcp) del tee elegido, y
  otro botón "Ver hoyos con punto" marca en esa misma tarjeta en qué hoyos
  recibe golpe cada jugador.

  ```
  Course Handicap = HI x (Slope / 113) + (Course Rating - Par)
  ```

- **Después de Jugar**: a partir del resultado bruto de una ronda, calcula
  golpes recibidos, resultado neto, puntos Stableford aproximados y el
  Score Differential de la ronda, y permite guardarla en tu historial.

  ```
  Score Differential = (113 / Slope) x (Resultado bruto - Course Rating)
  ```

- **Historial**: rondas guardadas, con resumen de tu Handicap Index medio.
- **Shop**: merchandising AfterGolf, con checkout por Bizum.
- **Contacto**: formulario de contacto.

Los campos de golf están organizados en tres niveles — Campo → Recorrido
(cuando un club tiene varios trazados de 18 hoyos, como los tres de Puerta
de Hierro) → Tee — con datos reales de 122 clubes de las federaciones de
Madrid y Andalucía. Un campo que no está en la lista local se puede buscar
en GolfCourseAPI.com.

Guardar una ronda o comprar en la Shop requiere una cuenta (email/contraseña
o Google). `/admin` (no aparece en el menú, solo accesible para el email del
propietario del sitio) da acceso a gestionar los campos/tees, los productos
de la Shop y los pedidos.

Las fórmulas y el redondeo se validaron contra una ronda real (Aloha Golf
Club, HI 6.1 → Handicap de juego 6, bruto 76 → neto 70, differential 4.1),
ver `src/lib/handicap.test.ts`.

## Desarrollo

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # build de producción (type-check + bundle)
npm run test      # tests de las fórmulas de handicap
npm run lint      # oxlint
```

No hace falta ninguna variable de entorno para desarrollar en local: la URL
y la clave pública (publishable) de Supabase están embebidas en
`src/lib/supabaseClient.ts` — el acceso real está controlado por Row Level
Security en la base de datos, no por mantener esa clave en secreto.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- React Router (`HashRouter`, por las limitaciones de GitHub Pages)
- Supabase: Postgres + Row Level Security, Auth, Storage y Edge Functions
- Español/inglés vía un diccionario tipado (`src/i18n/`)
- Vitest + Testing Library

## Despliegue

`.github/workflows/deploy-pages.yml` construye y despliega a GitHub Pages en
cada push a `main`. No corre tests ni lint automáticamente — hazlo tú antes
de dar un cambio por terminado.

Para quien trabaje en este repo con Claude Code, `CLAUDE.md` documenta la
arquitectura con más detalle (modelo de datos de Supabase, patrón de RLS,
edge functions, i18n, etc.).
