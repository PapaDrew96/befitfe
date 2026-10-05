(function (window) {
  'use strict';

  var hostname = window.location.hostname.toLowerCase();
  var isHttps = window.location.protocol === 'https:';

  // Capacitor injects window.Capacitor inside the native WebView.
  // Keep web/PWA and native builds on the same frontend codebase.
  var capacitor = window.Capacitor || null;
  var isNative = !!(
    capacitor &&
    typeof capacitor.isNativePlatform === 'function' &&
    capacitor.isNativePlatform()
  );
  var platform = isNative && typeof capacitor.getPlatform === 'function'
    ? capacitor.getPlatform()
    : 'web';

  document.documentElement.classList.toggle('is-native', isNative);
  document.documentElement.setAttribute('data-platform', platform);

  var isProduction =
    hostname === 'app.befittraining.gr' ||
    hostname === 'befittraining.gr' ||
    hostname === 'www.befittraining.gr';

  // Native bundles run from a localhost/capacitor origin, so hostname alone
  // cannot be used to decide whether the production API should be used.
  var apiBaseUrl = (isProduction || isNative)
    ? 'https://api.befittraining.gr/api/v1'
    : (
        isHttps
          ? 'https://befitapi.test/api/v1'
          : 'http://befitapi.test:8082/api/v1'
      );

  var languageKey = 'befit_language';
  var savedLanguage = (localStorage.getItem(languageKey) || 'en').toLowerCase();
  var language = savedLanguage === 'el' ? 'el' : 'en';

  window.BEFIT_CONFIG = Object.freeze({
    APP_NAME: 'BE-FIT Training Center',
    BUILD_VERSION: '17',
    IS_NATIVE: isNative,
    PLATFORM: platform,
    API_BASE_URL: apiBaseUrl,
    TOKEN_KEY: 'befit_access_token',
    USER_KEY: 'befit_user',
    LANGUAGE_KEY: languageKey,
    LANGUAGE: language,
    DATE_LOCALE: language === 'el' ? 'el-GR' : 'en-GB',
    TIME_ZONE: 'Europe/Athens',
    SCHEDULE_DAYS_AHEAD: 120
  });
})(window);
