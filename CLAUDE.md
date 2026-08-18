# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

AfterGolf: a golf handicap calculator (WHS/RFEG formulas) that has grown into a small golf-club app — round history, a merchandising Shop with Printful fulfillment, and an admin panel — all client-side (Vite/React SPA) against a Supabase backend. Deployed to GitHub Pages at aftergolf.es.

## Commands

```bash
npm run dev       # dev server
npm run build     # tsc -b && vite build — type-checks before bundling
npm run lint      # oxlint
npm run test      # vitest run (all tests)
npx vitest run src/lib/handicap.test.ts   # single test file
```

There is currently only one test file, `src/lib/handicap.test.ts` — it validates the handicap formulas against a real round (see comments in that file for the reference numbers). New tests go in `*.test.ts`/`*.test.tsx` next to the code they cover; jsdom + Testing Library are already configured via `src/test/setup.ts` (`vite.config.ts`'s `test` block).

No CI runs tests/lint on push — `.github/workflows/deploy-pages.yml` only builds and deploys on push to `main`. Run `lint`/`build`/`test` yourself before considering a change done.

## Architecture

### Routing and shell

`react-router-dom`'s `HashRouter` (`src/main.tsx`) — required because GitHub Pages doesn't support server-side rewrites for client-side routes, and because Supabase auth redirects (email confirmation, password reset, OAuth) need the real `?code=` query string outside any `#...` fragment; see the "Redirect targets" comment in `AuthContext.tsx`. All routes are declared flatly in `src/App.tsx`; `AuthProvider` and `CartProvider` wrap the router in `main.tsx`. `Sidebar.tsx`'s `NAV_ITEMS` array drives both the desktop sidebar and mobile bottom nav from one list.

### Supabase backend

One Supabase project backs everything: Postgres (with Row Level Security on every table), Auth, Storage, and Deno Edge Functions.

- **Schema is dual-tracked**: `supabase/schema.sql` is the full schema for a fresh setup; `supabase/migrations/NNN_*.sql` are the incremental deltas actually applied to the live project. **Every schema change needs both** — a new migration file *and* the matching edit to `schema.sql` — or the two drift.
- **RLS pattern**: every table is `select` for everyone (`using (true)`), and write-gated by hardcoding the admin's email in the policy: `auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com'` (see `courses`/`tees`/`products` policies in `schema.sql`). There's no roles/claims table — `src/lib/admin.ts`'s `ADMIN_EMAIL` constant is just for the UI to know who's admin; the DB policy is the actual enforcement. Tables written only by edge functions (`orders`) have no client insert/update policy at all — the service-role key bypasses RLS from inside the function.
- **Client data-access layer**: one file per domain in `src/lib/` (`courseStore.ts`, `productStore.ts`, `storage.ts` for rounds) — each defines a `*Row` interface matching the DB's snake_case columns, a `fromRow()` mapper to the camelCase domain type in `src/data/*.ts`, and `loadX`/`addX`/`updateX`/`deleteX` functions. Mutations don't return the single changed row — they re-run `loadX()` and return the full fresh list, which callers just `setState` with. Manual reordering (`reorderProduct`, `reorderColorPhoto`, `reorderProductColor`) works by swapping a `position` column between two rows.
- **Manually-uploaded photos** (Shop product images) live in the `product-mockups` Storage bucket under `manual/<id>/<slug>/<random>` — the random suffix means a failed upload can never overwrite a photo that's already showing, and `isManualPhoto()` in `productStore.ts` checks the URL prefix to distinguish an admin-uploaded photo from a Printful CDN photo when deciding what a Printful reimport is allowed to overwrite.

### Edge functions (`supabase/functions/*/index.ts`, Deno)

`printful`, `golf-course-api`, `admin-users` proxy third-party APIs (Printful catalog/orders, GolfCourseAPI.com, Supabase's admin user-listing API) so their secret keys never reach the client; `bizum-order`/`confirm-bizum-order` handle the Shop's checkout (no payment gateway — an order is recorded and the customer pays by Bizum transfer, confirmed manually by the admin) and send email via `contact`'s same SMTP setup. Each function reads its own secrets from `Deno.env` (`PRINTFUL_API_KEY`, `GOLF_COURSE_API_KEY`, `CONTACT_SMTP_PASSWORD`, `BIZUM_PHONE` — set as Edge Function secrets in the Supabase dashboard, not in this repo) plus the auto-provided `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`. Admin-only functions decode the caller's JWT from the `Authorization` header themselves and check the email claim, rather than trusting anything client-submitted.

Client side, each function has a matching `src/lib/*.ts` file (`printful.ts`, `golfCourseApi.ts`, `adminUsers.ts`, `checkout.ts`) that fetches `${SUPABASE_URL}/functions/v1/<name>?...` with an `Authorization: Bearer <session access_token>` header pulled from `supabase.auth.getSession()`.

### Auth

`AuthContext.tsx` wraps Supabase Auth (email/password + Google OAuth via `signInWithOAuth`, PKCE flow). `RegisterGate.tsx` is the shared login/signup/reset-password UI, reused wherever a feature needs a signed-in user (saving a round, checking out). The admin panel (`/admin`) has a *second*, independent gate on top of normal auth: a client-side PIN (`src/lib/admin.ts`) just to keep the tab out of casual view — the real access control is still the RLS policy, checked against `user.email === ADMIN_EMAIL` once past the PIN.

A signup made before confirming email, or a round played before signing in, doesn't get lost: `AuthContext.tsx` stashes pending profile data / a pending redirect path in `localStorage`, and `src/lib/pendingRounds.ts` queues an unsaved round the same way — both get flushed/replayed once a session actually appears.

### Admin panel (`src/pages/AdminPage.tsx`)

A single page with tabs (`resumen` / `campos` / `productos` / `pedidos`), each tab a full page component (`DashboardAdminPage`, `CoursesPage`, `ProductsAdminPage`, `OrdersAdminPage`). New admin-managed data types are added as a new tab here, not a new top-level route.

### Git workflow gotcha

PRs in this repo are squash-merged, which gives `main` a new commit SHA that doesn't match the feature branch's own history for that change. Committing again on the same branch without accounting for this causes merge conflicts on the next PR. Before starting new work: `git fetch origin main`, check `git merge-base --is-ancestor origin/main HEAD` — if it fails, back up any uncommitted changes, `git checkout -B <branch> origin/main`, restore the changes, and re-verify the diff before committing.
