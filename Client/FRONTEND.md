# Shortify Frontend

This document explains what the Angular client does, how it's put together, and what changed in the Apple-style redesign.

## What this app is

Shortify is a URL shortener, in the spirit of Bitly or TinyURL. A user pastes a long URL, the app calls a Spring Boot API to generate a compact link, and the API stores a mapping from a short code (e.g. `abc123`) to the original destination. Anyone who visits `http://localhost:8080/r/abc123` gets redirected to the original URL, and every visit increments a click counter.

The frontend is the part a person actually touches: the form that creates links, the dashboard that lists them, and the small utilities (QR codes, bulk import, CSV export, per-link analytics) built around that core loop.

## How a link gets created and resolved

```
┌──────────────┐   POST /api/shortUrl/shorten     ┌──────────────┐   INSERT / SELECT   ┌──────────┐
│  Angular UI  │ ────────────────────────────────▶│ Spring Boot  │ ───────────────────▶│  MySQL   │
│ (this app)   │                                    │     API      │                     │          │
└──────────────┘                                    └──────────────┘                     └──────────┘
       ▲                                                    │
       │            GET /api/shortUrl/all?userId=1          │ cache short code → destination
       └────────────────────────────────────────────────────┤ (600s TTL)
                                                              ▼
                                                        ┌──────────┐
                                                        │  Redis   │
                                                        └──────────┘

Visitor's browser ──GET /r/{code}──▶ RedirectController ──302──▶ original URL
                                       (checks Redis first, then MySQL, then increments click count)
```

The three endpoints the frontend calls (see `src/app/services/api-url.service.ts`):

| Endpoint | Used by | Purpose |
|---|---|---|
| `POST /api/shortUrl/shorten` | Create page, Bulk page | Create a short link, optionally with a custom alias and expiry |
| `GET /api/shortUrl/all?userId=:id` | Dashboard | List every link for a user |
| `GET /api/shortUrl/analytics/:shortCode` | Link detail page | Fetch click count and metadata for one link |

There is currently **no authentication**. Every link is attributed to a fixed demo user id (`environment.demoUserId`, default `1`) until a login flow exists — see "Known gaps" below.

## Pages

| Route | Component | Purpose |
|---|---|---|
| `/` | `short-url` | The homepage: paste a URL, optionally set a custom alias and expiry, get a short link back with a QR code |
| `/dashboard` | `dashboard` | Every link you've created: search, filter by status, sort, per-row QR/copy/open, CSV export |
| `/bulk` | `bulk` *(new)* | Paste up to 25 URLs at once and shorten them in one pass |
| `/link/:shortCode` | `link-detail` *(new)* | One link's stats: total clicks, clicks/day, created date, expiry countdown |
| `/profile` | `profile` | Account details (placeholder data) and an appearance switcher (Light/Dark/Auto) |

## What changed in this pass

### 1. Visual redesign — Apple-inspired system

The whole app now runs on a small set of design tokens in `src/styles.css`, modeled on Apple's Human Interface Guidelines rather than the previous orange/amber PrimeNG default theme:

- **Type**: San Francisco system font stack, tight negative letter-spacing, large confident headlines (`display-xl`, `display-lg` utility classes).
- **Color**: a near-black/near-white neutral palette (`#f5f5f7` light / `#000000` dark) with a single blue accent (`#0071e3` light, `#0a84ff` dark) — no gradients, no multi-color chrome.
- **Surfaces**: soft, low-opacity shadows and 12–24px corner radii (`--radius-md`, `--radius-lg`, …) instead of sharp corners and heavy borders.
- **Materials**: translucent, blurred panels (`backdrop-filter: blur()`) for the navbar, dialogs, dropdowns, and toasts — the frosted-glass effect used throughout macOS/iOS.
- **Motion**: one consistent easing curve (`cubic-bezier(0.4, 0, 0.2, 1)`) and short, deliberate durations for hovers, page transitions, and the mobile nav sheet.
- **Dark mode**: true black background in dark mode (not just a darkened grey), matching OLED-style Apple dark interfaces. Toggled from the navbar or Profile → Appearance, with an "Auto" option that follows the OS.

Every PrimeNG component (buttons, inputs, tables, dialogs, toasts, the date picker, the toggle switch) is restyled through CSS overrides layered on top of the Aura theme, so the look is consistent without forking PrimeNG itself.

### 2. Bug fixes found while reading the code

