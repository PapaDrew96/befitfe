# Phase 5 — JavaScript code splitting

## New structure

- `assets/js/app.js`: authentication, router, shared UI/state helpers, profile, notifications, PWA, global events, lazy chunk loader.
- `assets/js/member.js`: member schedule, bookings, payments and announcements. Loaded only when a member-view route needs it.
- `assets/js/admin.js`: administrator dashboard, members, schedule management, bookings, announcements, reports and settings. Loaded only when an admin route needs it.
- `assets/js/i18n.js`: remains a single translation source in this phase to avoid translation drift. Phase 4 Greek placeholder/payment reminder fixes are preserved.

## Loading behavior

`index.html` does not load `member.js` or `admin.js` directly. `app.js` loads a chunk on demand using `?v=14`. A normal member does not download `admin.js`. An admin on the dashboard does not download `member.js` unless they open the Member Schedule route.

## Service worker

The shell is now `befit-shell-v14`. Feature chunks are intentionally not precached; after first use they are stored by the existing runtime same-origin asset cache.

## No API changes

Routes and API endpoints are unchanged.
