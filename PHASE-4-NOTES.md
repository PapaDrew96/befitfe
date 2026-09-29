# BE-FIT Phase 4 – i18n hardening

This phase fixes untranslated Greek placeholders and the payment reminder/expiry settings copy before code splitting `app.js`.

Changed:
- `assets/js/i18n.js`: added missing Greek translations for dynamic form placeholders and payment reminder strings.
- `assets/js/app.js`: dynamic placeholders now call `t()` where needed; Select2 translates its placeholder before initialization; payment reminder label/help text call `t()` explicitly.
- `index.html`, `service-worker.js`, `manifest.webmanifest`: cache/deploy version bumped to v13.

No backend/API/business-rule changes.
