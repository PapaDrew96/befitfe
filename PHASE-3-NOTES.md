# BE-FIT Frontend Optimization — Phase 3

## What changed

- Select2 CSS and JavaScript are no longer loaded on the login/member initial page.
- Select2 is loaded from jsDelivr only when a page/modal actually contains `select.select2`.
- If Select2 cannot load, the native HTML select remains usable.
- Local asset version bumped from `v=11` to `v=12`.
- Service worker cache bumped to `befit-shell-v12`.
- Service worker registration now uses `updateViaCache: 'none'` so update checks do not reuse an HTTP cache entry for the worker script.
- No API routes, booking rules, authentication logic, or UI functionality were intentionally changed.

## Files changed in Phase 3

- `index.html`
- `assets/js/app.js`
- `service-worker.js`
- `manifest.webmanifest`

## Deployment

Replace only those four files on production. Keep the existing optimized images and `.htaccess` from Phase 2.
