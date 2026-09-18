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

  function pad(value) { return String(value).padStart(2, '0'); }

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
    return new Intl.DateTimeFormat(config.DATE_LOCALE, options || { day: 'numeric', month: 'short', year: 'numeric' }).format(parseYmd(value));
  }

  function formatDateTime(value) {
    if (!value) return '—';
    var normalized = value.replace(' ', 'T');
    var date = new Date(normalized);
    if (isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(config.DATE_LOCALE, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  }

  function formatWeekRange(start, end) {
    var a = parseYmd(start);
    var b = parseYmd(end);
    var sameMonth = a.getMonth() === b.getMonth();
    var sameYear = a.getFullYear() === b.getFullYear();
    if (sameMonth && sameYear) {
      return a.getDate() + '–' + b.getDate() + ' ' + new Intl.DateTimeFormat(config.DATE_LOCALE, { month: 'long', year: 'numeric' }).format(b);
    }
    return formatDate(start, { day: 'numeric', month: 'short' }) + ' – ' + formatDate(end, { day: 'numeric', month: 'short', year: 'numeric' });
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
    return value ? value.replace('T', ' ') + (value.length === 16 ? ':00' : '') : null;
  }

  function setBusy(button, busy, label) {
    var $btn = $(button);
    $btn.prop('disabled', busy);
    $btn.find('.spinner-border').toggleClass('d-none', !busy);
    if (label) $btn.find('.button-label').text(t(label));
  }

  function showLoader(show) {
    $('#globalLoader').toggleClass('d-none', !show);
  }

  function toast(message, type) {
    type = type || 'info';
    var id = 'toast-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    message = t(message);
    var title = type === 'success' ? t('Done') : type === 'danger' ? t('Error') : 'BE-FIT';
    var html = '<div id="' + id + '" class="toast toast-' + type + '" role="status" aria-live="polite" aria-atomic="true">' +
      '<div class="toast-header border-0 bg-white"><strong class="me-auto">' + escapeHtml(title) + '</strong><button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button></div>' +
      '<div class="toast-body pt-0">' + escapeHtml(message) + '</div></div>';
    $('#toastContainer').append(html);
    var el = document.getElementById(id);
    var instance = new bootstrap.Toast(el, { delay: 4200 });
    el.addEventListener('hidden.bs.toast', function () { el.remove(); });
    instance.show();
  }

  function emptyState(iconName, title, text, actionHtml) {
    return '<div class="empty-state"><div class="empty-state-icon">' + icon(iconName) + '</div><h3>' + escapeHtml(title) + '</h3><p class="mb-3">' + escapeHtml(text) + '</p>' + (actionHtml || '') + '</div>';
  }

  function pageSkeleton() {
    return '<div class="content-grid"><div class="skeleton" style="height:180px"></div><div class="skeleton" style="height:110px"></div><div class="skeleton" style="height:110px"></div></div>';
  }

  function setPageMeta(title, eyebrow) {
    $('#pageTitle').text(t(title || 'BE-FIT'));
    $('#pageEyebrow').text(t(eyebrow || ''));
    document.title = (title ? t(title) + ' · ' : '') + config.APP_NAME;
  }

  function saveUser(user) {
    state.user = user;
    if (user) localStorage.setItem(config.USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(config.USER_KEY);
    refreshUserChrome();
  }

  function refreshUserChrome() {
    if (!state.user) return;
    var name = state.user.display_name || ((state.user.first_name || '') + ' ' + (state.user.last_name || '')).trim();
    $('#sidebarUserName').text(name);
    $('#sidebarUserRole').text(state.user.role);
    $('#sidebarAvatar, #headerAvatar').text(initials(state.user));
  }

  function memberNav() {
    return [
      { route: '#/schedule', label: 'Schedule', icon: 'calendar' },
      { route: '#/bookings', label: 'My bookings', icon: 'calendar-check' },
      { route: '#/payments', label: 'My payments', icon: 'credit-card' },
      { route: '#/announcements', label: 'Notices', icon: 'megaphone' },
      { route: '#/notifications', label: 'Notifications', icon: 'bell' },
      { route: '#/profile', label: 'Profile', icon: 'user' }
    ];
  }

  function adminNav() {
    return [
      { section: 'Management' },
      { route: '#/admin/dashboard', label: 'Dashboard', icon: 'layout' },
      { route: '#/admin/schedule', label: 'Schedule', icon: 'calendar' },
      { route: '#/admin/bookings', label: 'Bookings', icon: 'calendar-check' },
      { route: '#/admin/members', label: 'Members', icon: 'users' },
      { route: '#/admin/announcements', label: 'Announcements', icon: 'megaphone' },
      { route: '#/admin/reports', label: 'Reports', icon: 'activity' },
      { route: '#/admin/settings', label: 'Settings', icon: 'settings' },
      { section: 'Member view' },
      { route: '#/schedule', label: 'Member schedule', icon: 'activity' },
      { route: '#/profile', label: 'My profile', icon: 'user' }
    ];
  }

  function renderNavigation() {
    var items = state.user && state.user.role === 'admin' ? adminNav() : memberNav();
    var desktop = '';
    items.forEach(function (item) {
      if (item.section) {
        desktop += '<div class="nav-section-label">' + escapeHtml(item.section) + '</div>';
      } else {
        desktop += '<a class="nav-link" href="' + item.route + '" data-nav-route="' + item.route + '"><span class="nav-icon">' + icon(item.icon) + '</span><span>' + escapeHtml(item.label) + '</span></a>';
      }
    });
    $('#desktopNav, #mobileDrawerNav').html(desktop);
    if (I18n) I18n.apply(document);

    var bottomItems = state.user && state.user.role === 'admin'
      ? [
          { route: '#/admin/dashboard', label: 'Home', icon: 'home' },
          { route: '#/admin/schedule', label: 'Schedule', icon: 'calendar' },
          { route: '#/admin/bookings', label: 'Bookings', icon: 'calendar-check' },
          { route: '#/admin/members', label: 'Members', icon: 'users' },
          { route: '#/profile', label: 'Profile', icon: 'user' }
        ]
      : [
          { route: '#/schedule', label: 'Schedule', icon: 'calendar' },
          { route: '#/bookings', label: 'Bookings', icon: 'calendar-check' },
          { route: '#/payments', label: 'Payments', icon: 'credit-card' },
          { route: '#/notifications', label: 'Alerts', icon: 'bell' },
          { route: '#/profile', label: 'Profile', icon: 'user' }
        ];

    $('#mobileBottomNav').html(bottomItems.map(function (item) {
      return '<a class="mobile-nav-link" href="' + item.route + '" data-nav-route="' + item.route + '">' + icon(item.icon) + '<span class="text-truncate w-100 text-center">' + escapeHtml(item.label) + '</span></a>';
    }).join(''));
    updateActiveNavigation();
  }

  function updateActiveNavigation() {
    var hash = window.location.hash || '';
    $('[data-nav-route]').removeClass('active').each(function () {
      if ($(this).attr('data-nav-route') === hash) $(this).addClass('active');
    });
  }

  function showLogin() {
    state.user = null;
    $('#appShell').addClass('d-none');
    $('#authView').removeClass('d-none');
    $('#loginError').addClass('d-none').empty();
    setTimeout(function () { $('#loginInput').trigger('focus'); }, 100);
    document.title = 'Sign in · ' + config.APP_NAME;
  }

  function showApp() {
    $('#authView').addClass('d-none');
    $('#appShell').removeClass('d-none');
    renderNavigation();
    refreshUserChrome();

    var hash = window.location.hash;
    if (!hash || hash === '#/' || hash === '#') {
      window.location.hash = state.user.must_change_password ? '#/profile' : (state.user.role === 'admin' ? '#/admin/dashboard' : '#/schedule');
    } else {
      route();
    }
  }

  function maybeOpenResetFromHash() {
    var match = (window.location.hash || '').match(/^#\/reset-password\?token=([a-f0-9]{64})$/i);
    if (match) {
      setTimeout(function () { showResetPasswordForm(match[1]); }, 50);
      return true;
    }
    return false;
  }

  async function boot() {
    appModal = new bootstrap.Modal(document.getElementById('appModal'));
    confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    hydrateIcons(document);
    bindGlobalEvents();
    registerPwa();

    var isResetLink = /^#\/reset-password\?token=[a-f0-9]{64}$/i.test(window.location.hash || '');
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
      var response = await Api.get('/auth/me');
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
    if (!state.user) return false;
    if (state.user.must_change_password && hash !== '#/profile') return false;
    if (hash.indexOf('#/admin/') === 0 && state.user.role !== 'admin') return false;
    return true;
  }

  async function route() {
    if (!state.user) return;
    var hash = window.location.hash || (state.user.role === 'admin' ? '#/admin/dashboard' : '#/schedule');
    if (!allowedRoute(hash)) {
      window.location.hash = state.user.must_change_password ? '#/profile' : '#/schedule';
      return;
    }

    state.route = hash;
    state.routeVersion += 1;
    updateActiveNavigation();
    closeMobileDrawer();
    window.scrollTo({ top: 0, behavior: 'auto' });

    switch (hash) {
      case '#/schedule': return renderSchedulePage();
      case '#/bookings': return renderMyBookings();
      case '#/payments': return renderMyPayments();
      case '#/announcements': return renderAnnouncementsPage();
      case '#/notifications': return renderNotificationsPage();
      case '#/profile': return renderProfilePage();
      case '#/admin/dashboard': return renderAdminDashboard();
      case '#/admin/schedule': return renderAdminSchedule();
      case '#/admin/bookings': return renderAdminBookings();
      case '#/admin/members': return renderAdminMembers();
      case '#/admin/announcements': return renderAdminAnnouncements();
      case '#/admin/reports': return renderAdminReports();
      case '#/admin/settings': return renderAdminSettings();
      default:
        window.location.hash = state.user.role === 'admin' ? '#/admin/dashboard' : '#/schedule';
    }
  }

  function closeMobileDrawer() {
    var el = document.getElementById('mobileMenu');
    var instance = bootstrap.Offcanvas.getInstance(el);
    if (instance) instance.hide();
  }

  function initSelect2(scope) {
    if (!$.fn.select2) return;
    $(scope || document).find('select.select2').each(function () {
      var $select = $(this);
      if ($select.hasClass('select2-hidden-accessible')) {
        $select.select2('destroy');
      }
      var $modal = $select.closest('.modal');
      $select.select2({
        width: '100%',
        placeholder: $select.attr('data-placeholder') || undefined,
        allowClear: $select.attr('data-allow-clear') === 'true',
        minimumResultsForSearch: $select.attr('data-search') === 'false' ? Infinity : 0,
        dropdownParent: $modal.length ? $modal : $(document.body)
      });
    });
  }

  /* Member schedule */
  async function renderSchedulePage(options) {
    options = options || {};
    setPageMeta('Schedule', 'Member');
    if (!state.weekDate) state.weekDate = todayYmd();
    if (!options.silent) $('#pageContent').html(pageSkeleton());

    var version = state.routeVersion;
    try {
      var results = await Promise.all([
        Api.get('/schedule/week', { date: state.weekDate }),
        Api.get('/announcements')
      ]);
      if (version !== state.routeVersion || state.route !== '#/schedule') return;
      state.currentSchedule = results[0].data;
      state.announcements = results[1].data || [];
      state.weekDate = state.currentSchedule.week_start;

      var availableDates = state.currentSchedule.days.map(function (d) { return d.date; });
      if (!state.selectedDate || availableDates.indexOf(state.selectedDate) === -1) {
        state.selectedDate = availableDates.indexOf(todayYmd()) !== -1 ? todayYmd() : state.currentSchedule.week_start;
      }
      drawSchedule();
    } catch (error) {
      $('#pageContent').html(emptyState('alert-circle', 'Unable to load schedule', Api.errorMessage(error), '<button class="btn btn-brand" data-retry-route type="button">Try again</button>'));
    }
  }

  function drawSchedule() {
    var schedule = state.currentSchedule;
    if (!schedule) return;
    var selected = schedule.days.find(function (day) { return day.date === state.selectedDate; }) || schedule.days[0];
    var announcement = state.announcements && state.announcements.length ? state.announcements[0] : null;

    var daysHtml = schedule.days.map(function (day) {
      var d = parseYmd(day.date);
      var active = day.date === selected.date ? ' active' : '';
      var closed = day.is_closed ? ' closed' : '';
      return '<button type="button" class="day-button' + active + closed + '" data-schedule-day="' + day.date + '">' +
        '<span class="day-name">' + escapeHtml(new Intl.DateTimeFormat(config.DATE_LOCALE, { weekday: 'short' }).format(d)) + '</span>' +
        '<span class="day-number">' + d.getDate() + '</span>' +
        '<span class="day-dot"></span></button>';
    }).join('');

    var sessionsHtml = '';
    if (selected.is_closed) {
      sessionsHtml += '<div class="closed-notice"><strong>Gym closed</strong><div class="small mt-1">' + escapeHtml(selected.closure_reason || 'No sessions are available on this date.') + '</div></div>';
    }
    if (!selected.sessions.length) {
      sessionsHtml += emptyState('calendar', 'No sessions', selected.is_closed ? 'The gym is closed on this date.' : 'There are no training sessions scheduled for this day.');
    } else {
      sessionsHtml += '<div class="sessions-list">' + selected.sessions.map(sessionCard).join('') + '</div>';
    }

    var announcementHtml = announcement ? '<div class="announcement-banner mb-3"><div class="announcement-banner-icon">' + icon('megaphone') + '</div><div class="min-w-0"><h3>' + escapeHtml(announcement.title) + '</h3><p>' + escapeHtml(announcement.body) + '</p></div><button class="btn btn-sm btn-light ms-auto flex-shrink-0" type="button" data-route="#/announcements">View</button></div>' : '';

    $('#pageContent').html(
      '<div class="content-grid">' +
        '<section class="week-picker">' +
          '<div class="week-picker-top"><button class="week-nav-btn" type="button" data-week-shift="-7" aria-label="Previous week">' + icon('chevron-left') + '</button>' +
          '<div class="text-center"><div class="eyebrow text-white-50 mb-1">Weekly program</div><div class="week-range">' + escapeHtml(formatWeekRange(schedule.week_start, schedule.week_end)) + '</div></div>' +
          '<button class="week-nav-btn" type="button" data-week-shift="7" aria-label="Next week">' + icon('chevron-right') + '</button></div>' +
          '<div class="day-strip">' + daysHtml + '</div>' +
        '</section>' +
        announcementHtml +
        '<section><div class="schedule-header"><div><h2>' + escapeHtml(formatDate(selected.date, { weekday: 'long', day: 'numeric', month: 'long' })) + '</h2><p>' + (selected.sessions.length ? selected.sessions.length + ' sessions available' : 'No scheduled sessions') + '</p></div>' +
        (selected.date !== todayYmd() ? '<button class="btn btn-sm btn-soft" type="button" data-go-today>' + icon('calendar') + ' Today</button>' : '') + '</div>' + sessionsHtml + '</section>' +
      '</div>'
    );
  }

  function sessionCard(session) {
    var percent = session.capacity ? Math.min(100, Math.round((session.booked_count / session.capacity) * 100)) : 0;
    var classes = 'session-card' + (session.is_booked_by_me ? ' is-mine' : '') + (session.status !== 'open' ? ' is-closed' : '');
    var statusBadge = session.status !== 'open'
      ? '<span class="badge-soft-danger">' + escapeHtml(session.status === 'cancelled' ? 'Cancelled' : 'Closed') + '</span>'
      : session.is_full
        ? '<span class="badge-soft-danger">Full</span>'
        : session.is_booked_by_me
          ? '<span class="badge-soft-brand">' + icon('check', 'me-1') + ' Your booking</span>'
          : '<span class="badge-soft-success">' + session.available_count + ' places left</span>';

    var attendees = session.attendees && session.attendees.length
      ? '<div class="attendee-list">' + session.attendees.map(function (person) {
          return '<span class="attendee-chip' + (person.user_id === state.user.id ? ' me' : '') + '">' + escapeHtml(person.display_name) + '</span>';
        }).join('') + '</div>'
      : '';

    var action = '';
    if (session.is_booked_by_me && session.my_booking_id) {
      action = '<button class="btn btn-outline-danger btn-sm" type="button" data-cancel-booking="' + session.my_booking_id + '">Cancel booking</button>';
    } else if (session.is_waitlisted_by_me && session.my_waitlist_id) {
      action = '<button class="btn btn-outline-secondary btn-sm" type="button" data-leave-waitlist="' + session.my_waitlist_id + '">Leave waiting list</button>';
    } else if (session.booking_allowed) {
      action = '<button class="btn btn-brand btn-sm" type="button" data-book-session="' + session.id + '">' + icon('plus') + ' Reserve place</button>';
    } else if (session.waitlist_allowed) {
      action = '<button class="btn btn-dark btn-sm" type="button" data-join-waitlist="' + session.id + '">' + icon('clock') + ' Join waiting list</button>';
    } else if (session.is_full && session.status === 'open') {
      action = '<button class="btn btn-light btn-sm" type="button" disabled>Session full</button>';
    }

    return '<article class="' + classes + '"><div class="session-main"><div class="session-time"><strong>' + escapeHtml(session.start_time) + '</strong><small>' + (session.end_time ? 'to ' + escapeHtml(session.end_time) : 'Training') + '</small></div>' +
      '<div class="session-details"><div class="session-meta-row">' + statusBadge + (session.note ? '<span class="badge-soft-muted">' + escapeHtml(session.note) + '</span>' : '') + '</div>' +
      '<div class="capacity-row"><span>' + session.booked_count + ' booked</span><span>' + session.booked_count + ' / ' + session.capacity + '</span></div>' +
      '<div class="capacity-track"><div class="capacity-fill' + (session.is_full ? ' full' : '') + '" style="width:' + percent + '%"></div></div>' + (session.waitlist_count ? '<div class="small text-muted mt-2">' + session.waitlist_count + ' on waiting list</div>' : '') + attendees + '</div></div>' +
      (session.closure_reason ? '<div class="small text-danger mt-2">' + escapeHtml(session.closure_reason) + '</div>' : '') +
      (action ? '<div class="session-actions">' + action + '</div>' : '') + '</article>';
  }

  /* Member bookings */
  async function renderMyBookings() {
    setPageMeta('My bookings', 'Member');
    $('#pageContent').html(pageSkeleton());
    var version = state.routeVersion;
    try {
      var response = await Api.get('/bookings', { from: todayYmd(), to: addDays(todayYmd(), config.SCHEDULE_DAYS_AHEAD) });
      if (version !== state.routeVersion) return;
      var items = response.data || [];
      var active = items.filter(function (item) { return item.status === 'booked'; });
      var history = items.filter(function (item) { return item.status !== 'booked'; });
      var html = '<div class="page-toolbar"><div><h2 class="section-card-title">Upcoming training</h2><p class="section-card-subtitle">Your confirmed reservations for the next ' + config.SCHEDULE_DAYS_AHEAD + ' days.</p></div><button class="btn btn-brand" type="button" data-route="#/schedule">' + icon('plus') + ' Book a session</button></div>';
      html += active.length ? '<div class="booking-list">' + active.map(bookingCard).join('') + '</div>' : emptyState('calendar-check', 'No upcoming bookings', 'Choose a session from the weekly schedule.', '<button class="btn btn-brand" type="button" data-route="#/schedule">Open schedule</button>');
      if (history.length) {
        html += '<div class="mt-4"><h3 class="section-card-title mb-3">Attendance / history</h3><div class="booking-list">' + history.map(bookingCard).join('') + '</div></div>';
      }
      $('#pageContent').html(html);
    } catch (error) {
      $('#pageContent').html(emptyState('alert-circle', 'Unable to load bookings', Api.errorMessage(error), '<button class="btn btn-brand" data-retry-route type="button">Try again</button>'));
    }
  }

  function bookingCard(booking) {
    var date = parseYmd(booking.date);
    var cancelled = booking.status === 'cancelled';
    return '<article class="booking-card' + (cancelled ? ' cancelled' : '') + '"><div class="booking-date-box"><div><strong>' + date.getDate() + '</strong><span>' + escapeHtml(new Intl.DateTimeFormat(config.DATE_LOCALE, { month: 'short' }).format(date)) + '</span></div></div>' +
      '<div class="min-w-0"><h3>' + escapeHtml(new Intl.DateTimeFormat(config.DATE_LOCALE, { weekday: 'long' }).format(date)) + ' · ' + escapeHtml(booking.start_time) + '</h3><p>' + escapeHtml(formatDate(booking.date)) + (booking.end_time ? ' · ' + escapeHtml(booking.start_time + '–' + booking.end_time) : '') + '</p><div class="mt-2">' + (booking.status === 'checked_in' ? '<span class="badge-soft-brand">Checked in</span>' : booking.status === 'no_show' ? '<span class="badge-soft-danger">No-show</span>' : cancelled ? '<span class="badge-soft-muted">Cancelled</span>' : '<span class="badge-soft-success">Confirmed</span>') + '</div></div>' +
      '<div class="booking-action">' + (booking.status === 'booked' && isFutureSession(booking.date, booking.start_time) ? '<button class="btn btn-outline-danger btn-sm" type="button" data-cancel-booking="' + booking.id + '">Cancel</button>' : '') + '</div></article>';
  }

  /* Announcements */
  /* Member payments */
  function paymentStatusBadge(status) {
    if (status === 'paid') return '<span class="badge-soft-success">' + t('Paid') + '</span>';
    if (status === 'expired') return '<span class="badge-soft-danger">' + t('Expired') + '</span>';
    return '<span class="badge-soft-muted">' + t('Unpaid') + '</span>';
  }

  async function renderMyPayments() {
    setPageMeta(t('My payments'), t('Member'));
    $('#pageContent').html(pageSkeleton());
    try {
      var response = await Api.get('/payments');
      var data = response.data || {};
      var history = data.history || [];
      var message = data.status === 'paid' ? 'Your payment is currently valid.' : data.status === 'expired' ? 'Your last recorded payment has expired.' : 'No payment has been recorded yet.';
      var rows = history.map(function (item) {
        return '<tr><td>' + escapeHtml(formatDate(item.payment_date)) + '</td><td>' + escapeHtml(formatDate(item.valid_until)) + '</td><td>' + escapeHtml(item.confirmed_by_name || '—') + '</td></tr>';
      }).join('');
      $('#pageContent').html(
        '<div class="page-toolbar"><div><h2 class="section-card-title">' + t('Membership payment') + '</h2><p class="section-card-subtitle">' + t('Your membership payment status is managed by the gym administrator.') + '</p></div></div>' +
        '<div class="content-grid two-column"><section class="section-card payment-current-card"><div class="section-card-header"><div><h2 class="section-card-title">' + t('Current membership') + '</h2><p class="section-card-subtitle">' + t(message) + '</p></div>' + paymentStatusBadge(data.status) + '</div>' +
        '<div class="payment-validity"><span>' + t('Paid until') + '</span><strong>' + (data.paid_until ? escapeHtml(formatDate(data.paid_until, { day:'numeric', month:'long', year:'numeric' })) : '—') + '</strong></div></section>' +
        '<section class="section-card"><div class="d-flex gap-3 align-items-start"><div class="announcement-banner-icon">' + icon('info') + '</div><div><h2 class="section-card-title mb-1">' + t('Payment status') + '</h2><p class="section-card-subtitle mb-0">' + t('This does not block bookings if the payment is expired.') + '</p></div></div></section></div>' +
        '<section class="section-card mt-4"><div class="section-card-header"><div><h2 class="section-card-title">' + t('Payment history') + '</h2></div></div><div class="table-responsive"><table class="table"><thead><tr><th>' + t('Payment date') + '</th><th>' + t('Valid until') + '</th><th>' + t('Confirmed by') + '</th></tr></thead><tbody>' + (rows || '<tr><td colspan="3">' + t('No payment history yet.') + '</td></tr>') + '</tbody></table></div></section>'
      );
    } catch (error) {
      $('#pageContent').html(emptyState('alert-circle', t('Unable to load payments'), Api.errorMessage(error)));
    }
  }

  async function renderAnnouncementsPage() {
    setPageMeta('Announcements', 'Member');
    $('#pageContent').html(pageSkeleton());
    try {
      var response = await Api.get('/announcements');
      var items = response.data || [];
      $('#pageContent').html(items.length ? '<div class="announcement-list">' + items.map(announcementCard).join('') + '</div>' : emptyState('bell', 'No announcements', 'The gym has not posted any active announcements.'));
    } catch (error) {
      $('#pageContent').html(emptyState('alert-circle', 'Unable to load announcements', Api.errorMessage(error)));
    }
  }

  function announcementCard(item, adminActions) {
    return '<article class="announcement-card"><div class="d-flex align-items-start gap-3"><div class="announcement-banner-icon">' + icon('megaphone') + '</div><div class="flex-grow-1 min-w-0"><div class="d-flex align-items-start justify-content-between gap-2"><div><h3>' + escapeHtml(item.title) + '</h3>' + (adminActions ? '<div class="mb-2">' + (item.is_active ? '<span class="badge-soft-success">Active</span>' : '<span class="badge-soft-muted">Inactive</span>') + '</div>' : '') + '</div>' + (adminActions ? '<div class="table-actions"><button class="btn btn-light table-action-btn" type="button" data-announcement-edit="' + item.id + '" aria-label="Edit">' + icon('edit') + '</button><button class="btn btn-light text-danger table-action-btn" type="button" data-announcement-delete="' + item.id + '" aria-label="Delete">' + icon('trash') + '</button></div>' : '') + '</div><p>' + escapeHtml(item.body) + '</p><div class="announcement-meta"><span>Starts ' + escapeHtml(formatDateTime(item.starts_at)) + '</span>' + (item.expires_at ? '<span>Expires ' + escapeHtml(formatDateTime(item.expires_at)) + '</span>' : '<span>No expiry</span>') + (item.author_name ? '<span>By ' + escapeHtml(item.author_name) + '</span>' : '') + '</div></div></div></article>';
  }

  /* Profile */
  async function renderProfilePage() {
    setPageMeta('Profile', 'Account');
    $('#pageContent').html(pageSkeleton());
    try {
      var response = await Api.get('/profile');
      saveUser(response.data);
      var user = response.data;
      var forcePassword = user.must_change_password ? '<div class="alert alert-warning border-0 shadow-sm"><strong>Change your temporary password.</strong><div class="small mt-1">Your account was created with a temporary password. You must choose a new password before using the rest of BE-FIT.</div></div>' : '';
      var html = forcePassword + '<div class="content-grid two-column"><div class="content-grid">' +
        '<section class="profile-hero"><span class="avatar">' + escapeHtml(initials(user)) + '</span><div class="min-w-0"><h2>' + escapeHtml(user.display_name) + '</h2><p class="text-capitalize">' + escapeHtml(user.role) + ' account · ' + escapeHtml(user.status) + '</p></div></section>' +
        '<section class="section-card"><div class="section-card-header"><div><h2 class="section-card-title">Personal information</h2><p class="section-card-subtitle">Keep your contact information up to date.</p></div></div>' +
        '<form id="profileForm"><div class="row g-3"><div class="col-sm-6"><label class="form-label">First name</label><input name="first_name" class="form-control" value="' + escapeHtml(user.first_name) + '" required></div><div class="col-sm-6"><label class="form-label">Last name</label><input name="last_name" class="form-control" value="' + escapeHtml(user.last_name) + '" required></div><div class="col-sm-6"><label class="form-label">Email</label><input name="email" type="email" class="form-control" value="' + escapeHtml(user.email || '') + '"></div><div class="col-sm-6"><label class="form-label">Phone</label><input name="phone" class="form-control" value="' + escapeHtml(user.phone || '') + '"></div></div><div class="d-flex justify-content-end mt-3"><button class="btn btn-brand" type="submit"><span class="button-label">Save profile</span><span class="spinner-border spinner-border-sm ms-2 d-none"></span></button></div></form></section>' +
        '<section class="section-card"><div class="section-card-header"><div><h2 class="section-card-title">Change password</h2><p class="section-card-subtitle">Changing your password signs you out on every device.</p></div></div><form id="passwordForm"><div class="row g-3"><div class="col-md-6"><label class="form-label">Current password</label><input name="current_password" type="password" class="form-control" minlength="8" required></div><div class="col-md-6"><label class="form-label">New password</label><input name="new_password" type="password" class="form-control" minlength="8" required></div></div><div class="d-flex justify-content-end mt-3"><button class="btn btn-dark" type="submit"><span class="button-label">Change password</span><span class="spinner-border spinner-border-sm ms-2 d-none"></span></button></div></form></section></div>' +
        '<aside class="content-grid"><section class="section-card"><h2 class="section-card-title mb-2">Account</h2><div class="small text-muted mb-3">Signed in as <strong class="text-dark">' + escapeHtml(user.email || user.phone || user.display_name) + '</strong>.</div><button id="profileInstallButton" class="btn btn-soft w-100 mb-2' + (state.deferredInstallPrompt ? '' : ' d-none') + '" type="button">' + icon('download') + ' Install BE-FIT</button><button class="btn btn-outline-danger w-100" type="button" data-logout>' + icon('log-out') + ' Log out</button></section>' +
        '<section class="section-card"><div class="d-flex gap-3 align-items-start"><div class="announcement-banner-icon">' + icon('shield') + '</div><div><h2 class="section-card-title mb-1">Secure access</h2><p class="section-card-subtitle mb-0">Your session uses an authenticated Bearer token. Never share your password or access token.</p></div></div></section></aside></div>';
      $('#pageContent').html(html);
    } catch (error) {
      $('#pageContent').html(emptyState('alert-circle', 'Unable to load profile', Api.errorMessage(error)));
    }
  }

  /* Admin dashboard */
  async function renderAdminDashboard(date) {
    date = date || todayYmd();
    setPageMeta('Dashboard', 'Administrator');
    $('#pageContent').html(pageSkeleton());
    try {
      var response = await Api.get('/admin/dashboard', { date: date });
      var d = response.data;
      var next = d.next_session;
      var html = '<div class="page-toolbar"><div><h2 class="section-card-title">' + escapeHtml(formatDate(d.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })) + '</h2><p class="section-card-subtitle">Daily overview of members and training sessions.</p></div><div class="toolbar-actions"><input id="dashboardDate" type="date" class="form-control" style="width:auto" value="' + escapeHtml(d.date) + '"></div></div>' +
        '<div class="metrics-grid mb-4"><div class="metric-card"><div class="metric-icon brand">' + icon('users') + '</div><span class="metric-value">' + d.active_members + '</span><span class="metric-label">Active members</span></div><div class="metric-card"><div class="metric-icon success">' + icon('calendar-check') + '</div><span class="metric-value">' + d.bookings + '</span><span class="metric-label">Bookings today</span></div><div class="metric-card"><div class="metric-icon info">' + icon('clock') + '</div><span class="metric-value">' + d.sessions_count + '</span><span class="metric-label">Sessions today</span></div><div class="metric-card"><div class="metric-icon warning">' + icon('activity') + '</div><span class="metric-value">' + (next ? escapeHtml(next.start_time) : '—') + '</span><span class="metric-label">Next open session</span></div></div>' +
        '<div class="content-grid two-column"><section class="section-card"><div class="section-card-header"><div><h2 class="section-card-title">Today\'s sessions</h2><p class="section-card-subtitle">Live occupancy based on confirmed bookings.</p></div><button class="btn btn-sm btn-soft" type="button" data-route="#/admin/bookings">Manage bookings</button></div>' +
        (d.sessions.length ? d.sessions.map(function (s) { var pct = s.capacity ? Math.round((s.booked_count / s.capacity) * 100) : 0; return '<div class="dashboard-session-row"><div class="dashboard-session-time">' + escapeHtml(s.start_time) + '</div><div><div class="capacity-row mb-1"><span>' + escapeHtml(s.status) + '</span><span>' + s.available_count + ' available</span></div><div class="capacity-track"><div class="capacity-fill' + (s.booked_count >= s.capacity ? ' full' : '') + '" style="width:' + Math.min(100,pct) + '%"></div></div></div><div class="occupancy-pill">' + s.booked_count + ' / ' + s.capacity + '</div></div>'; }).join('') : emptyState('calendar', 'No sessions today', 'There are no scheduled training sessions for this date.')) + '</section>' +
        '<aside class="content-grid"><section class="section-card"><h2 class="section-card-title mb-2">Quick actions</h2><div class="d-grid gap-2"><button class="btn btn-brand" type="button" data-admin-new-booking>' + icon('plus') + ' Add booking</button><button class="btn btn-soft" type="button" data-admin-new-user>' + icon('user-plus') + ' Add member</button><button class="btn btn-soft" type="button" data-route="#/admin/announcements">' + icon('megaphone') + ' Post announcement</button><button class="btn btn-soft" type="button" data-route="#/admin/reports">' + icon('activity') + ' Attendance report</button></div></section>' +
        '<section class="section-card"><div class="d-flex gap-3 align-items-start"><div class="announcement-banner-icon">' + icon('info') + '</div><div><h2 class="section-card-title mb-1">Capacity protection</h2><p class="section-card-subtitle mb-0">The API validates each booking inside a database transaction, so a full session cannot be overbooked by simultaneous requests.</p></div></div></section></aside></div>';
      $('#pageContent').html(html);
    } catch (error) {
      $('#pageContent').html(emptyState('alert-circle', 'Unable to load dashboard', Api.errorMessage(error)));
    }
  }

  /* Admin members */
  async function renderAdminMembers(query) {
    query = query || { page: 1, per_page: 25 };
    setPageMeta('Members', 'Administrator');
    $('#pageContent').html(pageSkeleton());
    try {
      var response = await Api.get('/admin/users', query);
      state.adminUsers = response.data;
      drawAdminMembers(query);
    } catch (error) {
      $('#pageContent').html(emptyState('alert-circle', 'Unable to load members', Api.errorMessage(error)));
    }
  }

  function drawAdminMembers(query) {
    var data = state.adminUsers;
    var rows = data.items.map(function (u) {
      var payment = u.role === 'member' ? paymentStatusBadge(u.payment_status) : '<span class="text-muted">—</span>';
      var paidUntil = u.role === 'member' && u.paid_until ? formatDate(u.paid_until, { day:'numeric', month:'short', year:'numeric' }) : '—';
      return '<tr><td><div class="d-flex align-items-center gap-2"><span class="avatar avatar-sm">' + escapeHtml(initials(u)) + '</span><div class="min-w-0"><strong class="d-block text-truncate">' + escapeHtml(u.display_name) + '</strong><small class="text-muted">' + escapeHtml(u.email || u.phone || '') + '</small></div></div></td><td><span class="badge-soft-' + (u.role === 'admin' ? 'brand' : 'muted') + ' text-capitalize">' + escapeHtml(u.role) + '</span></td><td><span class="badge-soft-' + (u.status === 'active' ? 'success' : 'danger') + ' text-capitalize">' + escapeHtml(u.status) + '</span></td><td>' + payment + '<div class="small text-muted mt-1">' + escapeHtml(paidUntil) + '</div></td><td class="d-none d-lg-table-cell">' + escapeHtml(u.phone || '—') + '</td><td class="d-none d-xl-table-cell">' + escapeHtml(u.last_login_at ? formatDateTime(u.last_login_at) : t('Never')) + '</td><td><div class="table-actions">' + (u.role === 'member' ? '<button class="btn btn-light table-action-btn" type="button" data-user-payment="' + u.id + '" aria-label="' + t('Edit / record payment') + '">' + icon('credit-card') + '</button>' : '') + '<button class="btn btn-light table-action-btn" type="button" data-user-edit="' + u.id + '" aria-label="' + t('Edit member') + '">' + icon('edit') + '</button></div></td></tr>';
    }).join('');

    var html = '<div class="page-toolbar"><div><h2 class="section-card-title">Member directory</h2><p class="section-card-subtitle">Create accounts, update contact information, roles and account status.</p></div><button class="btn btn-brand" type="button" data-admin-new-user>' + icon('user-plus') + ' Add member</button></div>' +
      '<form id="memberFilters" class="filters-card"><div class="filters-grid"><div><label class="form-label">Search</label><input name="search" class="form-control" placeholder="Name, email or phone" value="' + escapeHtml(query.search || '') + '"></div><div><label class="form-label">Role</label><select name="role" class="form-select select2" data-search="false" data-allow-clear="true" data-placeholder="All roles"><option value=""></option><option value="member"' + (query.role === 'member' ? ' selected' : '') + '>Member</option><option value="admin"' + (query.role === 'admin' ? ' selected' : '') + '>Administrator</option></select></div><div><label class="form-label">Status</label><select name="status" class="form-select select2" data-search="false" data-allow-clear="true" data-placeholder="All statuses"><option value=""></option><option value="active"' + (query.status === 'active' ? ' selected' : '') + '>Active</option><option value="inactive"' + (query.status === 'inactive' ? ' selected' : '') + '>Inactive</option></select></div><div class="d-flex align-items-end"><button class="btn btn-dark w-100" type="submit">' + icon('search') + ' Apply filters</button></div></div></form>' +
      '<div class="table-card"><div class="table-responsive"><table class="table"><thead><tr><th>Member</th><th>Role</th><th>Status</th><th>Payment status</th><th class="d-none d-lg-table-cell">Phone</th><th class="d-none d-xl-table-cell">Last login</th><th class="text-end">Actions</th></tr></thead><tbody>' + (rows || '<tr><td colspan="7">' + emptyState('users','No members found','Try changing the filters.') + '</td></tr>') + '</tbody></table></div>' + paginationHtml(data.pagination, 'users') + '</div>';
    $('#pageContent').html(html);
    initSelect2('#pageContent');
  }

  function paginationHtml(p, scope) {
    if (!p || p.pages <= 1) return '';
    return '<div class="pagination-wrap"><span>Page ' + p.page + ' of ' + p.pages + ' · ' + p.total + ' records</span><div class="pagination-buttons"><button class="btn btn-sm btn-light" type="button" data-page-scope="' + scope + '" data-page="' + (p.page - 1) + '"' + (p.page <= 1 ? ' disabled' : '') + '>' + icon('chevron-left') + '</button><button class="btn btn-sm btn-light" type="button" data-page-scope="' + scope + '" data-page="' + (p.page + 1) + '"' + (p.page >= p.pages ? ' disabled' : '') + '>' + icon('chevron-right') + '</button></div></div>';
  }

  async function openUserModal(id) {
    var user = null;
    if (id) {
      showLoader(true);
      try { user = (await Api.get('/admin/users/' + id)).data; }
      catch (e) { toast(Api.errorMessage(e), 'danger'); return; }
      finally { showLoader(false); }
    }
    var editing = !!user;
    openModal(editing ? 'Edit member' : 'Add member', 'Member account',
      '<form id="userModalForm" data-user-id="' + (editing ? user.id : '') + '"><div class="row g-3"><div class="col-sm-6"><label class="form-label">First name</label><input name="first_name" class="form-control" required value="' + escapeHtml(editing ? user.first_name : '') + '"></div><div class="col-sm-6"><label class="form-label">Last name</label><input name="last_name" class="form-control" required value="' + escapeHtml(editing ? user.last_name : '') + '"></div><div class="col-sm-6"><label class="form-label">Email</label><input name="email" type="email" class="form-control" value="' + escapeHtml(editing ? (user.email || '') : '') + '"></div><div class="col-sm-6"><label class="form-label">Phone</label><input name="phone" class="form-control" value="' + escapeHtml(editing ? (user.phone || '') : '') + '"></div><div class="col-sm-6"><label class="form-label">Role</label><select name="role" class="form-select select2" data-search="false"><option value="member"' + (!editing || user.role === 'member' ? ' selected' : '') + '>Member</option><option value="admin"' + (editing && user.role === 'admin' ? ' selected' : '') + '>Administrator</option></select></div><div class="col-sm-6"><label class="form-label">Status</label><select name="status" class="form-select select2" data-search="false"><option value="active"' + (!editing || user.status === 'active' ? ' selected' : '') + '>Active</option><option value="inactive"' + (editing && user.status === 'inactive' ? ' selected' : '') + '>Inactive</option></select></div><div class="col-12"><label class="form-label">' + (editing ? 'New password (optional)' : 'Temporary password') + '</label><div class="input-group password-generator-group"><input name="password" type="text" class="form-control" minlength="8"' + (editing ? '' : ' required') + '><button class="btn btn-light" type="button" data-generate-password>' + icon('refresh') + ' <span>Generate</span></button><button class="btn btn-light" type="button" data-copy-password>' + icon('copy') + ' <span>Copy</span></button></div><div class="form-text">Minimum 8 characters.' + (editing ? ' Leave empty to keep the existing password.' : ' The member can be required to replace this after first login.') + '</div></div><div class="col-12"><div class="form-check form-switch"><input name="must_change_password" class="form-check-input" type="checkbox" id="mustChangePassword"' + (!editing || user.must_change_password ? ' checked' : '') + '><label class="form-check-label" for="mustChangePassword">Require password change on next login</label></div></div></div></form>',
      '<button class="btn btn-light" data-bs-dismiss="modal" type="button">Cancel</button><button class="btn btn-brand" type="submit" form="userModalForm"><span class="button-label">' + (editing ? 'Save changes' : 'Create member') + '</span><span class="spinner-border spinner-border-sm ms-2 d-none"></span></button>',
      'modal-lg');
    initSelect2('#appModal');
  }

  async function openPaymentModal(userId) {
    showLoader(true);
    try {
      var response = await Api.get('/admin/users/' + userId + '/payments');
      var data = response.data || {};
      var user = data.user || {};
      var history = data.history || [];
      var rows = history.map(function (item) {
        return '<tr><td>' + escapeHtml(formatDate(item.payment_date)) + '</td><td>' + escapeHtml(formatDate(item.valid_until)) + '</td><td>' + escapeHtml(item.confirmed_by_name || '—') + '</td></tr>';
      }).join('');
      var body = '<div class="payment-modal-summary"><div><span class="small text-muted">' + t('Current status') + '</span><div class="mt-1">' + paymentStatusBadge(data.status) + '</div></div><div><span class="small text-muted">' + t('Paid until') + '</span><strong class="d-block mt-1">' + (data.paid_until ? escapeHtml(formatDate(data.paid_until)) : '—') + '</strong></div></div>' +
        '<form id="paymentModalForm" data-user-id="' + userId + '"><div class="row g-3"><div class="col-sm-6"><label class="form-label">' + t('Payment date') + '</label><input name="payment_date" type="date" class="form-control" required value="' + escapeHtml(data.suggested_payment_date || todayYmd()) + '"></div><div class="col-sm-6"><label class="form-label">' + t('Valid until') + '</label><input name="valid_until" type="date" class="form-control" required value="' + escapeHtml(data.suggested_valid_until || '') + '"></div></div><div class="form-text mt-2">' + t('The suggested end date extends an active membership by one calendar month. If it has expired, it starts from the payment date.') + '</div><div class="form-text">' + t('This does not block bookings if the payment is expired.') + '</div></form>' +
        '<div class="mt-4"><h3 class="section-card-title fs-6">' + t('Payment history') + '</h3><div class="table-responsive"><table class="table mb-0"><thead><tr><th>' + t('Payment date') + '</th><th>' + t('Valid until') + '</th><th>' + t('Confirmed by') + '</th></tr></thead><tbody>' + (rows || '<tr><td colspan="3">' + t('No payment history yet.') + '</td></tr>') + '</tbody></table></div></div>';
      openModal((user.display_name || '') + ' · ' + t('Payment validation'), t('Record a member payment'), body, '<button class="btn btn-light" data-bs-dismiss="modal" type="button">' + t('Cancel') + '</button><button class="btn btn-brand" type="submit" form="paymentModalForm"><span class="button-label">' + t('Save payment') + '</span><span class="spinner-border spinner-border-sm ms-2 d-none"></span></button>', 'modal-lg');
    } catch (error) {
      toast(Api.errorMessage(error), 'danger');
    } finally {
      showLoader(false);
    }
  }

  /* Admin schedule */
  async function renderAdminSchedule() {
    setPageMeta('Schedule', 'Administrator');
    if (!state.adminScheduleRange) state.adminScheduleRange = { from: todayYmd(), to: addDays(todayYmd(), 14) };
    $('#pageContent').html('<div class="page-toolbar"><div><h2 class="section-card-title">Schedule manager</h2><p class="section-card-subtitle">Manage the recurring timetable, actual dated sessions and full-day closures.</p></div></div><div class="admin-tabs mb-3"><button class="admin-tab" data-admin-schedule-tab="templates" type="button">Recurring timetable</button><button class="admin-tab" data-admin-schedule-tab="sessions" type="button">Dated sessions</button><button class="admin-tab" data-admin-schedule-tab="closures" type="button">Closures</button></div><div id="adminSchedulePanel">' + pageSkeleton() + '</div>');
    await loadAdminScheduleTab();
  }

  async function loadAdminScheduleTab() {
    $('[data-admin-schedule-tab]').removeClass('active').filter('[data-admin-schedule-tab="' + state.adminScheduleTab + '"]').addClass('active');
    $('#adminSchedulePanel').html(pageSkeleton());
    try {
      if (state.adminScheduleTab === 'templates') return loadTemplates();
      if (state.adminScheduleTab === 'sessions') return loadSessions();
      return loadClosures();
    } catch (error) {
      $('#adminSchedulePanel').html(emptyState('alert-circle', 'Unable to load schedule data', Api.errorMessage(error)));
    }
  }

  async function loadTemplates() {
    var response = await Api.get('/admin/schedule/templates');
    var items = response.data || [];
    var weekdays = ['','Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    var html = '<div class="page-toolbar"><div><h3 class="section-card-title">Recurring timetable</h3><p class="section-card-subtitle">Templates automatically materialize into dated sessions.</p></div><button class="btn btn-brand" data-template-new type="button">' + icon('plus') + ' Add time slot</button></div>';
    html += items.length ? '<div class="template-grid">' + items.map(function (t) {
      return '<article class="template-card"><div class="template-day">' + weekdays[t.weekday] + '</div><div class="template-info"><h3>' + escapeHtml(t.start_time) + (t.end_time ? ' – ' + escapeHtml(t.end_time) : '') + '</h3><p>Capacity ' + t.capacity + ' · ' + (t.is_active ? 'Active' : 'Inactive') + '</p></div><div class="table-actions"><button class="btn btn-light table-action-btn" type="button" data-template-edit="' + t.id + '" data-template-json="' + escapeHtml(encodeURIComponent(JSON.stringify(t))) + '">' + icon('edit') + '</button><button class="btn btn-light text-danger table-action-btn" type="button" data-template-delete="' + t.id + '">' + icon('trash') + '</button></div></article>';
    }).join('') + '</div>' : emptyState('calendar','No recurring time slots','Create the first weekly time slot.');
    $('#adminSchedulePanel').html(html);
  }

  function openTemplateModal(template) {
    var editing = !!template;
    var options = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(function (name, idx) { var val = idx + 1; return '<option value="' + val + '"' + ((editing ? template.weekday : 1) === val ? ' selected' : '') + '>' + name + '</option>'; }).join('');
    openModal(editing ? 'Edit time slot' : 'Add time slot', 'Recurring timetable', '<form id="templateModalForm" data-template-id="' + (editing ? template.id : '') + '"><div class="row g-3"><div class="col-12"><label class="form-label">Day</label><select name="weekday" class="form-select select2" data-search="false">' + options + '</select></div><div class="col-sm-6"><label class="form-label">Start time</label><input name="start_time" type="time" class="form-control" required value="' + escapeHtml(editing ? template.start_time : '18:00') + '"></div><div class="col-sm-6"><label class="form-label">End time</label><input name="end_time" type="time" class="form-control" value="' + escapeHtml(editing ? (template.end_time || '') : '19:00') + '"></div><div class="col-sm-6"><label class="form-label">Capacity</label><input name="capacity" type="number" min="1" max="100" class="form-control" required value="' + escapeHtml(editing ? template.capacity : 8) + '"></div><div class="col-sm-6 d-flex align-items-end"><div class="form-check form-switch mb-2"><input name="is_active" class="form-check-input" type="checkbox" role="switch" id="templateActive"' + (!editing || template.is_active ? ' checked' : '') + '><label class="form-check-label" for="templateActive">Active</label></div></div></div></form>', '<button class="btn btn-light" data-bs-dismiss="modal" type="button">Cancel</button><button class="btn btn-brand" type="submit" form="templateModalForm"><span class="button-label">Save time slot</span><span class="spinner-border spinner-border-sm ms-2 d-none"></span></button>');
    initSelect2('#appModal');
  }

  async function loadSessions() {
    var range = state.adminScheduleRange;
    var response = await Api.get('/admin/schedule/sessions', range);
    var items = response.data || [];
    var rows = items.map(function (s) {
      return '<tr><td><strong>' + escapeHtml(formatDate(s.date, { day: 'numeric', month: 'short', weekday: 'short' })) + '</strong></td><td>' + escapeHtml(s.start_time) + (s.end_time ? '–' + escapeHtml(s.end_time) : '') + '</td><td>' + s.booked_count + ' / ' + s.capacity + '</td><td><span class="badge-soft-' + (s.status === 'open' ? 'success' : s.status === 'cancelled' ? 'danger' : 'warning') + ' text-capitalize">' + escapeHtml(s.status) + '</span></td><td class="d-none d-md-table-cell">' + escapeHtml(s.note || '—') + '</td><td><div class="table-actions"><button class="btn btn-light table-action-btn" data-session-edit="' + s.id + '" data-session-json="' + escapeHtml(encodeURIComponent(JSON.stringify(s))) + '" type="button">' + icon('edit') + '</button></div></td></tr>';
    }).join('');
    $('#adminSchedulePanel').html('<div class="page-toolbar"><form id="sessionRangeForm" class="d-flex gap-2 flex-wrap"><input name="from" type="date" class="form-control" style="width:auto" value="' + escapeHtml(range.from) + '"><input name="to" type="date" class="form-control" style="width:auto" value="' + escapeHtml(range.to) + '"><button class="btn btn-dark" type="submit">Apply</button></form><button class="btn btn-brand" data-session-new type="button">' + icon('plus') + ' Add session</button></div><div class="table-card"><div class="table-responsive"><table class="table"><thead><tr><th>Date</th><th>Time</th><th>Booked</th><th>Status</th><th class="d-none d-md-table-cell">Note</th><th class="text-end">Actions</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6">' + emptyState('calendar','No sessions','No sessions exist in this date range.') + '</td></tr>') + '</tbody></table></div></div>');
  }

  function openSessionModal(session) {
    var editing = !!session;
    openModal(editing ? 'Edit session' : 'Add session', 'Dated session', '<form id="sessionModalForm" data-session-id="' + (editing ? session.id : '') + '"><div class="row g-3"><div class="col-sm-6"><label class="form-label">Date</label><input name="date" type="date" class="form-control" required value="' + escapeHtml(editing ? session.date : todayYmd()) + '"></div><div class="col-sm-6"><label class="form-label">Status</label><select name="status" class="form-select select2" data-search="false"><option value="open"' + (!editing || session.status === 'open' ? ' selected' : '') + '>Open</option><option value="closed"' + (editing && session.status === 'closed' ? ' selected' : '') + '>Closed</option><option value="cancelled"' + (editing && session.status === 'cancelled' ? ' selected' : '') + '>Cancelled</option></select><div class="form-text">Closed blocks new bookings but keeps existing reservations. Cancelled cancels active reservations and releases the waiting list.</div></div><div class="col-sm-6"><label class="form-label">Start time</label><input name="start_time" type="time" class="form-control" required value="' + escapeHtml(editing ? session.start_time : '18:00') + '"></div><div class="col-sm-6"><label class="form-label">End time</label><input name="end_time" type="time" class="form-control" value="' + escapeHtml(editing ? (session.end_time || '') : '19:00') + '"></div><div class="col-sm-6"><label class="form-label">Capacity</label><input name="capacity" type="number" min="1" max="100" class="form-control" required value="' + escapeHtml(editing ? session.capacity : 8) + '"></div><div class="col-12"><label class="form-label">Note</label><textarea name="note" class="form-control" maxlength="500" placeholder="Optional note">' + escapeHtml(editing ? (session.note || '') : '') + '</textarea></div></div></form>', '<button class="btn btn-light" data-bs-dismiss="modal" type="button">Cancel</button><button class="btn btn-brand" type="submit" form="sessionModalForm"><span class="button-label">Save session</span><span class="spinner-border spinner-border-sm ms-2 d-none"></span></button>', 'modal-lg');
    initSelect2('#appModal');
  }

  async function loadClosures() {
    var range = state.adminScheduleRange;
    var response = await Api.get('/admin/schedule/closures', range);
    var items = response.data || [];
    var rows = items.map(function (c) { return '<tr><td><strong>' + escapeHtml(formatDate(c.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })) + '</strong></td><td>' + escapeHtml(c.reason || 'No reason provided') + '</td><td class="text-end"><button class="btn btn-light text-danger table-action-btn" type="button" data-closure-delete="' + c.id + '">' + icon('trash') + '</button></td></tr>'; }).join('');
    $('#adminSchedulePanel').html('<div class="page-toolbar"><form id="closureRangeForm" class="d-flex gap-2 flex-wrap"><input name="from" type="date" class="form-control" style="width:auto" value="' + escapeHtml(range.from) + '"><input name="to" type="date" class="form-control" style="width:auto" value="' + escapeHtml(range.to) + '"><button class="btn btn-dark" type="submit">Apply</button></form><button class="btn btn-brand" data-closure-new type="button">' + icon('ban') + ' Close a date</button></div><div class="table-card"><div class="table-responsive"><table class="table"><thead><tr><th>Date</th><th>Reason</th><th class="text-end">Actions</th></tr></thead><tbody>' + (rows || '<tr><td colspan="3">' + emptyState('check-circle','No closures','The gym is open throughout this date range.') + '</td></tr>') + '</tbody></table></div></div>');
  }

  function openClosureModal() {
    openModal('Close a date', 'Full-day closure', '<form id="closureModalForm"><div class="alert alert-warning border-0 small"><strong>Important:</strong> existing reservations on this date will be cancelled and waiting-list entries will be released. Members will receive an in-app notification.</div><div class="mb-3"><label class="form-label">Date</label><input name="date" type="date" class="form-control" required value="' + todayYmd() + '"></div><div><label class="form-label">Reason</label><textarea name="reason" class="form-control" maxlength="500" placeholder="Holiday, maintenance, etc."></textarea></div></form>', '<button class="btn btn-light" data-bs-dismiss="modal" type="button">Cancel</button><button class="btn btn-danger" type="submit" form="closureModalForm"><span class="button-label">Close date</span><span class="spinner-border spinner-border-sm ms-2 d-none"></span></button>');
  }

  /* Admin bookings */
  async function renderAdminBookings(query) {
    query = query || { page: 1, per_page: 25, from: todayYmd(), to: addDays(todayYmd(), 30), status: 'booked' };
    setPageMeta('Bookings', 'Administrator');
    $('#pageContent').html(pageSkeleton());
    try {
      var responses = await Promise.all([
        Api.get('/admin/bookings', query),
        Api.get('/admin/waitlist', { from: query.from || todayYmd(), to: query.to || addDays(todayYmd(), 30), status: 'waiting' })
      ]);
      state.adminBookings = responses[0].data;
      state.adminWaitlist = responses[1].data || [];
      drawAdminBookings(query);
    } catch (error) {
      $('#pageContent').html(emptyState('alert-circle', 'Unable to load bookings', Api.errorMessage(error)));
    }
  }

  function drawAdminBookings(query) {
    var data = state.adminBookings;
    var rows = data.items.map(function (b) {
      var member = b.member || {};
      var statusClass = b.status === 'checked_in' ? 'brand' : b.status === 'booked' ? 'success' : b.status === 'no_show' ? 'danger' : 'muted';
      var attendance = b.status === 'cancelled' ? '' : '<select class="form-select form-select-sm attendance-select" data-admin-attendance-id="' + b.id + '"><option value="booked"' + (b.status === 'booked' ? ' selected' : '') + '>Booked</option><option value="checked_in"' + (b.status === 'checked_in' ? ' selected' : '') + '>Checked in</option><option value="no_show"' + (b.status === 'no_show' ? ' selected' : '') + '>No-show</option></select>';
      return '<tr><td><strong>' + escapeHtml(member.display_name || ('User #' + b.user_id)) + '</strong><div class="small text-muted">' + escapeHtml(member.email || member.phone || '') + '</div></td><td>' + escapeHtml(formatDate(b.date, { day: 'numeric', month: 'short', weekday: 'short' })) + '</td><td>' + escapeHtml(b.start_time) + (b.end_time ? '–' + escapeHtml(b.end_time) : '') + '</td><td><span class="badge-soft-' + statusClass + ' text-capitalize">' + escapeHtml(b.status.replace('_',' ')) + '</span></td><td>' + attendance + '</td><td class="text-end">' + (b.status !== 'cancelled' ? '<button class="btn btn-light text-danger table-action-btn" data-admin-booking-cancel="' + b.id + '" type="button" aria-label="Cancel booking">' + icon('x') + '</button>' : '') + '</td></tr>';
    }).join('');
    var html = '<div class="page-toolbar"><div><h2 class="section-card-title">All bookings</h2><p class="section-card-subtitle">Search reservations and add members to sessions manually.</p></div><button class="btn btn-brand" type="button" data-admin-new-booking>' + icon('plus') + ' Add booking</button></div>' +
      '<form id="adminBookingFilters" class="filters-card"><div class="filters-grid"><div><label class="form-label">Search</label><input name="search" class="form-control" value="' + escapeHtml(query.search || '') + '" placeholder="Member name, email or phone"></div><div><label class="form-label">From</label><input name="from" type="date" class="form-control" value="' + escapeHtml(query.from || '') + '"></div><div><label class="form-label">To</label><input name="to" type="date" class="form-control" value="' + escapeHtml(query.to || '') + '"></div><div><label class="form-label">Status</label><select name="status" class="form-select select2" data-search="false" data-allow-clear="true" data-placeholder="All statuses"><option value=""></option><option value="booked"' + (query.status === 'booked' ? ' selected' : '') + '>Booked</option><option value="checked_in"' + (query.status === 'checked_in' ? ' selected' : '') + '>Checked in</option><option value="no_show"' + (query.status === 'no_show' ? ' selected' : '') + '>No-show</option><option value="cancelled"' + (query.status === 'cancelled' ? ' selected' : '') + '>Cancelled</option></select></div></div><div class="d-flex justify-content-end mt-3"><button class="btn btn-dark" type="submit">' + icon('search') + ' Apply filters</button></div></form>' +
      '<div class="table-card mb-4"><div class="table-responsive"><table class="table"><thead><tr><th>Member</th><th>Date</th><th>Time</th><th>Status</th><th>Attendance</th><th></th></tr></thead><tbody>' + (rows || '<tr><td colspan="6">' + emptyState('calendar-check','No bookings found','Try another date range or search term.') + '</td></tr>') + '</tbody></table></div>' + paginationHtml(data.pagination, 'bookings') + '</div>' +
      adminWaitlistHtml(state.adminWaitlist || []);
    $('#pageContent').html(html);
    initSelect2('#pageContent');
  }

  function adminWaitlistHtml(items) {
    var positions = {};
    var rows = items.map(function (entry) {
      var member = entry.member || {};
      positions[entry.session_id] = (positions[entry.session_id] || 0) + 1;
      return '<tr><td><span class="waitlist-position">' + positions[entry.session_id] + '</span></td><td><strong>' + escapeHtml(member.display_name || ('User #' + entry.user_id)) + '</strong><div class="small text-muted">' + escapeHtml(member.email || member.phone || '') + '</div></td><td>' + escapeHtml(formatDate(entry.date, { day: 'numeric', month: 'short', weekday: 'short' })) + '</td><td>' + escapeHtml(entry.start_time) + (entry.end_time ? '–' + escapeHtml(entry.end_time) : '') + '</td><td>' + escapeHtml(formatDateTime(entry.joined_at)) + '</td></tr>';
    }).join('');
    return '<section class="section-card"><div class="section-card-header"><div><h2 class="section-card-title">Active waiting list</h2><p class="section-card-subtitle">Members are ordered by session and join time. When auto-promotion is enabled, the oldest eligible member is moved into a booking when a place opens.</p></div><span class="badge rounded-pill text-bg-dark">' + items.length + '</span></div><div class="table-responsive"><table class="table mb-0"><thead><tr><th>#</th><th>Member</th><th>Date</th><th>Time</th><th>Joined</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5">' + emptyState('clock','No one is waiting','There are no active waiting-list entries in this date range.') + '</td></tr>') + '</tbody></table></div></section>';
  }

  async function openAdminBookingModal() {
    showLoader(true);
    try {
      var responses = await Promise.all([
        Api.get('/admin/users', { role: 'member', status: 'active', page: 1, per_page: 100 }),
        Api.get('/admin/schedule/sessions', { from: todayYmd(), to: addDays(todayYmd(), 60) })
      ]);
      var users = responses[0].data.items || [];
      var sessions = (responses[1].data || []).filter(function (s) { return s.status === 'open' && s.booked_count < s.capacity && isFutureSession(s.date, s.start_time); });
      var userOptions = users.map(function (u) { return '<option value="' + u.id + '">' + escapeHtml(u.display_name + (u.phone ? ' · ' + u.phone : u.email ? ' · ' + u.email : '')) + '</option>'; }).join('');
      var sessionOptions = sessions.map(function (s) { return '<option value="' + s.id + '">' + escapeHtml(formatDate(s.date, { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + s.start_time + ' · ' + s.booked_count + '/' + s.capacity) + '</option>'; }).join('');
      openModal('Add booking', 'Administrator', '<form id="adminBookingModalForm"><div class="mb-3"><label class="form-label">Member</label><select name="user_id" class="form-select select2" data-placeholder="Choose a member" required><option value=""></option>' + userOptions + '</select></div><div><label class="form-label">Session</label><select name="session_id" class="form-select select2" data-placeholder="Choose an available session" required><option value=""></option>' + sessionOptions + '</select><div class="form-text">Only future open sessions with remaining capacity are shown.</div></div></form>', '<button class="btn btn-light" data-bs-dismiss="modal" type="button">Cancel</button><button class="btn btn-brand" type="submit" form="adminBookingModalForm"><span class="button-label">Create booking</span><span class="spinner-border spinner-border-sm ms-2 d-none"></span></button>');
      initSelect2('#appModal');
    } catch (error) {
      toast(Api.errorMessage(error), 'danger');
    } finally {
      showLoader(false);
    }
  }

  /* Admin announcements */
  async function renderAdminAnnouncements() {
    setPageMeta('Announcements', 'Administrator');
    $('#pageContent').html(pageSkeleton());
    try {
      var response = await Api.get('/admin/announcements');
      state.announcements = response.data || [];
      var html = '<div class="page-toolbar"><div><h2 class="section-card-title">Gym announcements</h2><p class="section-card-subtitle">Publish notices that appear in the member application.</p></div><button class="btn btn-brand" type="button" data-announcement-new>' + icon('plus') + ' New announcement</button></div>' +
        (state.announcements.length ? '<div class="announcement-list">' + state.announcements.map(function (a) { return announcementCard(a, true); }).join('') + '</div>' : emptyState('megaphone','No announcements','Create the first notice for your members.'));
      $('#pageContent').html(html);
    } catch (error) {
      $('#pageContent').html(emptyState('alert-circle','Unable to load announcements',Api.errorMessage(error)));
    }
  }

  async function openAnnouncementModal(id) {
    var item = null;
    if (id) {
      showLoader(true);
      try { item = (await Api.get('/admin/announcements/' + id)).data; }
      catch (e) { toast(Api.errorMessage(e), 'danger'); return; }
      finally { showLoader(false); }
    }
    openModal(item ? 'Edit announcement' : 'New announcement', 'Member notice', '<form id="announcementModalForm" data-announcement-id="' + (item ? item.id : '') + '"><div class="mb-3"><label class="form-label">Title</label><input name="title" class="form-control" maxlength="180" required value="' + escapeHtml(item ? item.title : '') + '"></div><div class="mb-3"><label class="form-label">Message</label><textarea name="body" class="form-control" maxlength="5000" required>' + escapeHtml(item ? item.body : '') + '</textarea></div><div class="row g-3"><div class="col-sm-6"><label class="form-label">Starts at</label><input name="starts_at" type="datetime-local" class="form-control" value="' + escapeHtml(item ? toInputDateTime(item.starts_at) : '') + '"></div><div class="col-sm-6"><label class="form-label">Expires at</label><input name="expires_at" type="datetime-local" class="form-control" value="' + escapeHtml(item ? toInputDateTime(item.expires_at) : '') + '"></div><div class="col-12"><div class="form-check form-switch"><input name="is_active" class="form-check-input" type="checkbox" role="switch" id="announcementActive"' + (!item || item.is_active ? ' checked' : '') + '><label class="form-check-label" for="announcementActive">Visible when within its active date range</label></div></div></div></form>', '<button class="btn btn-light" data-bs-dismiss="modal" type="button">Cancel</button><button class="btn btn-brand" type="submit" form="announcementModalForm"><span class="button-label">Save announcement</span><span class="spinner-border spinner-border-sm ms-2 d-none"></span></button>', 'modal-lg');
  }


  /* Member notifications */
  async function renderNotificationsPage() {
    setPageMeta('Notifications', 'Member');
    $('#pageContent').html(pageSkeleton());
    try {
      var response = await Api.get('/notifications');
      var data = response.data || { items: [], unread_count: 0 };
      var rows = (data.items || []).map(function (n) {
        return '<article class="notification-card' + (n.read_at ? '' : ' unread') + '"><div class="notification-icon">' + icon(n.type === 'waitlist_promoted' ? 'check-circle' : 'bell') + '</div><div class="min-w-0 flex-grow-1"><div class="d-flex justify-content-between gap-2"><h3>' + escapeHtml(n.title) + '</h3><small class="text-muted">' + escapeHtml(formatDateTime(n.created_at)) + '</small></div><p>' + escapeHtml(n.body) + '</p>' + (!n.read_at ? '<button class="btn btn-sm btn-light" type="button" data-notification-read="' + n.id + '">Mark as read</button>' : '') + '</div></article>';
      }).join('');
      $('#pageContent').html('<div class="page-toolbar"><div><h2 class="section-card-title">Notifications</h2><p class="section-card-subtitle">Booking confirmations, reminders, waiting-list updates and schedule changes.</p></div>' + (data.unread_count ? '<button class="btn btn-soft" type="button" data-notifications-read-all>Mark all read</button>' : '') + '</div>' + (rows ? '<div class="notification-list">' + rows + '</div>' : emptyState('bell','All caught up','You do not have any notifications yet.')));
    } catch (error) {
      $('#pageContent').html(emptyState('alert-circle','Unable to load notifications',Api.errorMessage(error)));
    }
  }

  /* Admin reports */
  async function renderAdminReports(query) {
    query = query || { from: ymd(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), to: todayYmd() };
    setPageMeta('Reports', 'Administrator');
    $('#pageContent').html(pageSkeleton());
    try {
      var response = await Api.get('/admin/reports/attendance', query);
      var d = response.data;
      var s = d.summary;
      var daily = (d.daily || []).map(function (row) {
        return '<tr><td>' + escapeHtml(formatDate(row.date, { day:'numeric', month:'short', year:'numeric' })) + '</td><td>' + row.reservations + '</td><td>' + row.attended + '</td><td>' + row.no_shows + '</td><td>' + row.cancelled + '</td></tr>';
      }).join('');
      $('#pageContent').html('<div class="page-toolbar"><div><h2 class="section-card-title">Attendance & booking history</h2><p class="section-card-subtitle">Use this to see how the gym is actually being used, not only how many places were reserved.</p></div></div><form id="reportRangeForm" class="filters-card"><div class="d-flex gap-2 flex-wrap align-items-end"><div><label class="form-label">From</label><input name="from" type="date" class="form-control" value="' + escapeHtml(d.from) + '"></div><div><label class="form-label">To</label><input name="to" type="date" class="form-control" value="' + escapeHtml(d.to) + '"></div><button class="btn btn-dark" type="submit">Run report</button></div></form><div class="metrics-grid mb-4"><div class="metric-card"><div class="metric-icon brand">' + icon('calendar-check') + '</div><span class="metric-value">' + s.total_reservations + '</span><span class="metric-label">Reservations</span></div><div class="metric-card"><div class="metric-icon success">' + icon('check-circle') + '</div><span class="metric-value">' + s.attended + '</span><span class="metric-label">Checked in</span></div><div class="metric-card"><div class="metric-icon warning">' + icon('alert-circle') + '</div><span class="metric-value">' + s.no_shows + '</span><span class="metric-label">No-shows</span></div><div class="metric-card"><div class="metric-icon info">' + icon('activity') + '</div><span class="metric-value">' + s.average_occupancy_percent + '%</span><span class="metric-label">Avg occupancy</span></div></div><div class="content-grid two-column"><section class="section-card"><div class="section-card-header"><div><h2 class="section-card-title">Daily history</h2><p class="section-card-subtitle">Reservations and attendance by session date.</p></div></div><div class="table-responsive"><table class="table"><thead><tr><th>Date</th><th>Reservations</th><th>Attended</th><th>No-shows</th><th>Cancelled</th></tr></thead><tbody>' + (daily || '<tr><td colspan="5">No data in this range.</td></tr>') + '</tbody></table></div></section><aside class="content-grid"><section class="section-card"><h2 class="section-card-title">Most popular hour</h2><div class="display-6 fw-bold text-brand">' + escapeHtml(s.popular_hour ? s.popular_hour.start_time : '—') + '</div><p class="section-card-subtitle mb-0">' + (s.popular_hour ? s.popular_hour.reservations + ' non-cancelled reservations' : 'No booking data yet') + '</p></section><section class="section-card"><h2 class="section-card-title">Other totals</h2><div class="report-stat"><span>Cancelled</span><strong>' + s.cancelled + '</strong></div><div class="report-stat"><span>Still booked</span><strong>' + s.still_booked + '</strong></div></section></aside></div>');
    } catch (error) {
      $('#pageContent').html(emptyState('alert-circle','Unable to load report',Api.errorMessage(error)));
    }
  }

  function openForgotPasswordModal() {
    openModal('Forgot password', 'Account recovery', '<form id="forgotPasswordForm"><label class="form-label">Email or phone</label><input name="login" class="form-control" autocomplete="username" required><div class="form-text mt-2">If the account exists, a short-lived reset token will be created. In local debug mode the token is shown here for testing.</div></form>', '<button class="btn btn-light" data-bs-dismiss="modal" type="button">Cancel</button><button class="btn btn-brand" type="submit" form="forgotPasswordForm"><span class="button-label">Continue</span><span class="spinner-border spinner-border-sm ms-2 d-none"></span></button>');
  }

  function showResetPasswordForm(token) {
    openModal('Choose a new password', 'Account recovery', '<form id="resetPasswordForm"><div class="mb-3"><label class="form-label">Reset token</label><input name="token" class="form-control" value="' + escapeHtml(token || '') + '" required minlength="64" maxlength="64"></div><div><label class="form-label">New password</label><input name="password" type="password" class="form-control" minlength="8" required></div></form>', '<button class="btn btn-light" data-bs-dismiss="modal" type="button">Cancel</button><button class="btn btn-brand" type="submit" form="resetPasswordForm"><span class="button-label">Reset password</span><span class="spinner-border spinner-border-sm ms-2 d-none"></span></button>');
  }

  /* Admin settings */
  /* Admin settings */
  async function renderAdminSettings() {
    setPageMeta('Settings', 'Administrator');
    $('#pageContent').html(pageSkeleton());
    try {
      var response = await Api.get('/admin/settings');
      state.settings = response.data;
      $('#sidebarGymName, #mobileGymName').text(state.settings.gym_name || 'BE-FIT');
      var s = state.settings;
      $('#pageContent').html('<div class="content-grid two-column"><section class="section-card"><div class="section-card-header"><div><h2 class="section-card-title">Gym & booking rules</h2><p class="section-card-subtitle">These rules are enforced by the API, not only by the frontend.</p></div></div><form id="settingsForm"><div class="row g-3"><div class="col-12"><label class="form-label">Gym name</label><input name="gym_name" class="form-control" maxlength="180" required value="' + escapeHtml(s.gym_name) + '"></div><div class="col-sm-6"><label class="form-label">Default capacity</label><input name="default_capacity" type="number" min="1" max="100" class="form-control" required value="' + s.default_capacity + '"></div><div class="col-sm-6"><label class="form-label">Booking days ahead</label><input name="booking_days_ahead" type="number" min="0" max="365" class="form-control" value="' + s.booking_days_ahead + '"><div class="form-text">0 = no limit.</div></div><div class="col-sm-6"><label class="form-label">Booking cutoff (minutes)</label><input name="booking_cutoff_minutes" type="number" min="0" class="form-control" value="' + s.booking_cutoff_minutes + '"></div><div class="col-sm-6"><label class="form-label">Cancellation cutoff (minutes)</label><input name="cancellation_cutoff_minutes" type="number" min="0" class="form-control" value="' + s.cancellation_cutoff_minutes + '"></div><div class="col-12"><hr></div><div class="col-12"><div class="form-check form-switch mb-3"><input name="show_attendee_names" class="form-check-input" type="checkbox" id="showNames"' + (s.show_attendee_names ? ' checked' : '') + '><label class="form-check-label" for="showNames">Show attendee names to other members</label><div class="form-text">Recommended off for member privacy. Occupancy counts remain visible.</div></div><div class="form-check form-switch mb-3"><input name="waitlist_enabled" class="form-check-input" type="checkbox" id="waitlistEnabled"' + (s.waitlist_enabled ? ' checked' : '') + '><label class="form-check-label" for="waitlistEnabled">Enable waiting list for full sessions</label></div><div class="form-check form-switch"><input name="auto_promote_waitlist" class="form-check-input" type="checkbox" id="autoPromote"' + (s.auto_promote_waitlist ? ' checked' : '') + '><label class="form-check-label" for="autoPromote">Automatically give cancelled spots to the first waiting member</label></div></div></div><button class="btn btn-brand mt-4" type="submit"><span class="button-label">Save settings</span><span class="spinner-border spinner-border-sm ms-2 d-none"></span></button></form></section><aside class="content-grid"><section class="section-card"><div class="d-flex gap-3"><div class="announcement-banner-icon">' + icon('shield') + '</div><div><h2 class="section-card-title mb-1">Privacy default</h2><p class="section-card-subtitle">Member names are hidden by default. Turn them on only if the gym has decided this is appropriate.</p></div></div></section><section class="section-card"><div class="d-flex gap-3"><div class="announcement-banner-icon">' + icon('clock') + '</div><div><h2 class="section-card-title mb-1">Suggested starting rules</h2><p class="section-card-subtitle mb-0">30 days ahead, booking closes 60 minutes before and cancellation closes 120 minutes before. There is no daily or active-booking quantity limit.</p></div></div></section></aside></div>');
    } catch (error) {
      $('#pageContent').html(emptyState('alert-circle','Unable to load settings',Api.errorMessage(error)));
    }
  }

  /* Modal and confirm helpers */
  function openModal(title, eyebrow, body, footer, sizeClass) {
    $('#appModalTitle').text(title);
    $('#appModalEyebrow').text(eyebrow || '');
    $('#appModalBody').html(body || '');
    $('#appModalFooter').html(footer || '');
    $('#appModalDialog').attr('class', 'modal-dialog modal-dialog-centered modal-dialog-scrollable' + (sizeClass ? ' ' + sizeClass : ''));
    appModal.show();
    hydrateIcons('#appModal');
    if (I18n) I18n.apply(document.getElementById('appModal'));
  }

  function confirmAction(title, message, buttonLabel, danger) {
    $('#confirmTitle').text(title || 'Are you sure?');
    $('#confirmMessage').text(message || 'This action cannot be undone.');
    $('#confirmActionButton').text(buttonLabel || 'Confirm').toggleClass('btn-danger', danger !== false).toggleClass('btn-brand', danger === false);
    confirmModal.show();
    return new Promise(function (resolve) { state.confirmResolver = resolve; });
  }

  function serializeForm($form) {
    var result = {};
    $form.serializeArray().forEach(function (item) { result[item.name] = item.value; });
    return result;
  }

  /* Global events */
  function generateTemporaryPassword(length) {
    length = length || 12;
    var upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    var lower = 'abcdefghijkmnopqrstuvwxyz';
    var digits = '23456789';
    var all = upper + lower + digits;
    var chars = [upper[Math.floor(Math.random()*upper.length)], lower[Math.floor(Math.random()*lower.length)], digits[Math.floor(Math.random()*digits.length)]];
    while (chars.length < length) chars.push(all[Math.floor(Math.random()*all.length)]);
    for (var i = chars.length - 1; i > 0; i -= 1) { var j = Math.floor(Math.random()*(i+1)); var tmp=chars[i]; chars[i]=chars[j]; chars[j]=tmp; }
    return chars.join('');
  }

  function bindGlobalEvents() {
    window.addEventListener('hashchange', route);

    $(document).on('befit:unauthorized', function () {
      Api.clearSession();
      state.user = null;
      toast('Your session has expired. Please sign in again.', 'danger');
      showLogin();
    });

    $('#loginForm').on('submit', async function (event) {
      event.preventDefault();
      var $button = $('#loginButton');
      var login = $('#loginInput').val().trim();
      var password = $('#passwordInput').val();
      $('#loginError').addClass('d-none').empty();
      if (!login || !password) {
        $('#loginError').removeClass('d-none').text('Enter your email/phone and password.');
        return;
      }
      setBusy($button, true, 'Signing in…');
      try {
        var response = await Api.post('/auth/login', { login: login, password: password }, { auth: false });
        Api.setToken(response.data.token);
        saveUser(response.data.user);
        $('#passwordInput').val('');
        window.location.hash = state.user.must_change_password ? '#/profile' : (state.user.role === 'admin' ? '#/admin/dashboard' : '#/schedule');
        showApp();
      } catch (error) {
        $('#loginError').removeClass('d-none').text(Api.errorMessage(error));
      } finally {
        setBusy($button, false, 'Sign in');
      }
    });

    $(document).on('click', '[data-forgot-password]', openForgotPasswordModal);
    $(document).on('submit', '#forgotPasswordForm', async function (event) {
      event.preventDefault();
      var $form=$(this),$button=$('#appModalFooter button[type=submit]');
      setBusy($button,true,'Creating…');
      try {
        var response=await Api.post('/auth/forgot-password',serializeForm($form),{auth:false});
        var token=response.data&&response.data.dev_reset_token ? response.data.dev_reset_token : '';
        if(token){ toast('Local debug reset token created.','success'); showResetPasswordForm(token); }
        else { appModal.hide(); toast('If the account exists, reset instructions have been sent or created.','success'); }
      } catch(e){ toast(Api.errorMessage(e),'danger'); }
      finally{ setBusy($button,false,'Continue'); }
    });
    $(document).on('submit', '#resetPasswordForm', async function (event) {
      event.preventDefault();
      var $form=$(this),$button=$('#appModalFooter button[type=submit]');
      setBusy($button,true,'Resetting…');
      try { await Api.post('/auth/reset-password',serializeForm($form),{auth:false}); appModal.hide(); window.location.hash=''; toast('Password reset. You can now sign in.','success'); }
      catch(e){ toast(Api.errorMessage(e),'danger'); }
      finally{ setBusy($button,false,'Reset password'); }
    });

    $(document).on('click', '[data-toggle-password]', function () {
      var selector = $(this).attr('data-toggle-password');
      var $input = $(selector);
      var show = $input.attr('type') === 'password';
      $input.attr('type', show ? 'text' : 'password');
      $(this).html(icon(show ? 'eye-off' : 'eye'));
    });

    $(document).on('click', '[data-route]', function (event) {
      var routeValue = $(this).attr('data-route');
      if (!routeValue) return;
      event.preventDefault();
      window.location.hash = routeValue;
    });

    $(document).on('click', '[data-logout], #mobileLogoutButton', logout);
    $(document).on('click', '#installAppButton, #profileInstallButton', installPwa);
    $(document).on('click', '[data-retry-route]', route);

    $('#confirmActionButton').on('click', function () {
      if (state.confirmResolver) state.confirmResolver(true);
      state.confirmResolver = null;
      confirmModal.hide();
    });
    document.getElementById('confirmModal').addEventListener('hidden.bs.modal', function () {
      if (state.confirmResolver) state.confirmResolver(false);
      state.confirmResolver = null;
    });

    $(document).on('click', '[data-week-shift]', function () {
      state.weekDate = addDays(state.currentSchedule ? state.currentSchedule.week_start : state.weekDate, Number($(this).attr('data-week-shift')));
      state.selectedDate = null;
      renderSchedulePage();
    });
    $(document).on('click', '[data-schedule-day]', function () { state.selectedDate = $(this).attr('data-schedule-day'); drawSchedule(); });
    $(document).on('click', '[data-go-today]', function () { state.weekDate = todayYmd(); state.selectedDate = todayYmd(); renderSchedulePage(); });

    $(document).on('click', '[data-book-session]', async function () {
      var sessionId = Number($(this).attr('data-book-session'));
      if (!(await confirmAction('Reserve this session?', 'Your name will be added to this training time.', 'Reserve place', false))) return;
      showLoader(true);
      try { await Api.post('/bookings', { session_id: sessionId }); toast('Your place has been reserved.', 'success'); if (state.route === '#/schedule') await renderSchedulePage({ silent: true }); else await renderMyBookings(); }
      catch (error) { toast(Api.errorMessage(error), 'danger'); }
      finally { showLoader(false); }
    });

    $(document).on('click', '[data-cancel-booking]', async function () {
      var id = Number($(this).attr('data-cancel-booking'));
      if (!(await confirmAction('Cancel this booking?', 'The place will immediately become available to another member.', 'Cancel booking', true))) return;
      showLoader(true);
      try { await Api.delete('/bookings/' + id); toast('Booking cancelled.', 'success'); if (state.route === '#/schedule') await renderSchedulePage({ silent: true }); else await renderMyBookings(); }
      catch (error) { toast(Api.errorMessage(error), 'danger'); }
      finally { showLoader(false); }
    });


    $(document).on('click', '[data-join-waitlist]', async function () {
      var sessionId = Number($(this).attr('data-join-waitlist'));
      if (!(await confirmAction('Join the waiting list?', 'If automatic promotion is enabled, the first waiting member receives a cancelled place.', 'Join waiting list', false))) return;
      showLoader(true);
      try { await Api.post('/waitlist', { session_id: sessionId }); toast('You joined the waiting list.', 'success'); await renderSchedulePage({ silent: true }); }
      catch (error) { toast(Api.errorMessage(error), 'danger'); }
      finally { showLoader(false); }
    });

    $(document).on('click', '[data-leave-waitlist]', async function () {
      var id = Number($(this).attr('data-leave-waitlist'));
      if (!(await confirmAction('Leave the waiting list?', 'You will lose your current place in the queue.', 'Leave waiting list', true))) return;
      showLoader(true);
      try { await Api.delete('/waitlist/' + id); toast('You left the waiting list.', 'success'); await renderSchedulePage({ silent: true }); }
      catch (error) { toast(Api.errorMessage(error), 'danger'); }
      finally { showLoader(false); }
    });

    $(document).on('submit', '#profileForm', async function (event) {
      event.preventDefault();
      var $form = $(this), $button = $form.find('button[type=submit]');
      setBusy($button, true, 'Saving…');
      try { var response = await Api.put('/profile', serializeForm($form)); saveUser(response.data); toast('Profile updated.', 'success'); }
      catch (error) { toast(Api.errorMessage(error), 'danger'); }
      finally { setBusy($button, false, 'Save profile'); }
    });

    $(document).on('submit', '#passwordForm', async function (event) {
      event.preventDefault();
      var $form = $(this), $button = $form.find('button[type=submit]');
      setBusy($button, true, 'Changing…');
      try {
        await Api.put('/profile/password', serializeForm($form));
        Api.clearSession();
        state.user = null;
        appModal.hide();
        toast('Password changed. Sign in again with your new password.', 'success');
        showLogin();
      } catch (error) { toast(Api.errorMessage(error), 'danger'); }
      finally { setBusy($button, false, 'Change password'); }
    });

    $(document).on('change', '#dashboardDate', function () { renderAdminDashboard($(this).val()); });
    $(document).on('submit', '#reportRangeForm', function (event) { event.preventDefault(); renderAdminReports(serializeForm($(this))); });

    $(document).on('submit', '#memberFilters', function (event) {
      event.preventDefault(); var q = serializeForm($(this)); q.page = 1; q.per_page = 25; renderAdminMembers(q);
    });
    $(document).on('click', '[data-page-scope="users"]', function () {
      var q = serializeForm($('#memberFilters')); q.page = Number($(this).attr('data-page')); q.per_page = 25; renderAdminMembers(q);
    });
    $(document).on('click', '[data-admin-new-user]', function () { openUserModal(); });
    $(document).on('click', '[data-user-edit]', function () { openUserModal(Number($(this).attr('data-user-edit'))); });
    $(document).on('click', '[data-user-payment]', function () { openPaymentModal(Number($(this).attr('data-user-payment'))); });
    $(document).on('click', '[data-generate-password]', function () { var value=generateTemporaryPassword(12); $('#userModalForm [name=password]').val(value).trigger('focus'); toast(t('Password generated.'), 'success'); });
    $(document).on('click', '[data-copy-password]', async function () { var $input=$('#userModalForm [name=password]'); var value=$input.val(); if(!value){ value=generateTemporaryPassword(12); $input.val(value); } try { if(navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value); else { $input.trigger('select'); document.execCommand('copy'); } toast(t('Password copied.'),'success'); } catch(e){ toast(t('Could not copy automatically. Select and copy the password manually.'),'info'); } });
    $(document).on('submit', '#userModalForm', async function (event) {
      event.preventDefault();
      var $form = $(this), id = Number($form.attr('data-user-id')) || null, data = serializeForm($form), $button = $('#appModalFooter button[type=submit]');
      if (!data.email) data.email = null; if (!data.phone) data.phone = null; if (id && !data.password) delete data.password; data.must_change_password = $form.find('[name=must_change_password]').is(':checked');
      setBusy($button, true, 'Saving…');
      try { if (id) await Api.put('/admin/users/' + id, data); else await Api.post('/admin/users', data); appModal.hide(); toast(id ? 'Member updated.' : 'Member created.', 'success'); if (state.route === '#/admin/members') renderAdminMembers({ page: 1, per_page: 25 }); else if (state.route === '#/admin/dashboard') renderAdminDashboard(); }
      catch (error) { toast(Api.errorMessage(error), 'danger'); }
      finally { setBusy($button, false, id ? 'Save changes' : 'Create member'); }
    });

    $(document).on('submit', '#paymentModalForm', async function (event) {
      event.preventDefault();
      var $form=$(this), userId=Number($form.attr('data-user-id')), data=serializeForm($form), $button=$('#appModalFooter button[type=submit]');
      setBusy($button,true,t('Saving…'));
      try { await Api.post('/admin/users/'+userId+'/payments',data); appModal.hide(); toast(t('Payment recorded successfully.'),'success'); if(state.route==='#/admin/members') renderAdminMembers(serializeForm($('#memberFilters'))); }
      catch(e){ toast(Api.errorMessage(e),'danger'); }
      finally{ setBusy($button,false,t('Save payment')); }
    });

    $(document).on('click', '[data-admin-schedule-tab]', function () { state.adminScheduleTab = $(this).attr('data-admin-schedule-tab'); loadAdminScheduleTab(); });
    $(document).on('click', '[data-template-new]', function () { openTemplateModal(); });
    $(document).on('click', '[data-template-edit]', function () { openTemplateModal(JSON.parse(decodeURIComponent($(this).attr('data-template-json')))); });
    $(document).on('submit', '#templateModalForm', async function (event) {
      event.preventDefault(); var $form = $(this), id = Number($form.attr('data-template-id')) || null, data = serializeForm($form), $button = $('#appModalFooter button[type=submit]');
      data.weekday = Number(data.weekday); data.capacity = Number(data.capacity); data.is_active = $form.find('[name=is_active]').is(':checked'); if (!data.end_time) data.end_time = null;
      setBusy($button, true, 'Saving…');
      try { if (id) await Api.put('/admin/schedule/templates/' + id, data); else await Api.post('/admin/schedule/templates', data); appModal.hide(); toast('Time slot saved.', 'success'); loadTemplates(); }
      catch (error) { toast(Api.errorMessage(error), 'danger'); }
      finally { setBusy($button, false, 'Save time slot'); }
    });
    $(document).on('click', '[data-template-delete]', async function () { var id = Number($(this).attr('data-template-delete')); if (!(await confirmAction('Deactivate time slot?', 'Future weeks will no longer create this recurring session. Existing dated sessions are not deleted.', 'Deactivate', true))) return; try { await Api.delete('/admin/schedule/templates/' + id); toast('Time slot deactivated.', 'success'); loadTemplates(); } catch (e) { toast(Api.errorMessage(e),'danger'); } });

    $(document).on('submit', '#sessionRangeForm, #closureRangeForm', function (event) { event.preventDefault(); var q = serializeForm($(this)); state.adminScheduleRange = { from: q.from, to: q.to }; loadAdminScheduleTab(); });
    $(document).on('click', '[data-session-new]', function () { openSessionModal(); });
    $(document).on('click', '[data-session-edit]', function () { openSessionModal(JSON.parse(decodeURIComponent($(this).attr('data-session-json')))); });
    $(document).on('submit', '#sessionModalForm', async function (event) {
      event.preventDefault(); var $form = $(this), id = Number($form.attr('data-session-id')) || null, data = serializeForm($form), $button = $('#appModalFooter button[type=submit]'); data.capacity = Number(data.capacity); if (!data.end_time) data.end_time = null; if (!data.note) data.note = null;
      setBusy($button, true, 'Saving…');
      try { if (id) await Api.put('/admin/schedule/sessions/' + id, data); else await Api.post('/admin/schedule/sessions', data); appModal.hide(); toast('Session saved.', 'success'); loadSessions(); }
      catch (error) { toast(Api.errorMessage(error),'danger'); }
      finally { setBusy($button, false, 'Save session'); }
    });
    $(document).on('click', '[data-closure-new]', openClosureModal);
    $(document).on('submit', '#closureModalForm', async function (event) { event.preventDefault(); var $form=$(this), data=serializeForm($form), $button=$('#appModalFooter button[type=submit]'); if(!data.reason) data.reason=null; setBusy($button,true,'Closing…'); try{ await Api.post('/admin/schedule/closures',data); appModal.hide(); toast('Date marked as closed.','success'); loadClosures(); }catch(e){toast(Api.errorMessage(e),'danger');}finally{setBusy($button,false,'Close date');} });
    $(document).on('click', '[data-closure-delete]', async function () { var id=Number($(this).attr('data-closure-delete')); if(!(await confirmAction('Reopen this date?','Removing the closure makes its sessions available again according to their individual status.','Remove closure',true))) return; try{await Api.delete('/admin/schedule/closures/'+id);toast('Closure removed.','success');loadClosures();}catch(e){toast(Api.errorMessage(e),'danger');} });

    $(document).on('submit', '#adminBookingFilters', function (event) { event.preventDefault(); var q=serializeForm($(this)); q.page=1;q.per_page=25;renderAdminBookings(q); });
    $(document).on('click', '[data-page-scope="bookings"]', function () { var q=serializeForm($('#adminBookingFilters'));q.page=Number($(this).attr('data-page'));q.per_page=25;renderAdminBookings(q); });
    $(document).on('click', '[data-admin-new-booking]', openAdminBookingModal);
    $(document).on('submit', '#adminBookingModalForm', async function (event) { event.preventDefault(); var $form=$(this), data=serializeForm($form), $button=$('#appModalFooter button[type=submit]'); data.user_id=Number(data.user_id);data.session_id=Number(data.session_id);setBusy($button,true,'Creating…');try{await Api.post('/admin/bookings',data);appModal.hide();toast('Booking created.','success');if(state.route==='#/admin/bookings')renderAdminBookings();else if(state.route==='#/admin/dashboard')renderAdminDashboard();}catch(e){toast(Api.errorMessage(e),'danger');}finally{setBusy($button,false,'Create booking');} });
    $(document).on('click', '[data-admin-booking-cancel]', async function () { var id=Number($(this).attr('data-admin-booking-cancel'));if(!(await confirmAction('Cancel this member booking?','The reservation will be marked cancelled and the place becomes available.','Cancel booking',true)))return;try{await Api.delete('/admin/bookings/'+id);toast('Booking cancelled.','success');renderAdminBookings();}catch(e){toast(Api.errorMessage(e),'danger');} });

    $(document).on('change', '[data-admin-attendance-id]', async function () { var $select=$(this),id=Number($select.attr('data-admin-attendance-id')),status=$select.val();$select.prop('disabled',true);try{await Api.patch('/admin/bookings/'+id+'/attendance',{status:status});toast('Attendance updated.','success');renderAdminBookings(serializeForm($('#adminBookingFilters')));}catch(e){toast(Api.errorMessage(e),'danger');renderAdminBookings(serializeForm($('#adminBookingFilters')));} });

    $(document).on('click', '[data-notification-read]', async function(){try{await Api.patch('/notifications/'+Number($(this).attr('data-notification-read'))+'/read',{});renderNotificationsPage();}catch(e){toast(Api.errorMessage(e),'danger');}});
    $(document).on('click', '[data-notifications-read-all]', async function(){try{await Api.patch('/notifications/read-all',{});renderNotificationsPage();}catch(e){toast(Api.errorMessage(e),'danger');}});

    $(document).on('click', '[data-announcement-new]', function(){openAnnouncementModal();});
    $(document).on('click', '[data-announcement-edit]', function(){openAnnouncementModal(Number($(this).attr('data-announcement-edit')));});
    $(document).on('submit', '#announcementModalForm', async function(event){event.preventDefault();var $form=$(this),id=Number($form.attr('data-announcement-id'))||null,data=serializeForm($form),$button=$('#appModalFooter button[type=submit]');data.is_active=$form.find('[name=is_active]').is(':checked');if(data.starts_at)data.starts_at=fromInputDateTime(data.starts_at);else delete data.starts_at;if(data.expires_at)data.expires_at=fromInputDateTime(data.expires_at);else data.expires_at=null;setBusy($button,true,'Saving…');try{if(id)await Api.put('/admin/announcements/'+id,data);else await Api.post('/admin/announcements',data);appModal.hide();toast('Announcement saved.','success');renderAdminAnnouncements();}catch(e){toast(Api.errorMessage(e),'danger');}finally{setBusy($button,false,'Save announcement');}});
    $(document).on('click', '[data-announcement-delete]', async function(){var id=Number($(this).attr('data-announcement-delete'));if(!(await confirmAction('Delete announcement?','Members will no longer see this notice.','Delete',true)))return;try{await Api.delete('/admin/announcements/'+id);toast('Announcement deleted.','success');renderAdminAnnouncements();}catch(e){toast(Api.errorMessage(e),'danger');}});

    $(document).on('submit', '#settingsForm', async function(event){event.preventDefault();var $form=$(this),data=serializeForm($form),$button=$form.find('button[type=submit]');['default_capacity','booking_days_ahead','booking_cutoff_minutes','cancellation_cutoff_minutes'].forEach(function(k){data[k]=Number(data[k]);});data.show_attendee_names=$form.find('[name=show_attendee_names]').is(':checked');data.waitlist_enabled=$form.find('[name=waitlist_enabled]').is(':checked');data.auto_promote_waitlist=$form.find('[name=auto_promote_waitlist]').is(':checked');setBusy($button,true,'Saving…');try{var response=await Api.put('/admin/settings',data);state.settings=response.data;$('#sidebarGymName,#mobileGymName').text(state.settings.gym_name);toast('Settings updated.','success');}catch(e){toast(Api.errorMessage(e),'danger');}finally{setBusy($button,false,'Save settings');}});
  }

  async function logout() {
    if (!Api.getToken()) { showLogin(); return; }
    showLoader(true);
    try { await Api.post('/auth/logout', {}); }
    catch (e) { /* local session is still cleared */ }
    finally {
      Api.clearSession();
      state.user = null;
      state.currentSchedule = null;
      state.weekDate = null;
      state.selectedDate = null;
      window.location.hash = '';
      closeMobileDrawer();
      showLoader(false);
      showLogin();
    }
  }

  function registerPwa() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('./service-worker.js').catch(function () { /* HTTP .test local development may not support service workers */ });
      });
    }
    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      state.deferredInstallPrompt = event;
      $('#installAppButton, #profileInstallButton').removeClass('d-none');
    });
    window.addEventListener('appinstalled', function () {
      state.deferredInstallPrompt = null;
      $('#installAppButton, #profileInstallButton').addClass('d-none');
      toast('BE-FIT was installed successfully.', 'success');
    });
  }

  async function installPwa() {
    if (!state.deferredInstallPrompt) {
      toast('Installation becomes available when the app is served over HTTPS and your browser supports PWA installation.', 'info');
      return;
    }
    state.deferredInstallPrompt.prompt();
    await state.deferredInstallPrompt.userChoice;
    state.deferredInstallPrompt = null;
    $('#installAppButton, #profileInstallButton').addClass('d-none');
  }

  $(boot);
})(window, document, jQuery);