- **`provideHttpClient()` was never registered.** Every service call (`HttpClient`) would have thrown `NullInjectorError` at runtime — the app could not have made a single API request before this fix. Added in `app.config.ts` with `withFetch()` for SSR compatibility.
- **`environment.prod.ts` was misconfigured**: `production: false` (should be `true`) and `apiBaseUrl` carried a trailing `/api` that would have doubled up with the `/api/...` already baked into every endpoint constant, producing `/api/api/shortUrl/...` in production builds.
- **Dashboard's status toggle and expiry editor were client-side only** — the backend has no `PATCH`/`PUT` endpoint for a `ShortUrl`, so those controls silently mutated local state and did nothing server-side. They've been removed from the table actions rather than left as a misleading no-op; the honest state today is view + QR + analytics.

### 3. New features

All new features are built strictly on top of the three endpoints the backend actually exposes — nothing here calls an endpoint that doesn't exist.

- **QR codes for every link** (`services/qr-service`) — a small, dependency-free QR encoder (ISO/IEC 18004, byte mode, error-correction level M) written from scratch so no new npm package was needed. It's round-trip tested: matrices are decoded back to the original string to confirm correctness (see verification notes below). Every link — on the create page, the dashboard, and the detail page — can show a scannable QR code and download it as an SVG.
- **Search, filter, and sort on the dashboard** — search by destination or short code, filter by Active/Paused/Expired, sort by newest/most-clicked/expiring-soonest/alphabetical. All computed client-side over the already-fetched link list via Angular signals, so it's instant.
- **Summary stat tiles** — total links, total clicks, active count, and average clicks per link, computed from the same data the table renders.
- **CSV export** — exports the currently filtered/sorted view (dashboard) or the results of a bulk run, entirely client-side (`Blob` + object URL), no server support needed.
- **Bulk shortening** (`/bulk`) — paste up to 25 URLs, one per line; invalid lines are filtered out before submitting. Requests are sent one at a time (`concatMap`) rather than all at once, so the backend sees a steady trickle instead of a burst of 25 simultaneous inserts. Each row shows its own progress/result, and successes can be copied or exported together.
- **Per-link analytics page** (`/link/:shortCode`) — pulls from the existing `/analytics/{shortCode}` endpoint (previously unused by the frontend) to show total clicks, an estimated clicks-per-day rate, creation date, and an expiry countdown.
- **Light / Dark / Auto appearance** — a proper theme service (`services/theme-service`) that persists the choice, defaults to following the OS setting, and reacts live if the OS theme changes mid-session.
- **Toast + clipboard helper** (`services/ui-service`) — centralizes copy-to-clipboard (with an `execCommand` fallback for browsers without the async Clipboard API) and file download, so every "Copy" and "Export" button behaves consistently.

### 4. Known gaps (by design, not oversight)

These are called out explicitly rather than silently worked around:

- **No authentication.** Every created link is attributed to `environment.demoUserId`. Building real auth (JWT, guards, interceptor) is a backend-plus-frontend project of its own and was out of scope here — the roadmap in the root `README.md` already tracks it.
- **No edit/delete/pause endpoint on the backend.** The dashboard is read-plus-create only; toggling status or changing an expiry after creation needs new Spring endpoints (`PATCH /api/shortUrl/{id}`, `DELETE /api/shortUrl/{id}`) that don't exist yet.
- **Anonymous/multi-user support isn't wired up** — `demoUserId` can be set to `null` to create anonymous links, but the dashboard always queries a single user id.

## Project structure (frontend)

```
src/app/
├── app.config.ts              HTTP client, router, PrimeNG theme, animations
├── app.routes.ts               Route table (lazy-loaded standalone components)
├── app.routes.server.ts        SSR render mode per route (prerender vs. server)
├── navbar/                     Floating translucent top nav + mobile sheet
├── short-url/                  Home page — create a link
├── dashboard/                  List, search, filter, sort, export links
├── bulk/                       Bulk-shorten up to 25 URLs at once
├── link-detail/                Per-link analytics page
├── profile/                    Account info + appearance switcher
├── shared/qr-dialog/           Reusable "show QR code" dialog
├── services/
│   ├── short-url-service/      POST /shorten, GET /analytics/:code
│   ├── dashboard-service/      GET /all — normalizes API rows into LinkRecord
│   ├── theme-service/          Light/Dark/Auto state, persisted + OS-aware
│   ├── qr-service/              Dependency-free QR code generator (SVG output)
│   └── ui-service/             Toast notifications, clipboard, file download
└── models/short-url.model.ts   Shared types + backend → UI data mapping
```

## Running it

```bash
cd client
npm install
npm start          # http://localhost:4200, expects the API at localhost:8080
```

The Spring Boot backend (`../Server`) and a MySQL + Redis instance need to be running for anything beyond the static UI to work — see the root `README.md` for backend setup.
