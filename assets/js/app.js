(function (window, document, $) {
  'use strict';

  var Api = window.BefitApi;
  var config = window.BEFIT_CONFIG;
  var I18n = window.BefitI18n;
  function t(value) { return I18n ? I18n.t(value) : value; }

  var state = {
    user: null,
    settings: null,
    route: '',
    weekDate: null,
    selectedDate: null,
    currentSchedule: null,
    announcements: [],
    adminUsers: null,
    adminBookings: null,
    adminWaitlist: [],
    adminScheduleTab: 'templates',
    adminScheduleRange: null,
    deferredInstallPrompt: null,
    confirmResolver: null,
    routeVersion: 0
  };

  var appModal;
  var confirmModal;

  var ICONS = {
    'calendar': '<path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/>',
    'calendar-check': '<path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="m8.5 15 2 2 5-5"/>',
    'clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    'user': '<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/>',
    'bell': '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    'settings': '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-2.83 2.83-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21h-4v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06-2.83-2.83.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3v-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06 2.83-2.83.06.06A1.65 1.65 0 0 0 8.92 4a1.65 1.65 0 0 0 1-1.51V2h4v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06 2.83 2.83-.06.06A1.65 1.65 0 0 0 19.4 9c.12.38.2.77.2 1.18V10h.4v4h-.4c0 .34-.07.67-.2 1Z"/>',
    'home': '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
    'layout': '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    'menu': '<path d="M4 6h16M4 12h16M4 18h16"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'plus': '<path d="M12 5v14M5 12h14"/>',
    'edit': '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
    'trash': '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6"/>',
    'x': '<path d="m6 6 12 12M18 6 6 18"/>',
    'check': '<path d="m5 12 4 4L19 6"/>',
    'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
    'alert-circle': '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>',
    'info': '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    'search': '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    'filter': '<path d="M4 5h16M7 12h10M10 19h4"/>',
    'log-out': '<path d="M10 17l5-5-5-5M15 12H3M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/>',
    'download': '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    'eye': '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
    'eye-off': '<path d="m3 3 18 18M10.7 10.7a2 2 0 0 0 2.6 2.6M9.9 4.3A10.9 10.9 0 0 1 12 4c6.5 0 10 8 10 8a18 18 0 0 1-2.2 3.2M6.6 6.6C3.6 8.5 2 12 2 12s3.5 8 10 8a10 10 0 0 0 4.1-.9"/>',
    'more': '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    'lock': '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    'mail': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    'phone': '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z"/>',
    'save': '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    'refresh': '<path d="M20 6v5h-5M4 18v-5h5"/><path d="M18.4 9A7 7 0 0 0 6.1 6.1L4 8M5.6 15A7 7 0 0 0 17.9 17.9L20 16"/>',
    'user-plus': '<path d="M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8" cy="7" r="4"/><path d="M19 8v6M16 11h6"/>',
    'sliders': '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    'ban': '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
    'megaphone': '<path d="m3 11 15-5v12L3 13Z"/><path d="M11.6 15.5 13 21H8l-1.7-6.2M18 9a3 3 0 0 1 0 6"/>',
    'activity': '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
    'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    'credit-card': '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
    'copy': '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'
  };

  function icon(name, className) {
    var paths = ICONS[name] || ICONS.info;
    return '<svg' + (className ? ' class="' + className + '"' : '') + ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  }

  function hydrateIcons(root) {
    $(root || document).find('[data-icon]').each(function () {
      var $el = $(this);
      $el.html(icon($el.attr('data-icon')));
    });
  }

  function escapeHtml(value) {
    return String(value === null || value === undefined ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initials(user) {
    if (!user) return 'BF';
    var first = (user.first_name || '').trim().charAt(0);
    var last = (user.last_name || '').trim().charAt(0);
    return (first + last).toUpperCase() || 'BF';
  }

  function todayYmd() {
    var now = new Date();
    return [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())].join('-');
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function parseYmd(value) {
    var parts = String(value).split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0);
  }

  function ymd(date) {
    return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-');
  }

  function addDays(value, days) {
    var date = typeof value === 'string' ? parseYmd(value) : new Date(value.getTime());
    date.setDate(date.getDate() + days);
    return ymd(date);
  }

  function formatDate(value, options) {
    if (!value) return '—';
    return new Intl.DateTimeFormat(
      config.DATE_LOCALE,
      options || {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    ).format(parseYmd(value));
  }

  function formatDateTime(value) {
    if (!value) return '—';

    var normalized = value.replace(' ', 'T');
    var date = new Date(normalized);

    if (isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat(config.DATE_LOCALE, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  function formatWeekRange(start, end) {
    var a = parseYmd(start);
    var b = parseYmd(end);
    var sameMonth = a.getMonth() === b.getMonth();
    var sameYear = a.getFullYear() === b.getFullYear();

    if (sameMonth && sameYear) {
      return a.getDate() + '–' + b.getDate() + ' ' +
        new Intl.DateTimeFormat(config.DATE_LOCALE, {
          month: 'long',
          year: 'numeric'
        }).format(b);
    }

    return formatDate(start, {
      day: 'numeric',
      month: 'short'
    }) + ' – ' + formatDate(end, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  function isFutureSession(date, time) {
    var d = new Date(date + 'T' + time + ':00');
    return d.getTime() > Date.now();
  }

  function toInputDateTime(value) {
    if (!value) return '';
    return value.replace(' ', 'T').slice(0, 16);
  }

  function fromInputDateTime(value) {
    return value
      ? value.replace('T', ' ') + (value.length === 16 ? ':00' : '')
      : null;
  }

  function setBusy(button, busy, label) {
    var $btn = $(button);

    $btn.prop('disabled', busy);
    $btn.find('.spinner-border').toggleClass('d-none', !busy);

    if (label) {
      $btn.find('.button-label').text(t(label));
    }
  }

  function showLoader(show) {
    $('#globalLoader').toggleClass('d-none', !show);
  }

  function toast(message, type) {
    type = type || 'info';

    var id = 'toast-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    message = t(message);

    var title =
      type === 'success'
        ? t('Done')
        : type === 'danger'
          ? t('Error')
          : 'BE-FIT';

    var html =
      '<div id="' + id + '" class="toast toast-' + type + '" role="status" aria-live="polite" aria-atomic="true">' +
        '<div class="toast-header border-0 bg-white">' +
          '<strong class="me-auto">' + escapeHtml(title) + '</strong>' +
          '<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>' +
        '</div>' +
        '<div class="toast-body pt-0">' +
          escapeHtml(message) +
        '</div>' +
      '</div>';

    $('#toastContainer').append(html);

    var el = document.getElementById(id);
    var instance = new bootstrap.Toast(el, {
      delay: 4200
    });

    el.addEventListener('hidden.bs.toast', function () {
      el.remove();
    });

    instance.show();
  }

  function emptyState(iconName, title, text, actionHtml) {
    return '' +
      '<div class="empty-state">' +
        '<div class="empty-state-icon">' +
          icon(iconName) +
        '</div>' +
        '<h3>' + escapeHtml(title) + '</h3>' +
        '<p class="mb-3">' + escapeHtml(text) + '</p>' +
        (actionHtml || '') +
      '</div>';
  }

  function pageSkeleton() {
    return '' +
      '<div class="content-grid">' +
        '<div class="skeleton" style="height:180px"></div>' +
        '<div class="skeleton" style="height:110px"></div>' +
        '<div class="skeleton" style="height:110px"></div>' +
      '</div>';
  }

  function setPageMeta(title, eyebrow) {
    $('#pageTitle').text(t(title || 'BE-FIT'));
    $('#pageEyebrow').text(t(eyebrow || ''));

    document.title =
      (title ? t(title) + ' · ' : '') +
      config.APP_NAME;
  }

  function saveUser(user) {
    state.user = user;

    if (user) {
      localStorage.setItem(
        config.USER_KEY,
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem(config.USER_KEY);
    }

    refreshUserChrome();
  }

  function refreshUserChrome() {
    if (!state.user) return;

    var name =
      state.user.display_name ||
      (
        (state.user.first_name || '') +
        ' ' +
        (state.user.last_name || '')
      ).trim();

    $('#sidebarUserName').text(name);
    $('#sidebarUserRole').text(state.user.role);
    $('#sidebarAvatar, #headerAvatar').text(initials(state.user));
  }

  function memberNav() {
    return [
      {
        route: '#/schedule',
        label: 'Schedule',
        icon: 'calendar'
      },
      {
        route: '#/bookings',
        label: 'My bookings',
        icon: 'calendar-check'
      },
      {
        route: '#/payments',
        label: 'My payments',
        icon: 'credit-card'
      },
      {
        route: '#/announcements',
        label: 'Notices',
        icon: 'megaphone'
      },
      {
        route: '#/notifications',
        label: 'Notifications',
        icon: 'bell'
      },
      {
        route: '#/profile',
        label: 'Profile',
        icon: 'user'
      }
    ];
  }

  function adminNav() {
    return [
      {
        section: 'Management'
      },
      {
        route: '#/admin/dashboard',
        label: 'Dashboard',
        icon: 'layout'
      },
      {
        route: '#/admin/schedule',
        label: 'Schedule',
        icon: 'calendar'
      },
      {
        route: '#/admin/bookings',
        label: 'Bookings',
        icon: 'calendar-check'
      },
      {
        route: '#/admin/members',
        label: 'Members',
        icon: 'users'
      },
      {
        route: '#/admin/announcements',
        label: 'Announcements',
        icon: 'megaphone'
      },
      {
        route: '#/admin/reports',
        label: 'Reports',
        icon: 'activity'
      },
      {
        route: '#/admin/settings',
        label: 'Settings',
        icon: 'settings'
      },
      {
        section: 'Member view'
      },
      {
        route: '#/schedule',
        label: 'Member schedule',
        icon: 'activity'
      },
      {
        route: '#/profile',
        label: 'My profile',
        icon: 'user'
      }
    ];
  }

  function renderNavigation() {
    var items =
      state.user && state.user.role === 'admin'
        ? adminNav()
        : memberNav();

    var desktop = '';

    items.forEach(function (item) {
      if (item.section) {
        desktop +=
          '<div class="nav-section-label">' +
            escapeHtml(item.section) +
          '</div>';
      } else {
        desktop +=
          '<a class="nav-link" href="' + item.route + '" data-nav-route="' + item.route + '">' +
            '<span class="nav-icon">' +
              icon(item.icon) +
            '</span>' +
            '<span>' +
              escapeHtml(item.label) +
            '</span>' +
          '</a>';
      }
    });

    $('#desktopNav, #mobileDrawerNav').html(desktop);

    if (I18n) {
      I18n.apply(document);
    }

    var bottomItems =
      state.user && state.user.role === 'admin'
        ? [
            {
              route: '#/admin/dashboard',
              label: 'Home',
              icon: 'home'
            },
            {
              route: '#/admin/schedule',
              label: 'Schedule',
              icon: 'calendar'
            },
            {
              route: '#/admin/bookings',
              label: 'Bookings',
              icon: 'calendar-check'
            },
            {
              route: '#/admin/members',
              label: 'Members',
              icon: 'users'
            },
            {
              route: '#/profile',
              label: 'Profile',
              icon: 'user'
            }
          ]
        : [
            {
              route: '#/schedule',
              label: 'Schedule',
              icon: 'calendar'
            },
            {
              route: '#/bookings',
              label: 'Bookings',
              icon: 'calendar-check'
            },
            {
              route: '#/payments',
              label: 'Payments',
              icon: 'credit-card'
            },
            {
              route: '#/notifications',
              label: 'Alerts',
              icon: 'bell'
            },
            {
              route: '#/profile',
              label: 'Profile',
              icon: 'user'
            }
          ];

    $('#mobileBottomNav').html(
      bottomItems.map(function (item) {
        return '' +
          '<a class="mobile-nav-link" href="' + item.route + '" data-nav-route="' + item.route + '">' +
            icon(item.icon) +
            '<span class="text-truncate w-100 text-center">' +
              escapeHtml(item.label) +
            '</span>' +
          '</a>';
      }).join('')
    );

    updateActiveNavigation();
  }

  function updateActiveNavigation() {
    var hash = window.location.hash || '';

    $('[data-nav-route]')
      .removeClass('active')
      .each(function () {
        if ($(this).attr('data-nav-route') === hash) {
          $(this).addClass('active');
        }
      });
  }

  function showLogin() {
    state.user = null;

    $('#appShell').addClass('d-none');
    $('#authView').removeClass('d-none');

    $('#loginError')
      .addClass('d-none')
      .empty();

    setTimeout(function () {
      $('#loginInput').trigger('focus');
    }, 100);

    document.title =
      'Sign in · ' +
      config.APP_NAME;
  }

  function showApp() {
    $('#authView').addClass('d-none');
    $('#appShell').removeClass('d-none');

    renderNavigation();
    refreshUserChrome();

    var hash = window.location.hash;

    if (!hash || hash === '#/' || hash === '#') {
      window.location.hash =
        state.user.must_change_password
          ? '#/profile'
          : (
              state.user.role === 'admin'
                ? '#/admin/dashboard'
                : '#/schedule'
            );
    } else {
      route();
    }
  }

  function maybeOpenResetFromHash() {
    var match =
      (window.location.hash || '')
        .match(/^#\/reset-password\?token=([a-f0-9]{64})$/i);

    if (match) {
      setTimeout(function () {
        showResetPasswordForm(match[1]);
      }, 50);

      return true;
    }

    return false;
  }

  async function boot() {
    appModal =
      new bootstrap.Modal(
        document.getElementById('appModal')
      );

    confirmModal =
      new bootstrap.Modal(
        document.getElementById('confirmModal')
      );

    hydrateIcons(document);
    bindGlobalEvents();
    registerPwa();

    var isResetLink =
      /^#\/reset-password\?token=[a-f0-9]{64}$/i
        .test(window.location.hash || '');

    if (isResetLink) {
      showLogin();
      maybeOpenResetFromHash();
      return;
    }

    var token = Api.getToken();

    if (!token) {
      showLogin();
      return;
    }

    showLoader(true);

    try {
      var response =
        await Api.get('/auth/me');

      saveUser(response.data);
      showApp();

    } catch (error) {
      Api.clearSession();
      showLogin();

    } finally {
      showLoader(false);
    }
  }

  function allowedRoute(hash) {
    if (!state.user) {
      return false;
    }

    if (
      state.user.must_change_password &&
      hash !== '#/profile'
    ) {
      return false;
    }

    if (
      hash.indexOf('#/admin/') === 0 &&
      state.user.role !== 'admin'
    ) {
      return false;
    }

    return true;
  }

  async function route() {
    if (!state.user) {
      return;
    }

    var hash =
      window.location.hash ||
      (
        state.user.role === 'admin'
          ? '#/admin/dashboard'
          : '#/schedule'
      );

    if (!allowedRoute(hash)) {
      window.location.hash =
        state.user.must_change_password
          ? '#/profile'
          : '#/schedule';

      return;
    }

    state.route = hash;
    state.routeVersion += 1;

    updateActiveNavigation();
    closeMobileDrawer();

    window.scrollTo({
      top: 0,
      behavior: 'auto'
    });

    switch (hash) {
      case '#/schedule':
        return renderSchedulePage();

      case '#/bookings':
        return renderMyBookings();

      case '#/payments':
        return renderMyPayments();

      case '#/announcements':
        return renderAnnouncementsPage();

      case '#/notifications':
        return renderNotificationsPage();

      case '#/profile':
        return renderProfilePage();

      case '#/admin/dashboard':
        return renderAdminDashboard();

      case '#/admin/schedule':
        return renderAdminSchedule();

      case '#/admin/bookings':
        return renderAdminBookings();

      case '#/admin/members':
        return renderAdminMembers();

      case '#/admin/announcements':
        return renderAdminAnnouncements();

      case '#/admin/reports':
        return renderAdminReports();

      case '#/admin/settings':
        return renderAdminSettings();

      default:
        window.location.hash =
          state.user.role === 'admin'
            ? '#/admin/dashboard'
            : '#/schedule';
    }
  }

  function closeMobileDrawer() {
    var el =
      document.getElementById('mobileMenu');

    var instance =
      bootstrap.Offcanvas.getInstance(el);

    if (instance) {
      instance.hide();
    }
  }

  var select2AssetsPromise = null;

  function loadSelect2Assets() {
    if ($.fn.select2) {
      return Promise.resolve();
    }

    if (select2AssetsPromise) {
      return select2AssetsPromise;
    }

    select2AssetsPromise = new Promise(function (resolve, reject) {
      var cssId = 'befit-select2-css';
      var scriptId = 'befit-select2-js';
      var cssUrl = 'https://cdn.jsdelivr.net/npm/select2@4.0.13/dist/css/select2.min.css';
      var scriptUrl = 'https://cdn.jsdelivr.net/npm/select2@4.0.13/dist/js/select2.min.js';

      if (!document.getElementById(cssId)) {
        var link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = cssUrl;
        document.head.appendChild(link);
      }

      var existingScript = document.getElementById(scriptId);

      if (existingScript) {
        if ($.fn.select2) {
          resolve();
          return;
        }

        existingScript.addEventListener('load', function () {
          resolve();
        }, { once: true });

        existingScript.addEventListener('error', function () {
          reject(new Error('Unable to load Select2.'));
        }, { once: true });

        return;
      }

      var script = document.createElement('script');
      script.id = scriptId;
      script.src = scriptUrl;
      script.async = true;

      script.addEventListener('load', function () {
        resolve();
      }, { once: true });

      script.addEventListener('error', function () {
        select2AssetsPromise = null;
        reject(new Error('Unable to load Select2.'));
      }, { once: true });

      document.head.appendChild(script);
    });

    return select2AssetsPromise;
  }

  function initSelect2(scope) {
    var $scope = $(scope || document);

    if (!$scope.find('select.select2').length) {
      return Promise.resolve();
    }

    return loadSelect2Assets()
      .then(function () {
        $scope
          .find('select.select2')
          .each(function () {
            var $select = $(this);

            if (
              $select.hasClass(
                'select2-hidden-accessible'
              )
            ) {
              $select.select2('destroy');
            }

            var $modal =
              $select.closest('.modal');

            var selectPlaceholder =
              $select.attr('data-placeholder');

            if (
              selectPlaceholder &&
              I18n
            ) {
              selectPlaceholder =
                I18n.t(selectPlaceholder);

              $select.attr(
                'data-placeholder',
                selectPlaceholder
              );
            }

            $select.select2({
              width: '100%',
              placeholder:
                selectPlaceholder ||
                undefined,
              allowClear:
                $select.attr('data-allow-clear') ===
                'true',
              minimumResultsForSearch:
                $select.attr('data-search') ===
                'false'
                  ? Infinity
                  : 0,
              dropdownParent:
                $modal.length
                  ? $modal
                  : $(document.body)
            });
          });
      })
      .catch(function () {
        // Native <select> controls remain fully functional if the CDN is unavailable.
      });
  }

  /* Lazy feature chunks */
  var APP_ASSET_VERSION = '14';
  var featureModules = {
    member: null,
    admin: null
  };
  var featurePromises = {};

  function featureContext() {
    return {
      Api: Api,
      config: config,
      I18n: I18n,
      state: state,
      t: t,
      icon: icon,
      hydrateIcons: hydrateIcons,
      escapeHtml: escapeHtml,
      initials: initials,
      todayYmd: todayYmd,
      pad: pad,
      parseYmd: parseYmd,
      ymd: ymd,
      addDays: addDays,
      formatDate: formatDate,
      formatDateTime: formatDateTime,
      formatWeekRange: formatWeekRange,
      isFutureSession: isFutureSession,
      toInputDateTime: toInputDateTime,
      fromInputDateTime: fromInputDateTime,
      setBusy: setBusy,
      showLoader: showLoader,
      toast: toast,
      emptyState: emptyState,
      pageSkeleton: pageSkeleton,
      setPageMeta: setPageMeta,
      saveUser: saveUser,
      refreshUserChrome: refreshUserChrome,
      closeMobileDrawer: closeMobileDrawer,
      loadSelect2Assets: loadSelect2Assets,
      initSelect2: initSelect2,
      paymentStatusBadge: paymentStatusBadge,
      announcementCard: announcementCard,
      openModal: openModal,
      confirmAction: confirmAction,
      serializeForm: serializeForm,
      generateTemporaryPassword: generateTemporaryPassword,
      route: route
    };
  }

  function loadFeatureModule(name) {
    if (featureModules[name]) {
      return Promise.resolve(featureModules[name]);
    }

    if (featurePromises[name]) {
      return featurePromises[name];
    }

    featurePromises[name] = new Promise(function (resolve, reject) {
      var factoryStore = window.BefitChunkFactories || {};

      function initialise() {
        var factories = window.BefitChunkFactories || {};
        var factory = factories[name];

        if (typeof factory !== 'function') {
          featurePromises[name] = null;
          reject(new Error('BE-FIT feature module did not register: ' + name));
          return;
        }

        try {
          featureModules[name] = factory(featureContext());
          resolve(featureModules[name]);
        } catch (error) {
          featurePromises[name] = null;
          reject(error);
        }
      }

      if (typeof factoryStore[name] === 'function') {
        initialise();
        return;
      }

      var scriptId = 'befit-feature-' + name;
      var existing = document.getElementById(scriptId);

      if (existing) {
        existing.addEventListener('load', initialise, { once: true });
        existing.addEventListener('error', function () {
          featurePromises[name] = null;
          reject(new Error('Unable to load BE-FIT feature module: ' + name));
        }, { once: true });
        return;
      }

      var script = document.createElement('script');
      script.id = scriptId;
      script.src = 'assets/js/' + name + '.js?v=' + APP_ASSET_VERSION;
      script.async = true;

      script.addEventListener('load', initialise, { once: true });
      script.addEventListener('error', function () {
        featurePromises[name] = null;
        script.remove();
        reject(new Error('Unable to load BE-FIT feature module: ' + name));
      }, { once: true });

      document.head.appendChild(script);
    });

    return featurePromises[name];
  }

  function callFeature(name, method, args) {
    if (featureModules[name] && typeof featureModules[name][method] === 'function') {
      return featureModules[name][method].apply(null, args || []);
    }

    return loadFeatureModule(name).then(function (module) {
      if (!module || typeof module[method] !== 'function') {
        throw new Error('BE-FIT feature method is unavailable: ' + name + '.' + method);
      }

      return module[method].apply(null, args || []);
    });
  }

  function renderSchedulePage(options) { return callFeature('member', 'renderSchedulePage', [options]); }
  function drawSchedule() { return callFeature('member', 'drawSchedule', []); }
  function renderMyBookings() { return callFeature('member', 'renderMyBookings', []); }
  function renderMyPayments() { return callFeature('member', 'renderMyPayments', []); }
  function renderAnnouncementsPage() { return callFeature('member', 'renderAnnouncementsPage', []); }

  function renderAdminDashboard(date) { return callFeature('admin', 'renderAdminDashboard', [date]); }
  function renderAdminMembers(query) { return callFeature('admin', 'renderAdminMembers', [query]); }
  function openUserModal(id) { return callFeature('admin', 'openUserModal', [id]); }
  function openPaymentModal(userId) { return callFeature('admin', 'openPaymentModal', [userId]); }
  function renderAdminSchedule() { return callFeature('admin', 'renderAdminSchedule', []); }
  function loadAdminScheduleTab() { return callFeature('admin', 'loadAdminScheduleTab', []); }
  function loadTemplates() { return callFeature('admin', 'loadTemplates', []); }
  function openTemplateModal(template) { return callFeature('admin', 'openTemplateModal', [template]); }
  function loadSessions() { return callFeature('admin', 'loadSessions', []); }
  function openSessionModal(session) { return callFeature('admin', 'openSessionModal', [session]); }
  function loadClosures() { return callFeature('admin', 'loadClosures', []); }
  function openClosureModal() { return callFeature('admin', 'openClosureModal', []); }
  function renderAdminBookings(query) { return callFeature('admin', 'renderAdminBookings', [query]); }
  function openAdminBookingModal() { return callFeature('admin', 'openAdminBookingModal', []); }
  function renderAdminAnnouncements() { return callFeature('admin', 'renderAdminAnnouncements', []); }
  function openAnnouncementModal(id) { return callFeature('admin', 'openAnnouncementModal', [id]); }
  function renderAdminReports(query) { return callFeature('admin', 'renderAdminReports', [query]); }
  function renderAdminSettings() { return callFeature('admin', 'renderAdminSettings', []); }

  function paymentStatusBadge(status) {
    if (status === 'paid') {
      return '<span class="badge-soft-success">' +
        t('Paid') +
        '</span>';
    }

    if (status === 'expired') {
      return '<span class="badge-soft-danger">' +
        t('Expired') +
        '</span>';
    }

    return '<span class="badge-soft-muted">' +
      t('Unpaid') +
      '</span>';
  }

  function announcementCard(item, adminActions) {
    return '' +
      '<article class="announcement-card">' +

        '<div class="d-flex align-items-start gap-3">' +

          '<div class="announcement-banner-icon">' +
            icon('megaphone') +
          '</div>' +

          '<div class="flex-grow-1 min-w-0">' +

            '<div class="d-flex align-items-start justify-content-between gap-2">' +

              '<div>' +
                '<h3>' +
                  escapeHtml(
                    item.title
                  ) +
                '</h3>' +

                (
                  adminActions
                    ? '<div class="mb-2">' +
                        (
                          item.is_active
                            ? '<span class="badge-soft-success">Active</span>'
                            : '<span class="badge-soft-muted">Inactive</span>'
                        ) +
                      '</div>'
                    : ''
                ) +

              '</div>' +

              (
                adminActions
                  ? '<div class="table-actions">' +

                      '<button class="btn btn-light table-action-btn" type="button" data-announcement-edit="' +
                        item.id +
                      '" aria-label="Edit">' +
                        icon('edit') +
                      '</button>' +

                      '<button class="btn btn-light text-danger table-action-btn" type="button" data-announcement-delete="' +
                        item.id +
                      '" aria-label="Delete">' +
                        icon('trash') +
                      '</button>' +

                    '</div>'
                  : ''
              ) +

            '</div>' +

            '<p>' +
              escapeHtml(
                item.body
              ) +
            '</p>' +

            '<div class="announcement-meta">' +

              '<span>' +
                'Starts ' +
                escapeHtml(
                  formatDateTime(
                    item.starts_at
                  )
                ) +
              '</span>' +

              (
                item.expires_at
                  ? '<span>' +
                      'Expires ' +
                      escapeHtml(
                        formatDateTime(
                          item.expires_at
                        )
                      ) +
                    '</span>'
                  : '<span>No expiry</span>'
              ) +

              (
                item.author_name
                  ? '<span>' +
                      'By ' +
                      escapeHtml(
                        item.author_name
                      ) +
                    '</span>'
                  : ''
              ) +

            '</div>' +

          '</div>' +

        '</div>' +

      '</article>';
  }

  /* Profile */
  async function renderProfilePage() {
    setPageMeta(
      'Profile',
      'Account'
    );

    $('#pageContent').html(
      pageSkeleton()
    );

    try {
      var response =
        await Api.get(
          '/profile'
        );

      saveUser(
        response.data
      );

      var user =
        response.data;

      var forcePassword =
        user.must_change_password
          ? '<div class="alert alert-warning border-0 shadow-sm">' +
              '<strong>' +
                'Change your temporary password.' +
              '</strong>' +
              '<div class="small mt-1">' +
                'Your account was created with a temporary password. You must choose a new password before using the rest of BE-FIT.' +
              '</div>' +
            '</div>'
          : '';

      var html =
        forcePassword +

        '<div class="content-grid two-column">' +

          '<div class="content-grid">' +

            '<section class="profile-hero">' +

              '<span class="avatar">' +
                escapeHtml(
                  initials(user)
                ) +
              '</span>' +

              '<div class="min-w-0">' +
                '<h2>' +
                  escapeHtml(
                    user.display_name
                  ) +
                '</h2>' +
                '<p class="text-capitalize">' +
                  escapeHtml(
                    user.role
                  ) +
                  ' account · ' +
                  escapeHtml(
                    user.status
                  ) +
                '</p>' +
              '</div>' +

            '</section>' +

            '<section class="section-card">' +

              '<div class="section-card-header">' +
                '<div>' +
                  '<h2 class="section-card-title">' +
                    'Personal information' +
                  '</h2>' +
                  '<p class="section-card-subtitle">' +
                    'Keep your contact information up to date.' +
                  '</p>' +
                '</div>' +
              '</div>' +

              '<form id="profileForm">' +

                '<div class="row g-3">' +

                  '<div class="col-sm-6">' +
                    '<label class="form-label">' +
                      'First name' +
                    '</label>' +
                    '<input name="first_name" class="form-control" value="' +
                      escapeHtml(
                        user.first_name
                      ) +
                    '" required>' +
                  '</div>' +

                  '<div class="col-sm-6">' +
                    '<label class="form-label">' +
                      'Last name' +
                    '</label>' +
                    '<input name="last_name" class="form-control" value="' +
                      escapeHtml(
                        user.last_name
                      ) +
                    '" required>' +
                  '</div>' +

                  '<div class="col-sm-6">' +
                    '<label class="form-label">' +
                      'Email' +
                    '</label>' +
                    '<input name="email" type="email" class="form-control" value="' +
                      escapeHtml(
                        user.email || ''
                      ) +
                    '">' +
                  '</div>' +

                  '<div class="col-sm-6">' +
                    '<label class="form-label">' +
                      'Phone' +
                    '</label>' +
                    '<input name="phone" class="form-control" value="' +
                      escapeHtml(
                        user.phone || ''
                      ) +
                    '">' +
                  '</div>' +

                '</div>' +

                '<div class="d-flex justify-content-end mt-3">' +
                  '<button class="btn btn-brand" type="submit">' +
                    '<span class="button-label">' +
                      'Save profile' +
                    '</span>' +
                    '<span class="spinner-border spinner-border-sm ms-2 d-none"></span>' +
                  '</button>' +
                '</div>' +

              '</form>' +

            '</section>' +

            '<section class="section-card">' +

              '<div class="section-card-header">' +
                '<div>' +
                  '<h2 class="section-card-title">' +
                    'Change password' +
                  '</h2>' +
                  '<p class="section-card-subtitle">' +
                    'Changing your password signs you out on every device.' +
                  '</p>' +
                '</div>' +
              '</div>' +

              '<form id="passwordForm">' +

                '<div class="row g-3">' +

                  '<div class="col-md-6">' +
                    '<label class="form-label">' +
                      'Current password' +
                    '</label>' +
                    '<input name="current_password" type="password" class="form-control" minlength="8" required>' +
                  '</div>' +

                  '<div class="col-md-6">' +
                    '<label class="form-label">' +
                      'New password' +
                    '</label>' +
                    '<input name="new_password" type="password" class="form-control" minlength="8" required>' +
                  '</div>' +

                '</div>' +

                '<div class="d-flex justify-content-end mt-3">' +
                  '<button class="btn btn-dark" type="submit">' +
                    '<span class="button-label">' +
                      'Change password' +
                    '</span>' +
                    '<span class="spinner-border spinner-border-sm ms-2 d-none"></span>' +
                  '</button>' +
                '</div>' +

              '</form>' +

            '</section>' +

          '</div>' +

          '<aside class="content-grid">' +

            '<section class="section-card">' +

              '<h2 class="section-card-title mb-2">' +
                'Account' +
              '</h2>' +

              '<div class="small text-muted mb-3">' +
                'Signed in as ' +
                '<strong class="text-dark">' +
                  escapeHtml(
                    user.email ||
                    user.phone ||
                    user.display_name
                  ) +
                '</strong>.' +
              '</div>' +

              '<button id="profileInstallButton" class="btn btn-soft w-100 mb-2' +
                (
                  state.deferredInstallPrompt
                    ? ''
                    : ' d-none'
                ) +
              '" type="button">' +
                icon('download') +
                ' Install BE-FIT' +
              '</button>' +

              '<button class="btn btn-outline-danger w-100" type="button" data-logout>' +
                icon('log-out') +
                ' Log out' +
              '</button>' +

            '</section>' +

            '<section class="section-card">' +

              '<div class="d-flex gap-3 align-items-start">' +

                '<div class="announcement-banner-icon">' +
                  icon('shield') +
                '</div>' +

                '<div>' +
                  '<h2 class="section-card-title mb-1">' +
                    'Secure access' +
                  '</h2>' +
                  '<p class="section-card-subtitle mb-0">' +
                    'Your session uses an authenticated Bearer token. Never share your password or access token.' +
                  '</p>' +
                '</div>' +

              '</div>' +

            '</section>' +

          '</aside>' +

        '</div>';

      $('#pageContent').html(html);

    } catch (error) {
      $('#pageContent').html(
        emptyState(
          'alert-circle',
          'Unable to load profile',
          Api.errorMessage(error)
        )
      );
    }
  }

  /* Member notifications */
  async function renderNotificationsPage() {
    setPageMeta(
      'Notifications',
      'Member'
    );

    $('#pageContent').html(
      pageSkeleton()
    );

    try {
      var response =
        await Api.get(
          '/notifications'
        );

      var data =
        response.data || {
          items: [],
          unread_count: 0
        };

      var rows =
        (
          data.items ||
          []
        ).map(
          function (notification) {
            return '' +
              '<article class="notification-card' +
                (
                  notification.read_at
                    ? ''
                    : ' unread'
                ) +
              '">' +

                '<div class="notification-icon">' +
                  icon(
                    notification.type ===
                    'waitlist_promoted'
                      ? 'check-circle'
                      : 'bell'
                  ) +
                '</div>' +

                '<div class="min-w-0 flex-grow-1">' +

                  '<div class="d-flex justify-content-between gap-2">' +

                    '<h3>' +
                      escapeHtml(
                        notification.title
                      ) +
                    '</h3>' +

                    '<small class="text-muted">' +
                      escapeHtml(
                        formatDateTime(
                          notification.created_at
                        )
                      ) +
                    '</small>' +

                  '</div>' +

                  '<p>' +
                    escapeHtml(
                      notification.body
                    ) +
                  '</p>' +

                  (
                    !notification.read_at
                      ? '<button class="btn btn-sm btn-light" type="button" data-notification-read="' +
                          notification.id +
                        '">' +
                          'Mark as read' +
                        '</button>'
                      : ''
                  ) +

                '</div>' +

              '</article>';
          }
        ).join('');

      $('#pageContent').html(
        '<div class="page-toolbar">' +

          '<div>' +
            '<h2 class="section-card-title">' +
              'Notifications' +
            '</h2>' +
            '<p class="section-card-subtitle">' +
              'Booking confirmations, reminders, waiting-list updates and schedule changes.' +
            '</p>' +
          '</div>' +

          (
            data.unread_count
              ? '<button class="btn btn-soft" type="button" data-notifications-read-all>' +
                  'Mark all read' +
                '</button>'
              : ''
          ) +

        '</div>' +

        (
          rows
            ? '<div class="notification-list">' +
                rows +
              '</div>'
            : emptyState(
                'bell',
                'All caught up',
                'You do not have any notifications yet.'
              )
        )
      );

    } catch (error) {
      $('#pageContent').html(
        emptyState(
          'alert-circle',
          'Unable to load notifications',
          Api.errorMessage(error)
        )
      );
    }
  }

  function openForgotPasswordModal() {
    openModal(
      'Forgot password',
      'Account recovery',

      '<form id="forgotPasswordForm">' +
        '<label class="form-label">' +
          'Email or phone' +
        '</label>' +
        '<input name="login" class="form-control" autocomplete="username" required>' +
        '<div class="form-text mt-2">' +
          'If the account exists, a short-lived reset token will be created. In local debug mode the token is shown here for testing.' +
        '</div>' +
      '</form>',

      '<button class="btn btn-light" data-bs-dismiss="modal" type="button">' +
        'Cancel' +
      '</button>' +

      '<button class="btn btn-brand" type="submit" form="forgotPasswordForm">' +
        '<span class="button-label">' +
          'Continue' +
        '</span>' +
        '<span class="spinner-border spinner-border-sm ms-2 d-none"></span>' +
      '</button>'
    );
  }

  function showResetPasswordForm(token) {
    openModal(
      'Choose a new password',
      'Account recovery',

      '<form id="resetPasswordForm">' +

        '<div class="mb-3">' +
          '<label class="form-label">' +
            'Reset token' +
          '</label>' +
          '<input name="token" class="form-control" value="' +
            escapeHtml(
              token || ''
            ) +
          '" required minlength="64" maxlength="64">' +
        '</div>' +

        '<div>' +
          '<label class="form-label">' +
            'New password' +
          '</label>' +
          '<input name="password" type="password" class="form-control" minlength="8" required>' +
        '</div>' +

      '</form>',

      '<button class="btn btn-light" data-bs-dismiss="modal" type="button">' +
        'Cancel' +
      '</button>' +

      '<button class="btn btn-brand" type="submit" form="resetPasswordForm">' +
        '<span class="button-label">' +
          'Reset password' +
        '</span>' +
        '<span class="spinner-border spinner-border-sm ms-2 d-none"></span>' +
      '</button>'
    );
  }

  /* Modal and confirm helpers */
  function openModal(
    title,
    eyebrow,
    body,
    footer,
    sizeClass
  ) {
    $('#appModalTitle').text(
      title
    );

    $('#appModalEyebrow').text(
      eyebrow || ''
    );

    $('#appModalBody').html(
      body || ''
    );

    $('#appModalFooter').html(
      footer || ''
    );

    $('#appModalDialog').attr(
      'class',
      'modal-dialog modal-dialog-centered modal-dialog-scrollable' +
      (
        sizeClass
          ? ' ' + sizeClass
          : ''
      )
    );

    appModal.show();

    hydrateIcons(
      '#appModal'
    );

    if (I18n) {
      I18n.apply(
        document.getElementById(
          'appModal'
        )
      );
    }
  }

  function confirmAction(
    title,
    message,
    buttonLabel,
    danger
  ) {
    $('#confirmTitle').text(
      title ||
      'Are you sure?'
    );

    $('#confirmMessage').text(
      message ||
      'This action cannot be undone.'
    );

    $('#confirmActionButton')
      .text(
        buttonLabel ||
        'Confirm'
      )
      .toggleClass(
        'btn-danger',
        danger !== false
      )
      .toggleClass(
        'btn-brand',
        danger === false
      );

    confirmModal.show();

    return new Promise(
      function (resolve) {
        state.confirmResolver =
          resolve;
      }
    );
  }

  function serializeForm($form) {
    var result = {};

    $form
      .serializeArray()
      .forEach(
        function (item) {
          result[item.name] =
            item.value;
        }
      );

    return result;
  }

  /* Global events */
  function generateTemporaryPassword(length) {
    length =
      length || 12;

    var upper =
      'ABCDEFGHJKLMNPQRSTUVWXYZ';

    var lower =
      'abcdefghijkmnopqrstuvwxyz';

    var digits =
      '23456789';

    var all =
      upper +
      lower +
      digits;

    var chars = [
      upper[
        Math.floor(
          Math.random() *
          upper.length
        )
      ],
      lower[
        Math.floor(
          Math.random() *
          lower.length
        )
      ],
      digits[
        Math.floor(
          Math.random() *
          digits.length
        )
      ]
    ];

    while (
      chars.length <
      length
    ) {
      chars.push(
        all[
          Math.floor(
            Math.random() *
            all.length
          )
        ]
      );
    }

    for (
      var i =
        chars.length - 1;
      i > 0;
      i -= 1
    ) {
      var j =
        Math.floor(
          Math.random() *
          (
            i + 1
          )
        );

      var tmp =
        chars[i];

      chars[i] =
        chars[j];

      chars[j] =
        tmp;
    }

    return chars.join('');
  }

  function bindGlobalEvents() {
    window.addEventListener(
      'hashchange',
      route
    );

    $(document).on(
      'befit:unauthorized',
      function () {
        Api.clearSession();

        state.user = null;

        toast(
          'Your session has expired. Please sign in again.',
          'danger'
        );

        showLogin();
      }
    );

    $('#loginForm').on(
      'submit',
      async function (event) {
        event.preventDefault();

        var $button =
          $('#loginButton');

        var login =
          $('#loginInput')
            .val()
            .trim();

        var password =
          $('#passwordInput')
            .val();

        $('#loginError')
          .addClass('d-none')
          .empty();

        if (
          !login ||
          !password
        ) {
          $('#loginError')
            .removeClass(
              'd-none'
            )
            .text(
              'Enter your email/phone and password.'
            );

          return;
        }

        setBusy(
          $button,
          true,
          'Signing in…'
        );

        try {
          var response =
            await Api.post(
              '/auth/login',
              {
                login: login,
                password: password
              },
              {
                auth: false
              }
            );

          Api.setToken(
            response.data.token
          );

          saveUser(
            response.data.user
          );

          $('#passwordInput').val('');

          window.location.hash =
            state.user.must_change_password
              ? '#/profile'
              : (
                  state.user.role === 'admin'
                    ? '#/admin/dashboard'
                    : '#/schedule'
                );

          showApp();

        } catch (error) {
          $('#loginError')
            .removeClass(
              'd-none'
            )
            .text(
              Api.errorMessage(
                error
              )
            );

        } finally {
          setBusy(
            $button,
            false,
            'Sign in'
          );
        }
      }
    );

    $(document).on(
      'click',
      '[data-forgot-password]',
      openForgotPasswordModal
    );

    $(document).on(
      'submit',
      '#forgotPasswordForm',
      async function (event) {
        event.preventDefault();

        var $form =
          $(this);

        var $button =
          $('#appModalFooter button[type=submit]');

        setBusy(
          $button,
          true,
          'Creating…'
        );

        try {
          var response =
            await Api.post(
              '/auth/forgot-password',
              serializeForm(
                $form
              ),
              {
                auth: false
              }
            );

          var token =
            response.data &&
            response.data.dev_reset_token
              ? response.data.dev_reset_token
              : '';

          if (token) {
            toast(
              'Local debug reset token created.',
              'success'
            );

            showResetPasswordForm(
              token
            );

          } else {
            appModal.hide();

            toast(
              'If the account exists, reset instructions have been sent or created.',
              'success'
            );
          }

        } catch (e) {
          toast(
            Api.errorMessage(e),
            'danger'
          );

        } finally {
          setBusy(
            $button,
            false,
            'Continue'
          );
        }
      }
    );

    $(document).on(
      'submit',
      '#resetPasswordForm',
      async function (event) {
        event.preventDefault();

        var $form =
          $(this);

        var $button =
          $('#appModalFooter button[type=submit]');

        setBusy(
          $button,
          true,
          'Resetting…'
        );

        try {
          await Api.post(
            '/auth/reset-password',
            serializeForm(
              $form
            ),
            {
              auth: false
            }
          );

          appModal.hide();

          window.location.hash =
            '';

          toast(
            'Password reset. You can now sign in.',
            'success'
          );

        } catch (e) {
          toast(
            Api.errorMessage(e),
            'danger'
          );

        } finally {
          setBusy(
            $button,
            false,
            'Reset password'
          );
        }
      }
    );

    $(document).on(
      'click',
      '[data-toggle-password]',
      function () {
        var selector =
          $(this).attr(
            'data-toggle-password'
          );

        var $input =
          $(selector);

        var show =
          $input.attr('type') ===
          'password';

        $input.attr(
          'type',
          show
            ? 'text'
            : 'password'
        );

        $(this).html(
          icon(
            show
              ? 'eye-off'
              : 'eye'
          )
        );
      }
    );

    $(document).on(
      'click',
      '[data-route]',
      function (event) {
        var routeValue =
          $(this).attr(
            'data-route'
          );

        if (!routeValue) {
          return;
        }

        event.preventDefault();

        window.location.hash =
          routeValue;
      }
    );

    $(document).on(
      'click',
      '[data-logout], #mobileLogoutButton',
      logout
    );

    $(document).on(
      'click',
      '#installAppButton, #profileInstallButton',
      installPwa
    );

    $(document).on(
      'click',
      '[data-retry-route]',
      route
    );

    $('#confirmActionButton').on(
      'click',
      function () {
        if (
          state.confirmResolver
        ) {
          state.confirmResolver(
            true
          );
        }

        state.confirmResolver =
          null;

        confirmModal.hide();
      }
    );

    document
      .getElementById(
        'confirmModal'
      )
      .addEventListener(
        'hidden.bs.modal',
        function () {
          if (
            state.confirmResolver
          ) {
            state.confirmResolver(
              false
            );
          }

          state.confirmResolver =
            null;
        }
      );

    $(document).on(
      'click',
      '[data-week-shift]',
      function () {
        state.weekDate =
          addDays(
            state.currentSchedule
              ? state.currentSchedule.week_start
              : state.weekDate,
            Number(
              $(this).attr(
                'data-week-shift'
              )
            )
          );

        state.selectedDate =
          null;

        renderSchedulePage();
      }
    );

    $(document).on(
      'click',
      '[data-schedule-day]',
      function () {
        state.selectedDate =
          $(this).attr(
            'data-schedule-day'
          );

        drawSchedule();
      }
    );

    $(document).on(
      'click',
      '[data-go-today]',
      function () {
        state.weekDate =
          todayYmd();

        state.selectedDate =
          todayYmd();

        renderSchedulePage();
      }
    );

    $(document).on(
      'click',
      '[data-book-session]',
      async function () {
        var sessionId =
          Number(
            $(this).attr(
              'data-book-session'
            )
          );

        if (
          !(
            await confirmAction(
              'Reserve this session?',
              'Your name will be added to this training time.',
              'Reserve place',
              false
            )
          )
        ) {
          return;
        }

        showLoader(true);

        try {
          await Api.post(
            '/bookings',
            {
              session_id:
                sessionId
            }
          );

          toast(
            'Your place has been reserved.',
            'success'
          );

          if (
            state.route ===
            '#/schedule'
          ) {
            await renderSchedulePage({
              silent: true
            });

          } else {
            await renderMyBookings();
          }

        } catch (error) {
          toast(
            Api.errorMessage(error),
            'danger'
          );

        } finally {
          showLoader(false);
        }
      }
    );

    $(document).on(
      'click',
      '[data-cancel-booking]',
      async function () {
        var id =
          Number(
            $(this).attr(
              'data-cancel-booking'
            )
          );

        if (
          !(
            await confirmAction(
              'Cancel this booking?',
              'The place will immediately become available to another member.',
              'Cancel booking',
              true
            )
          )
        ) {
          return;
        }

        showLoader(true);

        try {
          await Api.delete(
            '/bookings/' +
            id
          );

          toast(
            'Booking cancelled.',
            'success'
          );

          if (
            state.route ===
            '#/schedule'
          ) {
            await renderSchedulePage({
              silent: true
            });

          } else {
            await renderMyBookings();
          }

        } catch (error) {
          toast(
            Api.errorMessage(error),
            'danger'
          );

        } finally {
          showLoader(false);
        }
      }
    );

    $(document).on(
      'click',
      '[data-join-waitlist]',
      async function () {
        var sessionId =
          Number(
            $(this).attr(
              'data-join-waitlist'
            )
          );

        if (
          !(
            await confirmAction(
              'Join the waiting list?',
              'If automatic promotion is enabled, the first waiting member receives a cancelled place.',
              'Join waiting list',
              false
            )
          )
        ) {
          return;
        }

        showLoader(true);

        try {
          await Api.post(
            '/waitlist',
            {
              session_id:
                sessionId
            }
          );

          toast(
            'You joined the waiting list.',
            'success'
          );

          await renderSchedulePage({
            silent: true
          });

        } catch (error) {
          toast(
            Api.errorMessage(error),
            'danger'
          );

        } finally {
          showLoader(false);
        }
      }
    );

    $(document).on(
      'click',
      '[data-leave-waitlist]',
      async function () {
        var id =
          Number(
            $(this).attr(
              'data-leave-waitlist'
            )
          );

        if (
          !(
            await confirmAction(
              'Leave the waiting list?',
              'You will lose your current place in the queue.',
              'Leave waiting list',
              true
            )
          )
        ) {
          return;
        }

        showLoader(true);

        try {
          await Api.delete(
            '/waitlist/' +
            id
          );

          toast(
            'You left the waiting list.',
            'success'
          );

          await renderSchedulePage({
            silent: true
          });

        } catch (error) {
          toast(
            Api.errorMessage(error),
            'danger'
          );

        } finally {
          showLoader(false);
        }
      }
    );

    $(document).on(
      'submit',
      '#profileForm',
      async function (event) {
        event.preventDefault();

        var $form =
          $(this);

        var $button =
          $form.find(
            'button[type=submit]'
          );

        setBusy(
          $button,
          true,
          'Saving…'
        );

        try {
          var response =
            await Api.put(
              '/profile',
              serializeForm(
                $form
              )
            );

          saveUser(
            response.data
          );

          toast(
            'Profile updated.',
            'success'
          );

        } catch (error) {
          toast(
            Api.errorMessage(error),
            'danger'
          );

        } finally {
          setBusy(
            $button,
            false,
            'Save profile'
          );
        }
      }
    );

    $(document).on(
      'submit',
      '#passwordForm',
      async function (event) {
        event.preventDefault();

        var $form =
          $(this);

        var $button =
          $form.find(
            'button[type=submit]'
          );

        setBusy(
          $button,
          true,
          'Changing…'
        );

        try {
          await Api.put(
            '/profile/password',
            serializeForm(
              $form
            )
          );

          Api.clearSession();

          state.user =
            null;

          appModal.hide();

          toast(
            'Password changed. Sign in again with your new password.',
            'success'
          );

          showLogin();

        } catch (error) {
          toast(
            Api.errorMessage(error),
            'danger'
          );

        } finally {
          setBusy(
            $button,
            false,
            'Change password'
          );
        }
      }
    );

    $(document).on(
      'change',
      '#dashboardDate',
      function () {
        renderAdminDashboard(
          $(this).val()
        );
      }
    );

    $(document).on(
      'submit',
      '#reportRangeForm',
      function (event) {
        event.preventDefault();

        renderAdminReports(
          serializeForm(
            $(this)
          )
        );
      }
    );

    $(document).on(
      'submit',
      '#memberFilters',
      function (event) {
        event.preventDefault();

        var query =
          serializeForm(
            $(this)
          );

        query.page = 1;
        query.per_page = 25;

        renderAdminMembers(
          query
        );
      }
    );

    $(document).on(
      'click',
      '[data-page-scope="users"]',
      function () {
        var query =
          serializeForm(
            $('#memberFilters')
          );

        query.page =
          Number(
            $(this).attr(
              'data-page'
            )
          );

        query.per_page =
          25;

        renderAdminMembers(
          query
        );
      }
    );

    $(document).on(
      'click',
      '[data-admin-new-user]',
      function () {
        openUserModal();
      }
    );

    $(document).on(
      'click',
      '[data-user-edit]',
      function () {
        openUserModal(
          Number(
            $(this).attr(
              'data-user-edit'
            )
          )
        );
      }
    );

    $(document).on(
      'click',
      '[data-user-payment]',
      function () {
        openPaymentModal(
          Number(
            $(this).attr(
              'data-user-payment'
            )
          )
        );
      }
    );

    $(document).on(
      'click',
      '[data-generate-password]',
      function () {
        var value =
          generateTemporaryPassword(
            12
          );

        $('#userModalForm [name=password]')
          .val(value)
          .trigger(
            'focus'
          );

        toast(
          t(
            'Password generated.'
          ),
          'success'
        );
      }
    );

    $(document).on(
      'click',
      '[data-copy-password]',
      async function () {
        var $input =
          $('#userModalForm [name=password]');

        var value =
          $input.val();

        if (!value) {
          value =
            generateTemporaryPassword(
              12
            );

          $input.val(
            value
          );
        }

        try {
          if (
            navigator.clipboard &&
            window.isSecureContext
          ) {
            await navigator.clipboard.writeText(
              value
            );

          } else {
            $input.trigger(
              'select'
            );

            document.execCommand(
              'copy'
            );
          }

          toast(
            t(
              'Password copied.'
            ),
            'success'
          );

        } catch (e) {
          toast(
            t(
              'Could not copy automatically. Select and copy the password manually.'
            ),
            'info'
          );
        }
      }
    );

    $(document).on(
      'submit',
      '#userModalForm',
      async function (event) {
        event.preventDefault();

        var $form =
          $(this);

        var id =
          Number(
            $form.attr(
              'data-user-id'
            )
          ) ||
          null;

        var data =
          serializeForm(
            $form
          );

        var $button =
          $('#appModalFooter button[type=submit]');

        if (!data.email) {
          data.email = null;
        }

        if (!data.phone) {
          data.phone = null;
        }

        if (
          id &&
          !data.password
        ) {
          delete data.password;
        }

        data.must_change_password =
          $form
            .find(
              '[name=must_change_password]'
            )
            .is(
              ':checked'
            );

        setBusy(
          $button,
          true,
          'Saving…'
        );

        try {
          if (id) {
            await Api.put(
              '/admin/users/' +
              id,
              data
            );

          } else {
            await Api.post(
              '/admin/users',
              data
            );
          }

          appModal.hide();

          toast(
            id
              ? 'Member updated.'
              : 'Member created.',
            'success'
          );

          if (
            state.route ===
            '#/admin/members'
          ) {
            renderAdminMembers({
              page: 1,
              per_page: 25
            });

          } else if (
            state.route ===
            '#/admin/dashboard'
          ) {
            renderAdminDashboard();
          }

        } catch (error) {
          toast(
            Api.errorMessage(error),
            'danger'
          );

        } finally {
          setBusy(
            $button,
            false,
            id
              ? 'Save changes'
              : 'Create member'
          );
        }
      }
    );

    $(document).on(
      'submit',
      '#paymentModalForm',
      async function (event) {
        event.preventDefault();

        var $form =
          $(this);

        var userId =
          Number(
            $form.attr(
              'data-user-id'
            )
          );

        var data =
          serializeForm(
            $form
          );

        var $button =
          $('#appModalFooter button[type=submit]');

        setBusy(
          $button,
          true,
          t('Saving…')
        );

        try {
          await Api.post(
            '/admin/users/' +
            userId +
            '/payments',
            data
          );

          appModal.hide();

          toast(
            t(
              'Payment recorded successfully.'
            ),
            'success'
          );

          if (
            state.route ===
            '#/admin/members'
          ) {
            renderAdminMembers(
              serializeForm(
                $('#memberFilters')
              )
            );
          }

        } catch (e) {
          toast(
            Api.errorMessage(e),
            'danger'
          );

        } finally {
          setBusy(
            $button,
            false,
            t(
              'Save payment'
            )
          );
        }
      }
    );

    $(document).on(
      'click',
      '[data-admin-schedule-tab]',
      function () {
        state.adminScheduleTab =
          $(this).attr(
            'data-admin-schedule-tab'
          );

        loadAdminScheduleTab();
      }
    );

    $(document).on(
      'click',
      '[data-template-new]',
      function () {
        openTemplateModal();
      }
    );

    $(document).on(
      'click',
      '[data-template-edit]',
      function () {
        openTemplateModal(
          JSON.parse(
            decodeURIComponent(
              $(this).attr(
                'data-template-json'
              )
            )
          )
        );
      }
    );

    $(document).on(
      'submit',
      '#templateModalForm',
      async function (event) {
        event.preventDefault();

        var $form =
          $(this);

        var id =
          Number(
            $form.attr(
              'data-template-id'
            )
          ) ||
          null;

        var data =
          serializeForm(
            $form
          );

        var $button =
          $('#appModalFooter button[type=submit]');

        data.weekday =
          Number(
            data.weekday
          );

        data.capacity =
          Number(
            data.capacity
          );

        data.is_active =
          $form
            .find(
              '[name=is_active]'
            )
            .is(
              ':checked'
            );

        if (
          !data.end_time
        ) {
          data.end_time =
            null;
        }

        setBusy(
          $button,
          true,
          'Saving…'
        );

        try {
          if (id) {
            await Api.put(
              '/admin/schedule/templates/' +
              id,
              data
            );

          } else {
            await Api.post(
              '/admin/schedule/templates',
              data
            );
          }

          appModal.hide();

          toast(
            'Time slot saved.',
            'success'
          );

          loadTemplates();

        } catch (error) {
          toast(
            Api.errorMessage(error),
            'danger'
          );

        } finally {
          setBusy(
            $button,
            false,
            'Save time slot'
          );
        }
      }
    );

    $(document).on(
      'click',
      '[data-template-delete]',
      async function () {
        var id =
          Number(
            $(this).attr(
              'data-template-delete'
            )
          );

        if (
          !(
            await confirmAction(
              'Deactivate time slot?',
              'Future weeks will no longer create this recurring session. Existing dated sessions are not deleted.',
              'Deactivate',
              true
            )
          )
        ) {
          return;
        }

        try {
          await Api.delete(
            '/admin/schedule/templates/' +
            id
          );

          toast(
            'Time slot deactivated.',
            'success'
          );

          loadTemplates();

        } catch (e) {
          toast(
            Api.errorMessage(e),
            'danger'
          );
        }
      }
    );

    $(document).on(
      'submit',
      '#sessionRangeForm, #closureRangeForm',
      function (event) {
        event.preventDefault();

        var query =
          serializeForm(
            $(this)
          );

        state.adminScheduleRange = {
          from: query.from,
          to: query.to
        };

        loadAdminScheduleTab();
      }
    );

    $(document).on(
      'click',
      '[data-session-new]',
      function () {
        openSessionModal();
      }
    );

    $(document).on(
      'click',
      '[data-session-edit]',
      function () {
        openSessionModal(
          JSON.parse(
            decodeURIComponent(
              $(this).attr(
                'data-session-json'
              )
            )
          )
        );
      }
    );

    $(document).on(
      'submit',
      '#sessionModalForm',
      async function (event) {
        event.preventDefault();

        var $form =
          $(this);

        var id =
          Number(
            $form.attr(
              'data-session-id'
            )
          ) ||
          null;

        var data =
          serializeForm(
            $form
          );

        var $button =
          $('#appModalFooter button[type=submit]');

        data.capacity =
          Number(
            data.capacity
          );

        if (
          !data.end_time
        ) {
          data.end_time =
            null;
        }

        if (
          !data.note
        ) {
          data.note =
            null;
        }

        setBusy(
          $button,
          true,
          'Saving…'
        );

        try {
          if (id) {
            await Api.put(
              '/admin/schedule/sessions/' +
              id,
              data
            );

          } else {
            await Api.post(
              '/admin/schedule/sessions',
              data
            );
          }

          appModal.hide();

          toast(
            'Session saved.',
            'success'
          );

          loadSessions();

        } catch (error) {
          toast(
            Api.errorMessage(error),
            'danger'
          );

        } finally {
          setBusy(
            $button,
            false,
            'Save session'
          );
        }
      }
    );

    $(document).on(
      'click',
      '[data-closure-new]',
      openClosureModal
    );

    $(document).on(
      'submit',
      '#closureModalForm',
      async function (event) {
        event.preventDefault();

        var $form =
          $(this);

        var data =
          serializeForm(
            $form
          );

        var $button =
          $('#appModalFooter button[type=submit]');

        if (
          !data.reason
        ) {
          data.reason =
            null;
        }

        setBusy(
          $button,
          true,
          'Closing…'
        );

        try {
          await Api.post(
            '/admin/schedule/closures',
            data
          );

          appModal.hide();

          toast(
            'Date marked as closed.',
            'success'
          );

          loadClosures();

        } catch (e) {
          toast(
            Api.errorMessage(e),
            'danger'
          );

        } finally {
          setBusy(
            $button,
            false,
            'Close date'
          );
        }
      }
    );

    $(document).on(
      'click',
      '[data-closure-delete]',
      async function () {
        var id =
          Number(
            $(this).attr(
              'data-closure-delete'
            )
          );

        if (
          !(
            await confirmAction(
              'Reopen this date?',
              'Removing the closure makes its sessions available again according to their individual status.',
              'Remove closure',
              true
            )
          )
        ) {
          return;
        }

        try {
          await Api.delete(
            '/admin/schedule/closures/' +
            id
          );

          toast(
            'Closure removed.',
            'success'
          );

          loadClosures();

        } catch (e) {
          toast(
            Api.errorMessage(e),
            'danger'
          );
        }
      }
    );

    $(document).on(
      'submit',
      '#adminBookingFilters',
      function (event) {
        event.preventDefault();

        var query =
          serializeForm(
            $(this)
          );

        query.page = 1;
        query.per_page = 25;

        renderAdminBookings(
          query
        );
      }
    );

    $(document).on(
      'click',
      '[data-page-scope="bookings"]',
      function () {
        var query =
          serializeForm(
            $('#adminBookingFilters')
          );

        query.page =
          Number(
            $(this).attr(
              'data-page'
            )
          );

        query.per_page =
          25;

        renderAdminBookings(
          query
        );
      }
    );

    $(document).on(
      'click',
      '[data-admin-new-booking]',
      openAdminBookingModal
    );

    $(document).on(
      'submit',
      '#adminBookingModalForm',
      async function (event) {
        event.preventDefault();

        var $form =
          $(this);

        var data =
          serializeForm(
            $form
          );

        var $button =
          $('#appModalFooter button[type=submit]');

        data.user_id =
          Number(
            data.user_id
          );

        data.session_id =
          Number(
            data.session_id
          );

        setBusy(
          $button,
          true,
          'Creating…'
        );

        try {
          await Api.post(
            '/admin/bookings',
            data
          );

          appModal.hide();

          toast(
            'Booking created.',
            'success'
          );

          if (
            state.route ===
            '#/admin/bookings'
          ) {
            renderAdminBookings();

          } else if (
            state.route ===
            '#/admin/dashboard'
          ) {
            renderAdminDashboard();
          }

        } catch (e) {
          toast(
            Api.errorMessage(e),
            'danger'
          );

        } finally {
          setBusy(
            $button,
            false,
            'Create booking'
          );
        }
      }
    );

    $(document).on(
      'click',
      '[data-admin-booking-cancel]',
      async function () {
        var id =
          Number(
            $(this).attr(
              'data-admin-booking-cancel'
            )
          );

        if (
          !(
            await confirmAction(
              'Cancel this member booking?',
              'The reservation will be marked cancelled and the place becomes available.',
              'Cancel booking',
              true
            )
          )
        ) {
          return;
        }

        try {
          await Api.delete(
            '/admin/bookings/' +
            id
          );

          toast(
            'Booking cancelled.',
            'success'
          );

          renderAdminBookings();

        } catch (e) {
          toast(
            Api.errorMessage(e),
            'danger'
          );
        }
      }
    );

    $(document).on(
      'change',
      '[data-admin-attendance-id]',
      async function () {
        var $select =
          $(this);

        var id =
          Number(
            $select.attr(
              'data-admin-attendance-id'
            )
          );

        var status =
          $select.val();

        $select.prop(
          'disabled',
          true
        );

        try {
          await Api.patch(
            '/admin/bookings/' +
            id +
            '/attendance',
            {
              status: status
            }
          );

          toast(
            'Attendance updated.',
            'success'
          );

          renderAdminBookings(
            serializeForm(
              $('#adminBookingFilters')
            )
          );

        } catch (e) {
          toast(
            Api.errorMessage(e),
            'danger'
          );

          renderAdminBookings(
            serializeForm(
              $('#adminBookingFilters')
            )
          );
        }
      }
    );

    $(document).on(
      'click',
      '[data-notification-read]',
      async function () {
        try {
          await Api.patch(
            '/notifications/' +
            Number(
              $(this).attr(
                'data-notification-read'
              )
            ) +
            '/read',
            {}
          );

          renderNotificationsPage();

        } catch (e) {
          toast(
            Api.errorMessage(e),
            'danger'
          );
        }
      }
    );

    $(document).on(
      'click',
      '[data-notifications-read-all]',
      async function () {
        try {
          await Api.patch(
            '/notifications/read-all',
            {}
          );

          renderNotificationsPage();

        } catch (e) {
          toast(
            Api.errorMessage(e),
            'danger'
          );
        }
      }
    );

    $(document).on(
      'click',
      '[data-announcement-new]',
      function () {
        openAnnouncementModal();
      }
    );

    $(document).on(
      'click',
      '[data-announcement-edit]',
      function () {
        openAnnouncementModal(
          Number(
            $(this).attr(
              'data-announcement-edit'
            )
          )
        );
      }
    );

    $(document).on(
      'submit',
      '#announcementModalForm',
      async function (event) {
        event.preventDefault();

        var $form =
          $(this);

        var id =
          Number(
            $form.attr(
              'data-announcement-id'
            )
          ) ||
          null;

        var data =
          serializeForm(
            $form
          );

        var $button =
          $('#appModalFooter button[type=submit]');

        data.is_active =
          $form
            .find(
              '[name=is_active]'
            )
            .is(
              ':checked'
            );

        if (
          data.starts_at
        ) {
          data.starts_at =
            fromInputDateTime(
              data.starts_at
            );

        } else {
          delete data.starts_at;
        }

        if (
          data.expires_at
        ) {
          data.expires_at =
            fromInputDateTime(
              data.expires_at
            );

        } else {
          data.expires_at =
            null;
        }

        setBusy(
          $button,
          true,
          'Saving…'
        );

        try {
          if (id) {
            await Api.put(
              '/admin/announcements/' +
              id,
              data
            );

          } else {
            await Api.post(
              '/admin/announcements',
              data
            );
          }

          appModal.hide();

          toast(
            'Announcement saved.',
            'success'
          );

          renderAdminAnnouncements();

        } catch (e) {
          toast(
            Api.errorMessage(e),
            'danger'
          );

        } finally {
          setBusy(
            $button,
            false,
            'Save announcement'
          );
        }
      }
    );

    $(document).on(
      'click',
      '[data-announcement-delete]',
      async function () {
        var id =
          Number(
            $(this).attr(
              'data-announcement-delete'
            )
          );

        if (
          !(
            await confirmAction(
              'Delete announcement?',
              'Members will no longer see this notice.',
              'Delete',
              true
            )
          )
        ) {
          return;
        }

        try {
          await Api.delete(
            '/admin/announcements/' +
            id
          );

          toast(
            'Announcement deleted.',
            'success'
          );

          renderAdminAnnouncements();

        } catch (e) {
          toast(
            Api.errorMessage(e),
            'danger'
          );
        }
      }
    );

    $(document).on(
      'submit',
      '#settingsForm',
      async function (event) {
        event.preventDefault();

        var $form =
          $(this);

        var data =
          serializeForm(
            $form
          );

        var $button =
          $form.find(
            'button[type=submit]'
          );

        var numericSettings = [
          'default_capacity',
          'booking_days_ahead',
          'booking_cutoff_minutes',
          'cancellation_cutoff_minutes',
          'payment_reminder_days_before_expiry'
        ];

        numericSettings.forEach(
          function (key) {
            data[key] =
              Number(
                data[key]
              );
          }
        );

        data.show_attendee_names =
          $form
            .find(
              '[name="show_attendee_names"]'
            )
            .is(
              ':checked'
            );

        data.waitlist_enabled =
          $form
            .find(
              '[name="waitlist_enabled"]'
            )
            .is(
              ':checked'
            );

        data.auto_promote_waitlist =
          $form
            .find(
              '[name="auto_promote_waitlist"]'
            )
            .is(
              ':checked'
            );

        setBusy(
          $button,
          true,
          'Saving…'
        );

        try {
          var response =
            await Api.put(
              '/admin/settings',
              data
            );

          state.settings =
            response.data;

          $('#sidebarGymName, #mobileGymName').text(
            state.settings.gym_name
          );

          toast(
            'Settings updated.',
            'success'
          );

        } catch (error) {
          toast(
            Api.errorMessage(error),
            'danger'
          );

        } finally {
          setBusy(
            $button,
            false,
            'Save settings'
          );
        }
      }
    );
  }

  async function logout() {
    if (
      !Api.getToken()
    ) {
      showLogin();
      return;
    }

    showLoader(true);

    try {
      await Api.post(
        '/auth/logout',
        {}
      );

    } catch (e) {
      /* local session is still cleared */

    } finally {
      Api.clearSession();

      state.user =
        null;

      state.currentSchedule =
        null;

      state.weekDate =
        null;

      state.selectedDate =
        null;

      window.location.hash =
        '';

      closeMobileDrawer();

      showLoader(false);

      showLogin();
    }
  }

  function registerPwa() {
    if (
      'serviceWorker' in
      navigator
    ) {
      window.addEventListener(
        'load',
        function () {
          navigator.serviceWorker
            .register(
              './service-worker.js',
              {
                updateViaCache: 'none'
              }
            )
            .catch(
              function () {
                /* HTTP .test local development may not support service workers */
              }
            );
        }
      );
    }

    window.addEventListener(
      'beforeinstallprompt',
      function (event) {
        event.preventDefault();

        state.deferredInstallPrompt =
          event;

        $('#installAppButton, #profileInstallButton')
          .removeClass(
            'd-none'
          );
      }
    );

    window.addEventListener(
      'appinstalled',
      function () {
        state.deferredInstallPrompt =
          null;

        $('#installAppButton, #profileInstallButton')
          .addClass(
            'd-none'
          );

        toast(
          'BE-FIT was installed successfully.',
          'success'
        );
      }
    );
  }

  async function installPwa() {
    if (
      !state.deferredInstallPrompt
    ) {
      toast(
        'Installation becomes available when the app is served over HTTPS and your browser supports PWA installation.',
        'info'
      );

      return;
    }

    state.deferredInstallPrompt.prompt();

    await state.deferredInstallPrompt.userChoice;

    state.deferredInstallPrompt =
      null;

    $('#installAppButton, #profileInstallButton')
      .addClass(
        'd-none'
      );
  }

  $(boot);

})(window, document, jQuery);