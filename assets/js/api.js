(function (window, $) {
  'use strict';

  var config = window.BEFIT_CONFIG;
  var I18n = window.BefitI18n;

  function normalizePath(path) {
    if (!path) return '';
    return path.charAt(0) === '/' ? path : '/' + path;
  }

  function parseError(xhr) {
    var payload = xhr && xhr.responseJSON ? xhr.responseJSON : null;
    var message = payload && payload.message ? payload.message : 'Something went wrong. Please try again.';
    if (I18n) message = I18n.t(message);
    var details = [];

    if (payload && payload.errors && typeof payload.errors === 'object') {
      Object.keys(payload.errors).forEach(function (field) {
        var fieldErrors = payload.errors[field];
        if (!Array.isArray(fieldErrors)) fieldErrors = [fieldErrors];
        fieldErrors.forEach(function (item) {
          if (item) details.push(I18n ? I18n.t(String(item)) : String(item));
        });
      });
    }

    return {
      status: xhr ? xhr.status : 0,
      message: message,
      details: details,
      payload: payload
    };
  }

  var Api = {
    getToken: function () {
      return localStorage.getItem(config.TOKEN_KEY) || '';
    },

    setToken: function (token) {
      if (token) localStorage.setItem(config.TOKEN_KEY, token);
      else localStorage.removeItem(config.TOKEN_KEY);
    },

    clearSession: function () {
      localStorage.removeItem(config.TOKEN_KEY);
      localStorage.removeItem(config.USER_KEY);
    },

    request: function (method, path, data, options) {
      options = options || {};
      var token = Api.getToken();
      var ajaxOptions = {
        url: config.API_BASE_URL.replace(/\/$/, '') + normalizePath(path),
        method: method,
        dataType: 'json',
        timeout: options.timeout || 20000,
        headers: $.extend({ 'Accept-Language': config.LANGUAGE === 'el' ? 'el' : 'en' }, options.headers || {})
      };

      if (token && options.auth !== false) {
        ajaxOptions.headers.Authorization = 'Bearer ' + token;
      }

      if (method === 'GET') {
        ajaxOptions.data = data || {};
      } else if (data !== undefined) {
        ajaxOptions.contentType = 'application/json; charset=utf-8';
        ajaxOptions.data = JSON.stringify(data);
      }

      return new Promise(function (resolve, reject) {
        $.ajax(ajaxOptions)
          .done(function (response) {
            resolve(response);
          })
          .fail(function (xhr) {
            var error = parseError(xhr);
            if (error.status === 401 && options.auth !== false) {
              $(document).trigger('befit:unauthorized', [error]);
            }
            reject(error);
          });
      });
    },

    get: function (path, query, options) {
      return Api.request('GET', path, query, options);
    },
    post: function (path, body, options) {
      return Api.request('POST', path, body, options);
    },
    put: function (path, body, options) {
      return Api.request('PUT', path, body, options);
    },
    patch: function (path, body, options) {
      return Api.request('PATCH', path, body, options);
    },
    delete: function (path, body, options) {
      return Api.request('DELETE', path, body, options);
    },
    errorMessage: function (error) {
      if (!error) return I18n ? I18n.t('Something went wrong.') : 'Something went wrong.';
      var parts = [error.message || (I18n ? I18n.t('Something went wrong.') : 'Something went wrong.')];
      if (error.details && error.details.length) {
        parts.push(error.details.join(' '));
      }
      return parts.join(' ');
    }
  };

  window.BefitApi = Api;
})(window, jQuery);
