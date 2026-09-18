(function (window) {
  'use strict';

  var isHttps = window.location.protocol === 'https:';
  var localApi = isHttps
    ? 'https://befitapi.test/api/v1'
    : 'http://befitapi.test:8082/api/v1';
  var languageKey = 'befit_language';
  var savedLanguage = (localStorage.getItem(languageKey) || 'en').toLowerCase();
  var language = savedLanguage === 'el' ? 'el' : 'en';

  window.BEFIT_CONFIG = Object.freeze({
    APP_NAME: 'BE-FIT Training Center',
    API_BASE_URL: localApi,
    TOKEN_KEY: 'befit_access_token',
    USER_KEY: 'befit_user',
    LANGUAGE_KEY: languageKey,
    LANGUAGE: language,
    DATE_LOCALE: language === 'el' ? 'el-GR' : 'en-GB',
    TIME_ZONE: 'Europe/Athens',
    SCHEDULE_DAYS_AHEAD: 120
  });
})(window);
