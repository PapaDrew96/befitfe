(function (window, document, $) {
  'use strict';

  window.BefitChunkFactories = window.BefitChunkFactories || {};

  window.BefitChunkFactories.member = function (ctx) {
    var Api = ctx.Api;
    var config = ctx.config;
    var I18n = ctx.I18n;
    var state = ctx.state;
    var t = ctx.t;
    var icon = ctx.icon;
    var hydrateIcons = ctx.hydrateIcons;
    var escapeHtml = ctx.escapeHtml;
    var initials = ctx.initials;
    var todayYmd = ctx.todayYmd;
    var pad = ctx.pad;
    var parseYmd = ctx.parseYmd;
    var ymd = ctx.ymd;
    var addDays = ctx.addDays;
    var formatDate = ctx.formatDate;
    var formatDateTime = ctx.formatDateTime;
    var formatWeekRange = ctx.formatWeekRange;
    var isFutureSession = ctx.isFutureSession;
    var toInputDateTime = ctx.toInputDateTime;
    var fromInputDateTime = ctx.fromInputDateTime;
    var setBusy = ctx.setBusy;
    var showLoader = ctx.showLoader;
    var toast = ctx.toast;
    var emptyState = ctx.emptyState;
    var pageSkeleton = ctx.pageSkeleton;
    var setPageMeta = ctx.setPageMeta;
    var saveUser = ctx.saveUser;
    var refreshUserChrome = ctx.refreshUserChrome;
    var closeMobileDrawer = ctx.closeMobileDrawer;
    var loadSelect2Assets = ctx.loadSelect2Assets;
    var initSelect2 = ctx.initSelect2;
    var paymentStatusBadge = ctx.paymentStatusBadge;
    var announcementCard = ctx.announcementCard;
    var openModal = ctx.openModal;
    var confirmAction = ctx.confirmAction;
    var serializeForm = ctx.serializeForm;
    var generateTemporaryPassword = ctx.generateTemporaryPassword;
    var route = ctx.route;

  /* Member schedule */
  async function renderSchedulePage(options) {
    options = options || {};

    setPageMeta(
      'Schedule',
      'Member'
    );

    if (!state.weekDate) {
      state.weekDate = todayYmd();
    }

    if (!options.silent) {
      $('#pageContent').html(
        pageSkeleton()
      );
    }

    var version =
      state.routeVersion;

    try {
      var results =
        await Promise.all([
          Api.get(
            '/schedule/week',
            {
              date: state.weekDate
            }
          ),
          Api.get(
            '/announcements'
          )
        ]);

      if (
        version !== state.routeVersion ||
        state.route !== '#/schedule'
      ) {
        return;
      }

      state.currentSchedule =
        results[0].data;

      state.announcements =
        results[1].data || [];

      state.weekDate =
        state.currentSchedule.week_start;

      var availableDates =
        state.currentSchedule.days.map(
          function (d) {
            return d.date;
          }
        );

      if (
        !state.selectedDate ||
        availableDates.indexOf(
          state.selectedDate
        ) === -1
      ) {
        state.selectedDate =
          availableDates.indexOf(
            todayYmd()
          ) !== -1
            ? todayYmd()
            : state.currentSchedule.week_start;
      }

      drawSchedule();

    } catch (error) {
      $('#pageContent').html(
        emptyState(
          'alert-circle',
          'Unable to load schedule',
          Api.errorMessage(error),
          '<button class="btn btn-brand" data-retry-route type="button">Try again</button>'
        )
      );
    }
  }

  function drawSchedule() {
    var schedule =
      state.currentSchedule;

    if (!schedule) {
      return;
    }

    var selected =
      schedule.days.find(
        function (day) {
          return day.date ===
            state.selectedDate;
        }
      ) ||
      schedule.days[0];

    var announcement =
      state.announcements &&
      state.announcements.length
        ? state.announcements[0]
        : null;

    var daysHtml =
      schedule.days.map(
        function (day) {
          var d =
            parseYmd(day.date);

          var active =
            day.date === selected.date
              ? ' active'
              : '';

          var closed =
            day.is_closed
              ? ' closed'
              : '';

          return '' +
            '<button type="button" class="day-button' + active + closed + '" data-schedule-day="' + day.date + '">' +
              '<span class="day-name">' +
                escapeHtml(
                  new Intl.DateTimeFormat(
                    config.DATE_LOCALE,
                    {
                      weekday: 'short'
                    }
                  ).format(d)
                ) +
              '</span>' +
              '<span class="day-number">' +
                d.getDate() +
              '</span>' +
              '<span class="day-dot"></span>' +
            '</button>';
        }
      ).join('');

    var sessionsHtml = '';

    if (selected.is_closed) {
      sessionsHtml +=
        '<div class="closed-notice">' +
          '<strong>Gym closed</strong>' +
          '<div class="small mt-1">' +
            escapeHtml(
              selected.closure_reason ||
              'No sessions are available on this date.'
            ) +
          '</div>' +
        '</div>';
    }

    if (!selected.sessions.length) {
      sessionsHtml +=
        emptyState(
          'calendar',
          'No sessions',
          selected.is_closed
            ? 'The gym is closed on this date.'
            : 'There are no training sessions scheduled for this day.'
        );

    } else {
      sessionsHtml +=
        '<div class="sessions-list">' +
          selected.sessions
            .map(sessionCard)
            .join('') +
        '</div>';
    }

    var announcementHtml =
      announcement
        ? '' +
          '<div class="announcement-banner mb-3">' +
            '<div class="announcement-banner-icon">' +
              icon('megaphone') +
            '</div>' +
            '<div class="min-w-0">' +
              '<h3>' +
                escapeHtml(
                  announcement.title
                ) +
              '</h3>' +
              '<p>' +
                escapeHtml(
                  announcement.body
                ) +
              '</p>' +
            '</div>' +
            '<button class="btn btn-sm btn-light ms-auto flex-shrink-0" type="button" data-route="#/announcements">' +
              'View' +
            '</button>' +
          '</div>'
        : '';

    $('#pageContent').html(
      '<div class="content-grid">' +

        '<section class="week-picker">' +

          '<div class="week-picker-top">' +

            '<button class="week-nav-btn" type="button" data-week-shift="-7" aria-label="Previous week">' +
              icon('chevron-left') +
            '</button>' +

            '<div class="text-center">' +
              '<div class="eyebrow text-white-50 mb-1">' +
                'Weekly program' +
              '</div>' +
              '<div class="week-range">' +
                escapeHtml(
                  formatWeekRange(
                    schedule.week_start,
                    schedule.week_end
                  )
                ) +
              '</div>' +
            '</div>' +

            '<button class="week-nav-btn" type="button" data-week-shift="7" aria-label="Next week">' +
              icon('chevron-right') +
            '</button>' +

          '</div>' +

          '<div class="day-strip">' +
            daysHtml +
          '</div>' +

        '</section>' +

        announcementHtml +

        '<section>' +

          '<div class="schedule-header">' +

            '<div>' +
              '<h2>' +
                escapeHtml(
                  formatDate(
                    selected.date,
                    {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    }
                  )
                ) +
              '</h2>' +

              '<p>' +
                (
                  selected.sessions.length
                    ? selected.sessions.length +
                      ' sessions available'
                    : 'No scheduled sessions'
                ) +
              '</p>' +
            '</div>' +

            (
              selected.date !==
              todayYmd()
                ? '<button class="btn btn-sm btn-soft" type="button" data-go-today>' +
                    icon('calendar') +
                    ' Today' +
                  '</button>'
                : ''
            ) +

          '</div>' +

          sessionsHtml +

        '</section>' +

      '</div>'
    );
  }

  function sessionCard(session) {
    var percent =
      session.capacity
        ? Math.min(
            100,
            Math.round(
              (
                session.booked_count /
                session.capacity
              ) *
              100
            )
          )
        : 0;

    var classes =
      'session-card' +
      (
        session.is_booked_by_me
          ? ' is-mine'
          : ''
      ) +
      (
        session.status !== 'open'
          ? ' is-closed'
          : ''
      );

    var statusBadge =
      session.status !== 'open'
        ? '<span class="badge-soft-danger">' +
            escapeHtml(
              session.status === 'cancelled'
                ? 'Cancelled'
                : 'Closed'
            ) +
          '</span>'
        : session.is_full
          ? '<span class="badge-soft-danger">Full</span>'
          : session.is_booked_by_me
            ? '<span class="badge-soft-brand">' +
                icon('check', 'me-1') +
                ' Your booking' +
              '</span>'
            : '<span class="badge-soft-success">' +
                session.available_count +
                ' places left' +
              '</span>';

    var attendees =
      session.attendees &&
      session.attendees.length
        ? '<div class="attendee-list">' +
            session.attendees.map(
              function (person) {
                return '' +
                  '<span class="attendee-chip' +
                    (
                      person.user_id ===
                      state.user.id
                        ? ' me'
                        : ''
                    ) +
                  '">' +
                    escapeHtml(
                      person.display_name
                    ) +
                  '</span>';
              }
            ).join('') +
          '</div>'
        : '';

    var action = '';

    if (
      session.is_booked_by_me &&
      session.my_booking_id
    ) {
      action =
        '<button class="btn btn-outline-danger btn-sm" type="button" data-cancel-booking="' +
          session.my_booking_id +
        '">' +
          'Cancel booking' +
        '</button>';

    } else if (
      session.is_waitlisted_by_me &&
      session.my_waitlist_id
    ) {
      action =
        '<button class="btn btn-outline-secondary btn-sm" type="button" data-leave-waitlist="' +
          session.my_waitlist_id +
        '">' +
          'Leave waiting list' +
        '</button>';

    } else if (
      session.booking_allowed
    ) {
      action =
        '<button class="btn btn-brand btn-sm" type="button" data-book-session="' +
          session.id +
        '">' +
          icon('plus') +
          ' Reserve place' +
        '</button>';

    } else if (
      session.waitlist_allowed
    ) {
      action =
        '<button class="btn btn-dark btn-sm" type="button" data-join-waitlist="' +
          session.id +
        '">' +
          icon('clock') +
          ' Join waiting list' +
        '</button>';

    } else if (
      session.is_full &&
      session.status === 'open'
    ) {
      action =
        '<button class="btn btn-light btn-sm" type="button" disabled>' +
          'Session full' +
        '</button>';
    }

    return '' +
      '<article class="' + classes + '">' +

        '<div class="session-main">' +

          '<div class="session-time">' +
            '<strong>' +
              escapeHtml(
                session.start_time
              ) +
            '</strong>' +
            '<small>' +
              (
                session.end_time
                  ? 'to ' +
                    escapeHtml(
                      session.end_time
                    )
                  : 'Training'
              ) +
            '</small>' +
          '</div>' +

          '<div class="session-details">' +

            '<div class="session-meta-row">' +
              statusBadge +
              (
                session.note
                  ? '<span class="badge-soft-muted">' +
                      escapeHtml(
                        session.note
                      ) +
                    '</span>'
                  : ''
              ) +
            '</div>' +

            '<div class="capacity-row">' +
              '<span>' +
                session.booked_count +
                ' booked' +
              '</span>' +
              '<span>' +
                session.booked_count +
                ' / ' +
                session.capacity +
              '</span>' +
            '</div>' +

            '<div class="capacity-track">' +
              '<div class="capacity-fill' +
                (
                  session.is_full
                    ? ' full'
                    : ''
                ) +
              '" style="width:' +
                percent +
              '%"></div>' +
            '</div>' +

            (
              session.waitlist_count
                ? '<div class="small text-muted mt-2">' +
                    session.waitlist_count +
                    ' on waiting list' +
                  '</div>'
                : ''
            ) +

            attendees +

          '</div>' +

        '</div>' +

        (
          session.closure_reason
            ? '<div class="small text-danger mt-2">' +
                escapeHtml(
                  session.closure_reason
                ) +
              '</div>'
            : ''
        ) +

        (
          action
            ? '<div class="session-actions">' +
                action +
              '</div>'
            : ''
        ) +

      '</article>';
  }

  /* Member bookings */
  async function renderMyBookings() {
    setPageMeta(
      'My bookings',
      'Member'
    );

    $('#pageContent').html(
      pageSkeleton()
    );

    var version =
      state.routeVersion;

    try {
      var response =
        await Api.get(
          '/bookings',
          {
            from: todayYmd(),
            to: addDays(
              todayYmd(),
              config.SCHEDULE_DAYS_AHEAD
            )
          }
        );

      if (
        version !==
        state.routeVersion
      ) {
        return;
      }

      var items =
        response.data || [];

      var active =
        items.filter(
          function (item) {
            return item.status ===
              'booked';
          }
        );

      var history =
        items.filter(
          function (item) {
            return item.status !==
              'booked';
          }
        );

      var html =
        '<div class="page-toolbar">' +

          '<div>' +
            '<h2 class="section-card-title">' +
              'Upcoming training' +
            '</h2>' +
            '<p class="section-card-subtitle">' +
              'Your confirmed reservations for the next ' +
              config.SCHEDULE_DAYS_AHEAD +
              ' days.' +
            '</p>' +
          '</div>' +

          '<button class="btn btn-brand" type="button" data-route="#/schedule">' +
            icon('plus') +
            ' Book a session' +
          '</button>' +

        '</div>';

      html +=
        active.length
          ? '<div class="booking-list">' +
              active.map(
                bookingCard
              ).join('') +
            '</div>'
          : emptyState(
              'calendar-check',
              'No upcoming bookings',
              'Choose a session from the weekly schedule.',
              '<button class="btn btn-brand" type="button" data-route="#/schedule">Open schedule</button>'
            );

      if (history.length) {
        html +=
          '<div class="mt-4">' +
            '<h3 class="section-card-title mb-3">' +
              'Attendance / history' +
            '</h3>' +
            '<div class="booking-list">' +
              history.map(
                bookingCard
              ).join('') +
            '</div>' +
          '</div>';
      }

      $('#pageContent').html(html);

    } catch (error) {
      $('#pageContent').html(
        emptyState(
          'alert-circle',
          'Unable to load bookings',
          Api.errorMessage(error),
          '<button class="btn btn-brand" data-retry-route type="button">Try again</button>'
        )
      );
    }
  }

  function bookingCard(booking) {
    var date =
      parseYmd(
        booking.date
      );

    var cancelled =
      booking.status ===
      'cancelled';

    return '' +
      '<article class="booking-card' +
        (
          cancelled
            ? ' cancelled'
            : ''
        ) +
      '">' +

        '<div class="booking-date-box">' +
          '<div>' +
            '<strong>' +
              date.getDate() +
            '</strong>' +
            '<span>' +
              escapeHtml(
                new Intl.DateTimeFormat(
                  config.DATE_LOCALE,
                  {
                    month: 'short'
                  }
                ).format(date)
              ) +
            '</span>' +
          '</div>' +
        '</div>' +

        '<div class="min-w-0">' +

          '<h3>' +
            escapeHtml(
              new Intl.DateTimeFormat(
                config.DATE_LOCALE,
                {
                  weekday: 'long'
                }
              ).format(date)
            ) +
            ' · ' +
            escapeHtml(
              booking.start_time
            ) +
          '</h3>' +

          '<p>' +
            escapeHtml(
              formatDate(
                booking.date
              )
            ) +
            (
              booking.end_time
                ? ' · ' +
                  escapeHtml(
                    booking.start_time +
                    '–' +
                    booking.end_time
                  )
                : ''
            ) +
          '</p>' +

          '<div class="mt-2">' +
            (
              booking.status ===
              'checked_in'
                ? '<span class="badge-soft-brand">Checked in</span>'
                : booking.status ===
                  'no_show'
                  ? '<span class="badge-soft-danger">No-show</span>'
                  : cancelled
                    ? '<span class="badge-soft-muted">Cancelled</span>'
                    : '<span class="badge-soft-success">Confirmed</span>'
            ) +
          '</div>' +

        '</div>' +

        '<div class="booking-action">' +
          (
            booking.status ===
            'booked' &&
            isFutureSession(
              booking.date,
              booking.start_time
            )
              ? '<button class="btn btn-outline-danger btn-sm" type="button" data-cancel-booking="' +
                  booking.id +
                '">' +
                  'Cancel' +
                '</button>'
              : ''
          ) +
        '</div>' +

      '</article>';
  }

  /* Announcements */
  /* Member payments */

  async function renderMyPayments() {
    setPageMeta(
      t('My payments'),
      t('Member')
    );

    $('#pageContent').html(
      pageSkeleton()
    );

    try {
      var response =
        await Api.get(
          '/payments'
        );

      var data =
        response.data || {};

      var history =
        data.history || [];

      var message =
        data.status === 'paid'
          ? 'Your payment is currently valid.'
          : data.status === 'expired'
            ? 'Your last recorded payment has expired.'
            : 'No payment has been recorded yet.';

      var rows =
        history.map(
          function (item) {
            return '' +
              '<tr>' +
                '<td>' +
                  escapeHtml(
                    formatDate(
                      item.payment_date
                    )
                  ) +
                '</td>' +
                '<td>' +
                  escapeHtml(
                    formatDate(
                      item.valid_until
                    )
                  ) +
                '</td>' +
                '<td>' +
                  escapeHtml(
                    item.confirmed_by_name ||
                    '—'
                  ) +
                '</td>' +
              '</tr>';
          }
        ).join('');

      $('#pageContent').html(
        '<div class="page-toolbar">' +
          '<div>' +
            '<h2 class="section-card-title">' +
              t('Membership payment') +
            '</h2>' +
            '<p class="section-card-subtitle">' +
              t(
                'Your membership payment status is managed by the gym administrator.'
              ) +
            '</p>' +
          '</div>' +
        '</div>' +

        '<div class="content-grid two-column">' +

          '<section class="section-card payment-current-card">' +

            '<div class="section-card-header">' +
              '<div>' +
                '<h2 class="section-card-title">' +
                  t('Current membership') +
                '</h2>' +
                '<p class="section-card-subtitle">' +
                  t(message) +
                '</p>' +
              '</div>' +

              paymentStatusBadge(
                data.status
              ) +

            '</div>' +

            '<div class="payment-validity">' +
              '<span>' +
                t('Paid until') +
              '</span>' +
              '<strong>' +
                (
                  data.paid_until
                    ? escapeHtml(
                        formatDate(
                          data.paid_until,
                          {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          }
                        )
                      )
                    : '—'
                ) +
              '</strong>' +
            '</div>' +

          '</section>' +

          '<section class="section-card">' +
            '<div class="d-flex gap-3 align-items-start">' +
              '<div class="announcement-banner-icon">' +
                icon('info') +
              '</div>' +
              '<div>' +
                '<h2 class="section-card-title mb-1">' +
                  t('Payment status') +
                '</h2>' +
                '<p class="section-card-subtitle mb-0">' +
                  t(
                    'This does not block bookings if the payment is expired.'
                  ) +
                '</p>' +
              '</div>' +
            '</div>' +
          '</section>' +

        '</div>' +

        '<section class="section-card mt-4">' +

          '<div class="section-card-header">' +
            '<div>' +
              '<h2 class="section-card-title">' +
                t('Payment history') +
              '</h2>' +
            '</div>' +
          '</div>' +

          '<div class="table-responsive">' +
            '<table class="table">' +

              '<thead>' +
                '<tr>' +
                  '<th>' +
                    t('Payment date') +
                  '</th>' +
                  '<th>' +
                    t('Valid until') +
                  '</th>' +
                  '<th>' +
                    t('Confirmed by') +
                  '</th>' +
                '</tr>' +
              '</thead>' +

              '<tbody>' +
                (
                  rows ||
                  '<tr>' +
                    '<td colspan="3">' +
                      t(
                        'No payment history yet.'
                      ) +
                    '</td>' +
                  '</tr>'
                ) +
              '</tbody>' +

            '</table>' +
          '</div>' +

        '</section>'
      );

    } catch (error) {
      $('#pageContent').html(
        emptyState(
          'alert-circle',
          t('Unable to load payments'),
          Api.errorMessage(error)
        )
      );
    }
  }

  async function renderAnnouncementsPage() {
    setPageMeta(
      'Announcements',
      'Member'
    );

    $('#pageContent').html(
      pageSkeleton()
    );

    try {
      var response =
        await Api.get(
          '/announcements'
        );

      var items =
        response.data || [];

      $('#pageContent').html(
        items.length
          ? '<div class="announcement-list">' +
              items.map(
                announcementCard
              ).join('') +
            '</div>'
          : emptyState(
              'bell',
              'No announcements',
              'The gym has not posted any active announcements.'
            )
      );

    } catch (error) {
      $('#pageContent').html(
        emptyState(
          'alert-circle',
          'Unable to load announcements',
          Api.errorMessage(error)
        )
      );
    }
  }

    return {
      renderSchedulePage: renderSchedulePage,
      drawSchedule: drawSchedule,
      renderMyBookings: renderMyBookings,
      renderMyPayments: renderMyPayments,
      renderAnnouncementsPage: renderAnnouncementsPage
    };
  };
})(window, document, jQuery);
