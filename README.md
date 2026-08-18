# AfterGolf

Calculadora de handicap de golf de AfterGolf, como proyecto independiente,
sin depender de un backend.

## Qué hace

El menú principal tiene 3 secciones:

- **Antes de Jugar**: busca tu Handicap Index oficial en el buscador
  federado embebido y, con ese valor, calcula tu Course Handicap para el
  campo y tee que vas a jugar, usando la fórmula del World Handicap System
  (WHS), el sistema adoptado por la RFEG.

  ```
  Course Handicap = HI x (Slope / 113) + (Course Rating - Par)
  ```

- **Después de Jugar**: a partir del resultado bruto de una ronda, calcula
  golpes recibidos, resultado neto, puntos Stableford aproximados y el
  Score Differential de la ronda. Incluye el historial de rondas guardadas
  (en `localStorage`, sin necesidad de cuenta ni servidor).

  ```
  Score Differential = (113 / Slope) x (Resultado bruto - Course Rating)
  ```

- **Shop**: merchandising AfterGolf.

Además, `/admin` (protegido por PIN, no aparece en el menú) da acceso a
**Campos**: la base de datos local con 55 campos de golf españoles reales
(nombre, ubicación, y Course Rating / Slope / Par por cada tee).

Las fórmulas y el redondeo se validaron contra una ronda real (Aloha Golf
Club, HI 6.1 → Handicap de juego 6, bruto 76 → neto 70, differential 4.1),
ver `src/lib/handicap.test.ts`.

## Desarrollo

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # build de producción
npm run test      # tests de las fórmulas de handicap
npm run lint      # oxlint
```

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- React Router
- Vitest + Testing Library
- Sin backend: todo el estado vive en `localStorage`
