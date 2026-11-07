(function (window, document) {
  'use strict';

  var config = window.BEFIT_CONFIG;
  var Api = window.BefitApi;
  var I18n = window.BefitI18n;

  var TOKEN_KEY = 'befit_push_token';
  var PENDING_ROUTE_KEY = 'befit_pending_push_route';
  var listenersReady = false;
  var routeHandler = null;

  function plugin() {
    if (!config || !config.IS_NATIVE || !window.Capacitor || !window.Capacitor.Plugins) {
      return null;
    }

    return window.Capacitor.Plugins.PushNotifications || null;
  }

  function language() {
    if (I18n && typeof I18n.language === 'function') {
      return I18n.language();
    }

    return config && config.LANGUAGE === 'el' ? 'el' : 'en';
  }

  function platform() {
    return config && config.PLATFORM === 'ios' ? 'ios' : 'android';
  }

  function safeRoute(value) {
    var route = typeof value === 'string' ? value.trim() : '';

    if (!/^#\/(bookings|schedule|payments|notifications)(?:\?|$)/.test(route)) {
      return '';
    }

    return route;
  }

  function storePendingRoute(route) {
    route = safeRoute(route);
    if (!route) return;
    sessionStorage.setItem(PENDING_ROUTE_KEY, route);
  }

  function takePendingRoute() {
    var route = safeRoute(sessionStorage.getItem(PENDING_ROUTE_KEY) || '');
    sessionStorage.removeItem(PENDING_ROUTE_KEY);
    return route;
  }

  function dispatchRoute(route) {
    route = safeRoute(route);
    if (!route) return;

    if (typeof routeHandler === 'function') {
      var handled = routeHandler(route);
      if (handled !== false) {
        return;
      }
    }

    storePendingRoute(route);
  }

  function extractRoute(notification) {
    var data = notification && notification.data ? notification.data : {};
    return safeRoute(data.route || '');
  }

  function markNotificationRead(notification) {
    var data = notification && notification.data ? notification.data : {};
    var notificationId = parseInt(data.notification_id, 10);

    if (!notificationId || !Api || !Api.getToken()) {
      return;
    }

    Api.patch('/notifications/' + notificationId + '/read', {}).catch(function () {
      /* Deep-link navigation must not fail because read-state sync failed. */
    });
  }

  async function syncToken(token) {
    token = String(token || '').trim();

    if (!token || !Api || !Api.getToken()) {
      return false;
    }

    await Api.post(
      '/profile/push-devices',
      {
        token: token,
        platform: platform(),
        language: language()
      },
      { timeout: 20000 }
    );

    localStorage.setItem(TOKEN_KEY, token);
    return true;
  }

  async function init() {
    var PushNotifications = plugin();

    if (!PushNotifications || listenersReady) {
      return !!PushNotifications;
    }

    listenersReady = true;

    await PushNotifications.addListener(
      'registration',
      function (token) {
        syncToken(token && token.value ? token.value : '').catch(function (error) {
          if (window.console && console.warn) {
            console.warn('[BE-FIT PUSH] Token sync failed.', error);
          }
        });
      }
    );

    await PushNotifications.addListener(
      'registrationError',
      function (error) {
        if (window.console && console.warn) {
          console.warn('[BE-FIT PUSH] Registration failed.', error);
        }
      }
    );

    await PushNotifications.addListener(
      'pushNotificationReceived',
      function (notification) {
        document.dispatchEvent(
          new CustomEvent('befit:push-received', {
            detail: notification || {}
          })
        );
      }
    );

    await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      function (action) {
        var notification = action && action.notification ? action.notification : null;
        var route = extractRoute(notification);

        markNotificationRead(notification);

        if (route) {
          dispatchRoute(route);
        }
      }
    );

    return true;
  }

  async function registerForCurrentUser() {
    var PushNotifications = plugin();

    if (!PushNotifications || !Api || !Api.getToken()) {
      return false;
    }

    await init();

    var permission = await PushNotifications.checkPermissions();

    if (permission.receive === 'prompt') {
      permission = await PushNotifications.requestPermissions();
    }

    if (permission.receive !== 'granted') {
      return false;
    }

    await PushNotifications.register();
    return true;
  }

  async function unregisterCurrentUser() {
    var PushNotifications = plugin();
    var token = localStorage.getItem(TOKEN_KEY) || '';

    if (token && Api && Api.getToken()) {
      try {
        await Api.delete(
          '/profile/push-devices',
          { token: token },
          { timeout: 10000 }
        );
      } catch (error) {
        if (window.console && console.warn) {
          console.warn('[BE-FIT PUSH] Backend unregister failed.', error);
        }
      }
    }

    if (PushNotifications) {
      try {
        await PushNotifications.unregister();
      } catch (error) {
        if (window.console && console.warn) {
          console.warn('[BE-FIT PUSH] Native unregister failed.', error);
        }
      }
    }

    localStorage.removeItem(TOKEN_KEY);
  }

  async function clearAfterAccountDeletion() {
    var PushNotifications = plugin();

    if (PushNotifications) {
      try {
        await PushNotifications.unregister();
      } catch (error) {
        if (window.console && console.warn) {
          console.warn('[BE-FIT PUSH] Native cleanup after account deletion failed.', error);
        }
      }
    }

    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(PENDING_ROUTE_KEY);
  }

  function setRouteHandler(handler) {
    routeHandler = typeof handler === 'function' ? handler : null;
  }

  window.BefitPush = {
    init: init,
    registerForCurrentUser: registerForCurrentUser,
    unregisterCurrentUser: unregisterCurrentUser,
    clearAfterAccountDeletion: clearAfterAccountDeletion,
    setRouteHandler: setRouteHandler,
    takePendingRoute: takePendingRoute,
    safeRoute: safeRoute
  };
})(window, document);
