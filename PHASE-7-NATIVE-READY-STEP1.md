# Phase 7 — Native-ready frontend, Step 1

This step prepares the existing web/PWA frontend to become the single source of truth for future Capacitor Android/iOS builds. No Node, Capacitor package, Android project, or iOS project has been added yet.

## Changes

- Added runtime detection for Capacitor (`IS_NATIVE`, `PLATFORM`).
- Native builds now use `https://api.befittraining.gr/api/v1` even though the WebView host is localhost/capacitor.
- Added `is-native` and `data-platform` markers on `<html>` for native-only behaviour/styles.
- Disabled Service Worker registration and PWA install UI inside native builds.
- Kept the existing PWA behaviour unchanged for the normal web app.
- Added native-only safe-area handling for iPhone/Android insets.
- Bumped the web/PWA build/cache version from 16 to 17.

## Intentionally not done yet

- No `package.json` / Capacitor dependencies yet.
- No `capacitor.config.*` yet.
- No `android/` or `ios/` directories yet.
- No native plugins yet (StatusBar, App, Network, Push Notifications, etc.).
- No backend CORS changes yet.

Those belong to the next step, after this frontend baseline is committed and verified in the browser.
