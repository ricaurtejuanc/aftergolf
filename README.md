# AfterGolf

Calculadora de handicap de golf, replicada de la app AfterGolf (Base44) como
proyecto independiente, sin depender de un backend.

## Qué hace

- **Handicap de Juego** (pre-ronda): calcula tu Course Handicap para un tee
  concreto a partir de tu Handicap Index, usando la fórmula del World
  Handicap System (WHS), el sistema adoptado por la RFEG.

  ```
  Course Handicap = HI x (Slope / 113) + (Course Rating - Par)
  ```

- **Handicap Jugado (Post-Ronda)**: a partir del resultado bruto de una
  ronda, calcula golpes recibidos, resultado neto, puntos Stableford
  aproximados y el Score Differential de la ronda.

  ```
  Score Differential = (113 / Slope) x (Resultado bruto - Course Rating)
  ```

- **Campos**: base de datos local con 55 campos de golf españoles reales
  (nombre, ubicación, y Course Rating / Slope / Par por cada tee).

- **Historial**: las rondas que guardes se almacenan en `localStorage`, sin
  necesidad de cuenta ni servidor.

Las fórmulas y el redondeo se validaron contra una ronda real exportada de la
app original en Base44 (Aloha Golf Club, HI 6.1 → Handicap de juego 6, bruto
76 → neto 70, differential 4.1), ver `src/lib/handicap.test.ts`.

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
