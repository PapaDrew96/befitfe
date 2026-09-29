(function (window, document, $) {
  'use strict';

  window.BefitChunkFactories = window.BefitChunkFactories || {};

  window.BefitChunkFactories.admin = function (ctx) {
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

  /* Admin dashboard */
  async function renderAdminDashboard(date) {
    date =
      date ||
      todayYmd();

    setPageMeta(
      'Dashboard',
      'Administrator'
    );

    $('#pageContent').html(
      pageSkeleton()
    );

    try {
      var response =
        await Api.get(
          '/admin/dashboard',
          {
            date: date
          }
        );

      var d =
        response.data;

      var next =
        d.next_session;

      var html =
        '<div class="page-toolbar">' +

          '<div>' +
            '<h2 class="section-card-title">' +
              escapeHtml(
                formatDate(
                  d.date,
                  {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }
                )
              ) +
            '</h2>' +
            '<p class="section-card-subtitle">' +
              'Daily overview of members and training sessions.' +
            '</p>' +
          '</div>' +

          '<div class="toolbar-actions">' +
            '<input id="dashboardDate" type="date" class="form-control" style="width:auto" value="' +
              escapeHtml(
                d.date
              ) +
            '">' +
          '</div>' +

        '</div>' +

        '<div class="metrics-grid mb-4">' +

          '<div class="metric-card">' +
            '<div class="metric-icon brand">' +
              icon('users') +
            '</div>' +
            '<span class="metric-value">' +
              d.active_members +
            '</span>' +
            '<span class="metric-label">' +
              'Active members' +
            '</span>' +
          '</div>' +

          '<div class="metric-card">' +
            '<div class="metric-icon success">' +
              icon('calendar-check') +
            '</div>' +
            '<span class="metric-value">' +
              d.bookings +
            '</span>' +
            '<span class="metric-label">' +
              'Bookings today' +
            '</span>' +
          '</div>' +

          '<div class="metric-card">' +
            '<div class="metric-icon info">' +
              icon('clock') +
            '</div>' +
            '<span class="metric-value">' +
              d.sessions_count +
            '</span>' +
            '<span class="metric-label">' +
              'Sessions today' +
            '</span>' +
          '</div>' +

          '<div class="metric-card">' +
            '<div class="metric-icon warning">' +
              icon('activity') +
            '</div>' +
            '<span class="metric-value">' +
              (
                next
                  ? escapeHtml(
                      next.start_time
                    )
                  : '—'
              ) +
            '</span>' +
            '<span class="metric-label">' +
              'Next open session' +
            '</span>' +
          '</div>' +

        '</div>' +

        '<div class="content-grid two-column">' +

          '<section class="section-card">' +

            '<div class="section-card-header">' +

              '<div>' +
                '<h2 class="section-card-title">' +
                  'Today\'s sessions' +
                '</h2>' +
                '<p class="section-card-subtitle">' +
                  'Live occupancy based on confirmed bookings.' +
                '</p>' +
              '</div>' +

              '<button class="btn btn-sm btn-soft" type="button" data-route="#/admin/bookings">' +
                'Manage bookings' +
              '</button>' +

            '</div>' +

            (
              d.sessions.length
                ? d.sessions.map(
                    function (s) {
                      var pct =
                        s.capacity
                          ? Math.round(
                              (
                                s.booked_count /
                                s.capacity
                              ) *
                              100
                            )
                          : 0;

                      return '' +
                        '<div class="dashboard-session-row">' +

                          '<div class="dashboard-session-time">' +
                            escapeHtml(
                              s.start_time
                            ) +
                          '</div>' +

                          '<div>' +
                            '<div class="capacity-row mb-1">' +
                              '<span>' +
                                escapeHtml(
                                  s.status
                                ) +
                              '</span>' +
                              '<span>' +
                                s.available_count +
                                ' available' +
                              '</span>' +
                            '</div>' +

                            '<div class="capacity-track">' +
                              '<div class="capacity-fill' +
                                (
                                  s.booked_count >=
                                  s.capacity
                                    ? ' full'
                                    : ''
                                ) +
                              '" style="width:' +
                                Math.min(
                                  100,
                                  pct
                                ) +
                              '%"></div>' +
                            '</div>' +

                          '</div>' +

                          '<div class="occupancy-pill">' +
                            s.booked_count +
                            ' / ' +
                            s.capacity +
                          '</div>' +

                        '</div>';
                    }
                  ).join('')
                : emptyState(
                    'calendar',
                    'No sessions today',
                    'There are no scheduled training sessions for this date.'
                  )
            ) +

          '</section>' +

          '<aside class="content-grid">' +

            '<section class="section-card">' +

              '<h2 class="section-card-title mb-2">' +
                'Quick actions' +
              '</h2>' +

              '<div class="d-grid gap-2">' +

                '<button class="btn btn-brand" type="button" data-admin-new-booking>' +
                  icon('plus') +
                  ' Add booking' +
                '</button>' +

                '<button class="btn btn-soft" type="button" data-admin-new-user>' +
                  icon('user-plus') +
                  ' Add member' +
                '</button>' +

                '<button class="btn btn-soft" type="button" data-route="#/admin/announcements">' +
                  icon('megaphone') +
                  ' Post announcement' +
                '</button>' +

                '<button class="btn btn-soft" type="button" data-route="#/admin/reports">' +
                  icon('activity') +
                  ' Attendance report' +
                '</button>' +

              '</div>' +

            '</section>' +

            '<section class="section-card">' +

              '<div class="d-flex gap-3 align-items-start">' +

                '<div class="announcement-banner-icon">' +
                  icon('info') +
                '</div>' +

                '<div>' +

                  '<h2 class="section-card-title mb-1">' +
                    'Capacity protection' +
                  '</h2>' +

                  '<p class="section-card-subtitle mb-0">' +
                    'The API validates each booking inside a database transaction, so a full session cannot be overbooked by simultaneous requests.' +
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
          'Unable to load dashboard',
          Api.errorMessage(error)
        )
      );
    }
  }

  /* Admin members */
  async function renderAdminMembers(query) {
    query =
      query || {
        page: 1,
        per_page: 25
      };

    setPageMeta(
      'Members',
      'Administrator'
    );

    $('#pageContent').html(
      pageSkeleton()
    );

    try {
      var response =
        await Api.get(
          '/admin/users',
          query
        );

      state.adminUsers =
        response.data;

      drawAdminMembers(query);

    } catch (error) {
      $('#pageContent').html(
        emptyState(
          'alert-circle',
          'Unable to load members',
          Api.errorMessage(error)
        )
      );
    }
  }

  function drawAdminMembers(query) {
    var data =
      state.adminUsers;

    var rows =
      data.items.map(
        function (u) {
          var payment =
            u.role === 'member'
              ? paymentStatusBadge(
                  u.payment_status
                )
              : '<span class="text-muted">—</span>';

          var paidUntil =
            u.role === 'member' &&
            u.paid_until
              ? formatDate(
                  u.paid_until,
                  {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }
                )
              : '—';

          return '' +
            '<tr>' +

              '<td>' +
                '<div class="d-flex align-items-center gap-2">' +
                  '<span class="avatar avatar-sm">' +
                    escapeHtml(
                      initials(u)
                    ) +
                  '</span>' +
                  '<div class="min-w-0">' +
                    '<strong class="d-block text-truncate">' +
                      escapeHtml(
                        u.display_name
                      ) +
                    '</strong>' +
                    '<small class="text-muted">' +
                      escapeHtml(
                        u.email ||
                        u.phone ||
                        ''
                      ) +
                    '</small>' +
                  '</div>' +
                '</div>' +
              '</td>' +

              '<td>' +
                '<span class="badge-soft-' +
                  (
                    u.role === 'admin'
                      ? 'brand'
                      : 'muted'
                  ) +
                ' text-capitalize">' +
                  escapeHtml(
                    u.role
                  ) +
                '</span>' +
              '</td>' +

              '<td>' +
                '<span class="badge-soft-' +
                  (
                    u.status === 'active'
                      ? 'success'
                      : 'danger'
                  ) +
                ' text-capitalize">' +
                  escapeHtml(
                    u.status
                  ) +
                '</span>' +
              '</td>' +

              '<td>' +
                payment +
                '<div class="small text-muted mt-1">' +
                  escapeHtml(
                    paidUntil
                  ) +
                '</div>' +
              '</td>' +

              '<td class="d-none d-lg-table-cell">' +
                escapeHtml(
                  u.phone || '—'
                ) +
              '</td>' +

              '<td class="d-none d-xl-table-cell">' +
                escapeHtml(
                  u.last_login_at
                    ? formatDateTime(
                        u.last_login_at
                      )
                    : t('Never')
                ) +
              '</td>' +

              '<td>' +

                '<div class="table-actions">' +

                  (
                    u.role === 'member'
                      ? '<button class="btn btn-light table-action-btn" type="button" data-user-payment="' +
                          u.id +
                        '" aria-label="' +
                          t(
                            'Edit / record payment'
                          ) +
                        '">' +
                          icon(
                            'credit-card'
                          ) +
                        '</button>'
                      : ''
                  ) +

                  '<button class="btn btn-light table-action-btn" type="button" data-user-edit="' +
                    u.id +
                  '" aria-label="' +
                    t(
                      'Edit member'
                    ) +
                  '">' +
                    icon('edit') +
                  '</button>' +

                '</div>' +

              '</td>' +

            '</tr>';
        }
      ).join('');

    var html =
      '<div class="page-toolbar">' +

        '<div>' +
          '<h2 class="section-card-title">' +
            'Member directory' +
          '</h2>' +
          '<p class="section-card-subtitle">' +
            'Create accounts, update contact information, roles and account status.' +
          '</p>' +
        '</div>' +

        '<button class="btn btn-brand" type="button" data-admin-new-user>' +
          icon(
            'user-plus'
          ) +
          ' Add member' +
        '</button>' +

      '</div>' +

      '<form id="memberFilters" class="filters-card">' +

        '<div class="filters-grid">' +

          '<div>' +
            '<label class="form-label">' +
              'Search' +
            '</label>' +
            '<input name="search" class="form-control" placeholder="Name, email or phone" value="' +
              escapeHtml(
                query.search || ''
              ) +
            '">' +
          '</div>' +

          '<div>' +
            '<label class="form-label">' +
              'Role' +
            '</label>' +
            '<select name="role" class="form-select select2" data-search="false" data-allow-clear="true" data-placeholder="All roles">' +
              '<option value=""></option>' +
              '<option value="member"' +
                (
                  query.role === 'member'
                    ? ' selected'
                    : ''
                ) +
              '>Member</option>' +
              '<option value="admin"' +
                (
                  query.role === 'admin'
                    ? ' selected'
                    : ''
                ) +
              '>Administrator</option>' +
            '</select>' +
          '</div>' +

          '<div>' +
            '<label class="form-label">' +
              'Status' +
            '</label>' +
            '<select name="status" class="form-select select2" data-search="false" data-allow-clear="true" data-placeholder="All statuses">' +
              '<option value=""></option>' +
              '<option value="active"' +
                (
                  query.status === 'active'
                    ? ' selected'
                    : ''
                ) +
              '>Active</option>' +
              '<option value="inactive"' +
                (
                  query.status === 'inactive'
                    ? ' selected'
                    : ''
                ) +
              '>Inactive</option>' +
            '</select>' +
          '</div>' +

          '<div class="d-flex align-items-end">' +
            '<button class="btn btn-dark w-100" type="submit">' +
              icon('search') +
              ' Apply filters' +
            '</button>' +
          '</div>' +

        '</div>' +

      '</form>' +

      '<div class="table-card">' +

        '<div class="table-responsive">' +

          '<table class="table">' +

            '<thead>' +
              '<tr>' +
                '<th>Member</th>' +
                '<th>Role</th>' +
                '<th>Status</th>' +
                '<th>Payment status</th>' +
                '<th class="d-none d-lg-table-cell">Phone</th>' +
                '<th class="d-none d-xl-table-cell">Last login</th>' +
                '<th class="text-end">Actions</th>' +
              '</tr>' +
            '</thead>' +

            '<tbody>' +
              (
                rows ||
                '<tr>' +
                  '<td colspan="7">' +
                    emptyState(
                      'users',
                      'No members found',
                      'Try changing the filters.'
                    ) +
                  '</td>' +
                '</tr>'
              ) +
            '</tbody>' +

          '</table>' +

        '</div>' +

        paginationHtml(
          data.pagination,
          'users'
        ) +

      '</div>';

    $('#pageContent').html(html);

    initSelect2('#pageContent');
  }

  function paginationHtml(p, scope) {
    if (
      !p ||
      p.pages <= 1
    ) {
      return '';
    }

    return '' +
      '<div class="pagination-wrap">' +

        '<span>' +
          'Page ' +
          p.page +
          ' of ' +
          p.pages +
          ' · ' +
          p.total +
          ' records' +
        '</span>' +

        '<div class="pagination-buttons">' +

          '<button class="btn btn-sm btn-light" type="button" data-page-scope="' +
            scope +
          '" data-page="' +
            (
              p.page - 1
            ) +
          '"' +
            (
              p.page <= 1
                ? ' disabled'
                : ''
            ) +
          '>' +
            icon(
              'chevron-left'
            ) +
          '</button>' +

          '<button class="btn btn-sm btn-light" type="button" data-page-scope="' +
            scope +
          '" data-page="' +
            (
              p.page + 1
            ) +
          '"' +
            (
              p.page >= p.pages
                ? ' disabled'
                : ''
            ) +
          '>' +
            icon(
              'chevron-right'
            ) +
          '</button>' +

        '</div>' +

      '</div>';
  }

  async function openUserModal(id) {
    var user = null;

    if (id) {
      showLoader(true);

      try {
        user =
          (
            await Api.get(
              '/admin/users/' +
              id
            )
          ).data;

      } catch (e) {
        toast(
          Api.errorMessage(e),
          'danger'
        );

        return;

      } finally {
        showLoader(false);
      }
    }

    var editing =
      !!user;

    openModal(
      editing
        ? 'Edit member'
        : 'Add member',

      'Member account',

      '<form id="userModalForm" data-user-id="' +
        (
          editing
            ? user.id
            : ''
        ) +
      '">' +

        '<div class="row g-3">' +

          '<div class="col-sm-6">' +
            '<label class="form-label">' +
              'First name' +
            '</label>' +
            '<input name="first_name" class="form-control" required value="' +
              escapeHtml(
                editing
                  ? user.first_name
                  : ''
              ) +
            '">' +
          '</div>' +

          '<div class="col-sm-6">' +
            '<label class="form-label">' +
              'Last name' +
            '</label>' +
            '<input name="last_name" class="form-control" required value="' +
              escapeHtml(
                editing
                  ? user.last_name
                  : ''
              ) +
            '">' +
          '</div>' +

          '<div class="col-sm-6">' +
            '<label class="form-label">' +
              'Email' +
            '</label>' +
            '<input name="email" type="email" class="form-control" value="' +
              escapeHtml(
                editing
                  ? (
                      user.email ||
                      ''
                    )
                  : ''
              ) +
            '">' +
          '</div>' +

          '<div class="col-sm-6">' +
            '<label class="form-label">' +
              'Phone' +
            '</label>' +
            '<input name="phone" class="form-control" value="' +
              escapeHtml(
                editing
                  ? (
                      user.phone ||
                      ''
                    )
                  : ''
              ) +
            '">' +
          '</div>' +

          '<div class="col-sm-6">' +
            '<label class="form-label">' +
              'Role' +
            '</label>' +
            '<select name="role" class="form-select select2" data-search="false">' +
              '<option value="member"' +
                (
                  !editing ||
                  user.role === 'member'
                    ? ' selected'
                    : ''
                ) +
              '>Member</option>' +
              '<option value="admin"' +
                (
                  editing &&
                  user.role === 'admin'
                    ? ' selected'
                    : ''
                ) +
              '>Administrator</option>' +
            '</select>' +
          '</div>' +

          '<div class="col-sm-6">' +
            '<label class="form-label">' +
              'Status' +
            '</label>' +
            '<select name="status" class="form-select select2" data-search="false">' +
              '<option value="active"' +
                (
                  !editing ||
                  user.status === 'active'
                    ? ' selected'
                    : ''
                ) +
              '>Active</option>' +
              '<option value="inactive"' +
                (
                  editing &&
                  user.status === 'inactive'
                    ? ' selected'
                    : ''
                ) +
              '>Inactive</option>' +
            '</select>' +
          '</div>' +

          '<div class="col-12">' +

            '<label class="form-label">' +
              (
                editing
                  ? 'New password (optional)'
                  : 'Temporary password'
              ) +
            '</label>' +

            '<div class="input-group password-generator-group">' +

              '<input name="password" type="text" class="form-control" minlength="8"' +
                (
                  editing
                    ? ''
                    : ' required'
                ) +
              '>' +

              '<button class="btn btn-light" type="button" data-generate-password>' +
                icon('refresh') +
                ' <span>Generate</span>' +
              '</button>' +

              '<button class="btn btn-light" type="button" data-copy-password>' +
                icon('copy') +
                ' <span>Copy</span>' +
              '</button>' +

            '</div>' +

            '<div class="form-text">' +
              'Minimum 8 characters.' +
              (
                editing
                  ? ' Leave empty to keep the existing password.'
                  : ' The member can be required to replace this after first login.'
              ) +
            '</div>' +

          '</div>' +

          '<div class="col-12">' +

            '<div class="form-check form-switch">' +

              '<input name="must_change_password" class="form-check-input" type="checkbox" id="mustChangePassword"' +
                (
                  !editing ||
                  user.must_change_password
                    ? ' checked'
                    : ''
                ) +
              '>' +

              '<label class="form-check-label" for="mustChangePassword">' +
                'Require password change on next login' +
              '</label>' +

            '</div>' +

          '</div>' +

        '</div>' +

      '</form>',

      '<button class="btn btn-light" data-bs-dismiss="modal" type="button">' +
        'Cancel' +
      '</button>' +

      '<button class="btn btn-brand" type="submit" form="userModalForm">' +
        '<span class="button-label">' +
          (
            editing
              ? 'Save changes'
              : 'Create member'
          ) +
        '</span>' +
        '<span class="spinner-border spinner-border-sm ms-2 d-none"></span>' +
      '</button>',

      'modal-lg'
    );

    initSelect2('#appModal');
  }

  async function openPaymentModal(userId) {
    showLoader(true);

    try {
      var response =
        await Api.get(
          '/admin/users/' +
          userId +
          '/payments'
        );

      var data =
        response.data || {};

      var user =
        data.user || {};

      var history =
        data.history || [];

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

      var body =
        '<div class="payment-modal-summary">' +

          '<div>' +
            '<span class="small text-muted">' +
              t('Current status') +
            '</span>' +
            '<div class="mt-1">' +
              paymentStatusBadge(
                data.status
              ) +
            '</div>' +
          '</div>' +

          '<div>' +
            '<span class="small text-muted">' +
              t('Paid until') +
            '</span>' +
            '<strong class="d-block mt-1">' +
              (
                data.paid_until
                  ? escapeHtml(
                      formatDate(
                        data.paid_until
                      )
                    )
                  : '—'
              ) +
            '</strong>' +
          '</div>' +

        '</div>' +

        '<form id="paymentModalForm" data-user-id="' +
          userId +
        '">' +

          '<div class="row g-3">' +

            '<div class="col-sm-6">' +
              '<label class="form-label">' +
                t('Payment date') +
              '</label>' +
              '<input name="payment_date" type="date" class="form-control" required value="' +
                escapeHtml(
                  data.suggested_payment_date ||
                  todayYmd()
                ) +
              '">' +
            '</div>' +

            '<div class="col-sm-6">' +
              '<label class="form-label">' +
                t('Valid until') +
              '</label>' +
              '<input name="valid_until" type="date" class="form-control" required value="' +
                escapeHtml(
                  data.suggested_valid_until ||
                  ''
                ) +
              '">' +
            '</div>' +

          '</div>' +

          '<div class="form-text mt-2">' +
            t(
              'The suggested end date extends an active membership by one calendar month. If it has expired, it starts from the payment date.'
            ) +
          '</div>' +

          '<div class="form-text">' +
            t(
              'This does not block bookings if the payment is expired.'
            ) +
          '</div>' +

        '</form>' +

        '<div class="mt-4">' +

          '<h3 class="section-card-title fs-6">' +
            t('Payment history') +
          '</h3>' +

          '<div class="table-responsive">' +

            '<table class="table mb-0">' +

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

        '</div>';

      openModal(
        (
          user.display_name ||
          ''
        ) +
        ' · ' +
        t('Payment validation'),

        t(
          'Record a member payment'
        ),

        body,

        '<button class="btn btn-light" data-bs-dismiss="modal" type="button">' +
          t('Cancel') +
        '</button>' +

        '<button class="btn btn-brand" type="submit" form="paymentModalForm">' +
          '<span class="button-label">' +
            t('Save payment') +
          '</span>' +
          '<span class="spinner-border spinner-border-sm ms-2 d-none"></span>' +
        '</button>',

        'modal-lg'
      );

    } catch (error) {
      toast(
        Api.errorMessage(error),
        'danger'
      );

    } finally {
      showLoader(false);
    }
  }

  /* Admin schedule */
  async function renderAdminSchedule() {
    setPageMeta(
      'Schedule',
      'Administrator'
    );

    if (
      !state.adminScheduleRange
    ) {
      state.adminScheduleRange = {
        from: todayYmd(),
        to: addDays(
          todayYmd(),
          14
        )
      };
    }

    $('#pageContent').html(
      '<div class="page-toolbar">' +
        '<div>' +
          '<h2 class="section-card-title">' +
            'Schedule manager' +
          '</h2>' +
          '<p class="section-card-subtitle">' +
            'Manage the recurring timetable, actual dated sessions and full-day closures.' +
          '</p>' +
        '</div>' +
      '</div>' +

      '<div class="admin-tabs mb-3">' +

        '<button class="admin-tab" data-admin-schedule-tab="templates" type="button">' +
          'Recurring timetable' +
        '</button>' +

        '<button class="admin-tab" data-admin-schedule-tab="sessions" type="button">' +
          'Dated sessions' +
        '</button>' +

        '<button class="admin-tab" data-admin-schedule-tab="closures" type="button">' +
          'Closures' +
        '</button>' +

      '</div>' +

      '<div id="adminSchedulePanel">' +
        pageSkeleton() +
      '</div>'
    );

    await loadAdminScheduleTab();
  }

  async function loadAdminScheduleTab() {
    $('[data-admin-schedule-tab]')
      .removeClass('active')
      .filter(
        '[data-admin-schedule-tab="' +
        state.adminScheduleTab +
        '"]'
      )
      .addClass('active');

    $('#adminSchedulePanel').html(
      pageSkeleton()
    );

    try {
      if (
        state.adminScheduleTab ===
        'templates'
      ) {
        return loadTemplates();
      }

      if (
        state.adminScheduleTab ===
        'sessions'
      ) {
        return loadSessions();
      }

      return loadClosures();

    } catch (error) {
      $('#adminSchedulePanel').html(
        emptyState(
          'alert-circle',
          'Unable to load schedule data',
          Api.errorMessage(error)
        )
      );
    }
  }

  async function loadTemplates() {
    var response =
      await Api.get(
        '/admin/schedule/templates'
      );

    var items =
      response.data || [];

    var weekdays = [
      '',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun'
    ];

    var html =
      '<div class="page-toolbar">' +

        '<div>' +
          '<h3 class="section-card-title">' +
            'Recurring timetable' +
          '</h3>' +
          '<p class="section-card-subtitle">' +
            'Templates automatically materialize into dated sessions.' +
          '</p>' +
        '</div>' +

        '<button class="btn btn-brand" data-template-new type="button">' +
          icon('plus') +
          ' Add time slot' +
        '</button>' +

      '</div>';

    html +=
      items.length
        ? '<div class="template-grid">' +
            items.map(
              function (template) {
                return '' +
                  '<article class="template-card">' +

                    '<div class="template-day">' +
                      weekdays[
                        template.weekday
                      ] +
                    '</div>' +

                    '<div class="template-info">' +

                      '<h3>' +
                        escapeHtml(
                          template.start_time
                        ) +
                        (
                          template.end_time
                            ? ' – ' +
                              escapeHtml(
                                template.end_time
                              )
                            : ''
                        ) +
                      '</h3>' +

                      '<p>' +
                        'Capacity ' +
                        template.capacity +
                        ' · ' +
                        (
                          template.is_active
                            ? 'Active'
                            : 'Inactive'
                        ) +
                      '</p>' +

                    '</div>' +

                    '<div class="table-actions">' +

                      '<button class="btn btn-light table-action-btn" type="button" data-template-edit="' +
                        template.id +
                      '" data-template-json="' +
                        escapeHtml(
                          encodeURIComponent(
                            JSON.stringify(
                              template
                            )
                          )
                        ) +
                      '">' +
                        icon('edit') +
                      '</button>' +

                      '<button class="btn btn-light text-danger table-action-btn" type="button" data-template-delete="' +
                        template.id +
                      '">' +
                        icon('trash') +
                      '</button>' +

                    '</div>' +

                  '</article>';
              }
            ).join('') +
          '</div>'
        : emptyState(
            'calendar',
            'No recurring time slots',
            'Create the first weekly time slot.'
          );

    $('#adminSchedulePanel').html(html);
  }

  function openTemplateModal(template) {
    var editing =
      !!template;

    var options =
      [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ].map(
        function (name, idx) {
          var val =
            idx + 1;

          return '' +
            '<option value="' +
              val +
            '"' +
              (
                (
                  editing
                    ? template.weekday
                    : 1
                ) === val
                  ? ' selected'
                  : ''
              ) +
            '>' +
              name +
            '</option>';
        }
      ).join('');

    openModal(
      editing
        ? 'Edit time slot'
        : 'Add time slot',

      'Recurring timetable',

      '<form id="templateModalForm" data-template-id="' +
        (
          editing
            ? template.id
            : ''
        ) +
      '">' +

        '<div class="row g-3">' +

          '<div class="col-12">' +
            '<label class="form-label">' +
              'Day' +
            '</label>' +
            '<select name="weekday" class="form-select select2" data-search="false">' +
              options +
            '</select>' +
          '</div>' +

          '<div class="col-sm-6">' +
            '<label class="form-label">' +
              'Start time' +
            '</label>' +
            '<input name="start_time" type="time" class="form-control" required value="' +
              escapeHtml(
                editing
                  ? template.start_time
                  : '18:00'
              ) +
            '">' +
          '</div>' +

          '<div class="col-sm-6">' +
            '<label class="form-label">' +
              'End time' +
            '</label>' +
            '<input name="end_time" type="time" class="form-control" value="' +
              escapeHtml(
                editing
                  ? (
                      template.end_time ||
                      ''
                    )
                  : '19:00'
              ) +
            '">' +
          '</div>' +

          '<div class="col-sm-6">' +
            '<label class="form-label">' +
              'Capacity' +
            '</label>' +
            '<input name="capacity" type="number" min="1" max="100" class="form-control" required value="' +
              escapeHtml(
                editing
                  ? template.capacity
                  : 8
              ) +
            '">' +
          '</div>' +

          '<div class="col-sm-6 d-flex align-items-end">' +

            '<div class="form-check form-switch mb-2">' +

              '<input name="is_active" class="form-check-input" type="checkbox" role="switch" id="templateActive"' +
                (
                  !editing ||
                  template.is_active
                    ? ' checked'
                    : ''
                ) +
              '>' +

              '<label class="form-check-label" for="templateActive">' +
                'Active' +
              '</label>' +

            '</div>' +

          '</div>' +

        '</div>' +

      '</form>',

      '<button class="btn btn-light" data-bs-dismiss="modal" type="button">' +
        'Cancel' +
      '</button>' +

      '<button class="btn btn-brand" type="submit" form="templateModalForm">' +
        '<span class="button-label">' +
          'Save time slot' +
        '</span>' +
        '<span class="spinner-border spinner-border-sm ms-2 d-none"></span>' +
      '</button>'
    );

    initSelect2('#appModal');
  }

  async function loadSessions() {
    var range =
      state.adminScheduleRange;

    var response =
      await Api.get(
        '/admin/schedule/sessions',
        range
      );

    var items =
      response.data || [];

    var rows =
      items.map(
        function (session) {
          return '' +
            '<tr>' +

              '<td>' +
                '<strong>' +
                  escapeHtml(
                    formatDate(
                      session.date,
                      {
                        day: 'numeric',
                        month: 'short',
                        weekday: 'short'
                      }
                    )
                  ) +
                '</strong>' +
              '</td>' +

              '<td>' +
                escapeHtml(
                  session.start_time
                ) +
                (
                  session.end_time
                    ? '–' +
                      escapeHtml(
                        session.end_time
                      )
                    : ''
                ) +
              '</td>' +

              '<td>' +
                session.booked_count +
                ' / ' +
                session.capacity +
              '</td>' +

              '<td>' +
                '<span class="badge-soft-' +
                  (
                    session.status === 'open'
                      ? 'success'
                      : session.status === 'cancelled'
                        ? 'danger'
                        : 'warning'
                  ) +
                ' text-capitalize">' +
                  escapeHtml(
                    session.status
                  ) +
                '</span>' +
              '</td>' +

              '<td class="d-none d-md-table-cell">' +
                escapeHtml(
                  session.note ||
                  '—'
                ) +
              '</td>' +

              '<td>' +
                '<div class="table-actions">' +
                  '<button class="btn btn-light table-action-btn" data-session-edit="' +
                    session.id +
                  '" data-session-json="' +
                    escapeHtml(
                      encodeURIComponent(
                        JSON.stringify(
                          session
                        )
                      )
                    ) +
                  '" type="button">' +
                    icon('edit') +
                  '</button>' +
                '</div>' +
              '</td>' +

            '</tr>';
        }
      ).join('');

    $('#adminSchedulePanel').html(
      '<div class="page-toolbar">' +

        '<form id="sessionRangeForm" class="d-flex gap-2 flex-wrap">' +

          '<input name="from" type="date" class="form-control" style="width:auto" value="' +
            escapeHtml(
              range.from
            ) +
          '">' +

          '<input name="to" type="date" class="form-control" style="width:auto" value="' +
            escapeHtml(
              range.to
            ) +
          '">' +

          '<button class="btn btn-dark" type="submit">' +
            'Apply' +
          '</button>' +

        '</form>' +

        '<button class="btn btn-brand" data-session-new type="button">' +
          icon('plus') +
          ' Add session' +
        '</button>' +

      '</div>' +

      '<div class="table-card">' +

        '<div class="table-responsive">' +

          '<table class="table">' +

            '<thead>' +
              '<tr>' +
                '<th>Date</th>' +
                '<th>Time</th>' +
                '<th>Booked</th>' +
                '<th>Status</th>' +
                '<th class="d-none d-md-table-cell">Note</th>' +
                '<th class="text-end">Actions</th>' +
              '</tr>' +
            '</thead>' +

            '<tbody>' +
              (
                rows ||
                '<tr>' +
                  '<td colspan="6">' +
                    emptyState(
                      'calendar',
                      'No sessions',
                      'No sessions exist in this date range.'
                    ) +
                  '</td>' +
                '</tr>'
              ) +
            '</tbody>' +

          '</table>' +

        '</div>' +

      '</div>'
    );
  }

  function openSessionModal(session) {
    var editing =
      !!session;

    openModal(
      editing
        ? 'Edit session'
        : 'Add session',

      'Dated session',

      '<form id="sessionModalForm" data-session-id="' +
        (
          editing
            ? session.id
            : ''
        ) +
      '">' +

        '<div class="row g-3">' +

          '<div class="col-sm-6">' +
            '<label class="form-label">' +
              'Date' +
            '</label>' +
            '<input name="date" type="date" class="form-control" required value="' +
              escapeHtml(
                editing
                  ? session.date
                  : todayYmd()
              ) +
            '">' +
          '</div>' +

          '<div class="col-sm-6">' +
            '<label class="form-label">' +
              'Status' +
            '</label>' +
            '<select name="status" class="form-select select2" data-search="false">' +

              '<option value="open"' +
                (
                  !editing ||
                  session.status === 'open'
                    ? ' selected'
                    : ''
                ) +
              '>Open</option>' +

              '<option value="closed"' +
                (
                  editing &&
                  session.status === 'closed'
                    ? ' selected'
                    : ''
                ) +
              '>Closed</option>' +

              '<option value="cancelled"' +
                (
                  editing &&
                  session.status === 'cancelled'
                    ? ' selected'
                    : ''
                ) +
              '>Cancelled</option>' +

            '</select>' +

            '<div class="form-text">' +
              'Closed blocks new bookings but keeps existing reservations. Cancelled cancels active reservations and releases the waiting list.' +
            '</div>' +

          '</div>' +

          '<div class="col-sm-6">' +
            '<label class="form-label">' +
              'Start time' +
            '</label>' +
            '<input name="start_time" type="time" class="form-control" required value="' +
              escapeHtml(
                editing
                  ? session.start_time
                  : '18:00'
              ) +
            '">' +
          '</div>' +

          '<div class="col-sm-6">' +
            '<label class="form-label">' +
              'End time' +
            '</label>' +
            '<input name="end_time" type="time" class="form-control" value="' +
              escapeHtml(
                editing
                  ? (
                      session.end_time ||
                      ''
                    )
                  : '19:00'
              ) +
            '">' +
          '</div>' +

          '<div class="col-sm-6">' +
            '<label class="form-label">' +
              'Capacity' +
            '</label>' +
            '<input name="capacity" type="number" min="1" max="100" class="form-control" required value="' +
              escapeHtml(
                editing
                  ? session.capacity
                  : 8
              ) +
            '">' +
          '</div>' +

          '<div class="col-12">' +
            '<label class="form-label">' +
              'Note' +
            '</label>' +
            '<textarea name="note" class="form-control" maxlength="500" placeholder="' + escapeHtml(t('Optional note')) + '">' +
              escapeHtml(
                editing
                  ? (
                      session.note ||
                      ''
                    )
                  : ''
              ) +
            '</textarea>' +
          '</div>' +

        '</div>' +

      '</form>',

      '<button class="btn btn-light" data-bs-dismiss="modal" type="button">' +
        'Cancel' +
      '</button>' +

      '<button class="btn btn-brand" type="submit" form="sessionModalForm">' +
        '<span class="button-label">' +
          'Save session' +
        '</span>' +
        '<span class="spinner-border spinner-border-sm ms-2 d-none"></span>' +
      '</button>',

      'modal-lg'
    );

    initSelect2('#appModal');
  }

  async function loadClosures() {
    var range =
      state.adminScheduleRange;

    var response =
      await Api.get(
        '/admin/schedule/closures',
        range
      );

    var items =
      response.data || [];

    var rows =
      items.map(
        function (closure) {
          return '' +
            '<tr>' +

              '<td>' +
                '<strong>' +
                  escapeHtml(
                    formatDate(
                      closure.date,
                      {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }
                    )
                  ) +
                '</strong>' +
              '</td>' +

              '<td>' +
                escapeHtml(
                  closure.reason ||
                  'No reason provided'
                ) +
              '</td>' +

              '<td class="text-end">' +
                '<button class="btn btn-light text-danger table-action-btn" type="button" data-closure-delete="' +
                  closure.id +
                '">' +
                  icon('trash') +
                '</button>' +
              '</td>' +

            '</tr>';
        }
      ).join('');

    $('#adminSchedulePanel').html(
      '<div class="page-toolbar">' +

        '<form id="closureRangeForm" class="d-flex gap-2 flex-wrap">' +

          '<input name="from" type="date" class="form-control" style="width:auto" value="' +
            escapeHtml(
              range.from
            ) +
          '">' +

          '<input name="to" type="date" class="form-control" style="width:auto" value="' +
            escapeHtml(
              range.to
            ) +
          '">' +

          '<button class="btn btn-dark" type="submit">' +
            'Apply' +
          '</button>' +

        '</form>' +

        '<button class="btn btn-brand" data-closure-new type="button">' +
          icon('ban') +
          ' Close a date' +
        '</button>' +

      '</div>' +

      '<div class="table-card">' +

        '<div class="table-responsive">' +

          '<table class="table">' +

            '<thead>' +
              '<tr>' +
                '<th>Date</th>' +
                '<th>Reason</th>' +
                '<th class="text-end">Actions</th>' +
              '</tr>' +
            '</thead>' +

            '<tbody>' +
              (
                rows ||
                '<tr>' +
                  '<td colspan="3">' +
                    emptyState(
                      'check-circle',
                      'No closures',
                      'The gym is open throughout this date range.'
                    ) +
                  '</td>' +
                '</tr>'
              ) +
            '</tbody>' +

          '</table>' +

        '</div>' +

      '</div>'
    );
  }

  function openClosureModal() {
    openModal(
      'Close a date',
      'Full-day closure',

      '<form id="closureModalForm">' +

        '<div class="alert alert-warning border-0 small">' +
          '<strong>Important:</strong> existing reservations on this date will be cancelled and waiting-list entries will be released. Members will receive an in-app notification.' +
        '</div>' +

        '<div class="mb-3">' +
          '<label class="form-label">' +
            'Date' +
          '</label>' +
          '<input name="date" type="date" class="form-control" required value="' +
            todayYmd() +
          '">' +
        '</div>' +

        '<div>' +
          '<label class="form-label">' +
            'Reason' +
          '</label>' +
          '<textarea name="reason" class="form-control" maxlength="500" placeholder="' + escapeHtml(t('Holiday, maintenance, etc.')) + '"></textarea>' +
        '</div>' +

      '</form>',

      '<button class="btn btn-light" data-bs-dismiss="modal" type="button">' +
        'Cancel' +
      '</button>' +

      '<button class="btn btn-danger" type="submit" form="closureModalForm">' +
        '<span class="button-label">' +
          'Close date' +
        '</span>' +
        '<span class="spinner-border spinner-border-sm ms-2 d-none"></span>' +
      '</button>'
    );
  }

  /* Admin bookings */
  async function renderAdminBookings(query) {
    query =
      query || {
        page: 1,
        per_page: 25,
        from: todayYmd(),
        to: addDays(
          todayYmd(),
          30
        ),
        status: 'booked'
      };

    setPageMeta(
      'Bookings',
      'Administrator'
    );

    $('#pageContent').html(
      pageSkeleton()
    );

    try {
      var responses =
        await Promise.all([
          Api.get(
            '/admin/bookings',
            query
          ),
          Api.get(
            '/admin/waitlist',
            {
              from:
                query.from ||
                todayYmd(),

              to:
                query.to ||
                addDays(
                  todayYmd(),
                  30
                ),

              status: 'waiting'
            }
          )
        ]);

      state.adminBookings =
        responses[0].data;

      state.adminWaitlist =
        responses[1].data || [];

      drawAdminBookings(query);

    } catch (error) {
      $('#pageContent').html(
        emptyState(
          'alert-circle',
          'Unable to load bookings',
          Api.errorMessage(error)
        )
      );
    }
  }

  function drawAdminBookings(query) {
    var data =
      state.adminBookings;

    var rows =
      data.items.map(
        function (booking) {
          var member =
            booking.member || {};

          var statusClass =
            booking.status === 'checked_in'
              ? 'brand'
              : booking.status === 'booked'
                ? 'success'
                : booking.status === 'no_show'
                  ? 'danger'
                  : 'muted';

          var attendance =
            booking.status === 'cancelled'
              ? ''
              : '<select class="form-select form-select-sm attendance-select" data-admin-attendance-id="' +
                  booking.id +
                '">' +

                  '<option value="booked"' +
                    (
                      booking.status === 'booked'
                        ? ' selected'
                        : ''
                    ) +
                  '>Booked</option>' +

                  '<option value="checked_in"' +
                    (
                      booking.status === 'checked_in'
                        ? ' selected'
                        : ''
                    ) +
                  '>Checked in</option>' +

                  '<option value="no_show"' +
                    (
                      booking.status === 'no_show'
                        ? ' selected'
                        : ''
                    ) +
                  '>No-show</option>' +

                '</select>';

          return '' +
            '<tr>' +

              '<td>' +

                '<strong>' +
                  escapeHtml(
                    member.display_name ||
                    (
                      'User #' +
                      booking.user_id
                    )
                  ) +
                '</strong>' +

                '<div class="small text-muted">' +
                  escapeHtml(
                    member.email ||
                    member.phone ||
                    ''
                  ) +
                '</div>' +

              '</td>' +

              '<td>' +
                escapeHtml(
                  formatDate(
                    booking.date,
                    {
                      day: 'numeric',
                      month: 'short',
                      weekday: 'short'
                    }
                  )
                ) +
              '</td>' +

              '<td>' +

                escapeHtml(
                  booking.start_time
                ) +

                (
                  booking.end_time
                    ? '–' +
                      escapeHtml(
                        booking.end_time
                      )
                    : ''
                ) +

              '</td>' +

              '<td>' +

                '<span class="badge-soft-' +
                  statusClass +
                ' text-capitalize">' +

                  escapeHtml(
                    booking.status.replace(
                      '_',
                      ' '
                    )
                  ) +

                '</span>' +

              '</td>' +

              '<td>' +
                attendance +
              '</td>' +

              '<td class="text-end">' +

                (
                  booking.status !== 'cancelled'
                    ? '<button class="btn btn-light text-danger table-action-btn" data-admin-booking-cancel="' +
                        booking.id +
                      '" type="button" aria-label="Cancel booking">' +
                        icon('x') +
                      '</button>'
                    : ''
                ) +

              '</td>' +

            '</tr>';
        }
      ).join('');

    var html =
      '<div class="page-toolbar">' +

        '<div>' +
          '<h2 class="section-card-title">' +
            'All bookings' +
          '</h2>' +
          '<p class="section-card-subtitle">' +
            'Search reservations and add members to sessions manually.' +
          '</p>' +
        '</div>' +

        '<button class="btn btn-brand" type="button" data-admin-new-booking>' +
          icon('plus') +
          ' Add booking' +
        '</button>' +

      '</div>' +

      '<form id="adminBookingFilters" class="filters-card">' +

        '<div class="filters-grid">' +

          '<div>' +
            '<label class="form-label">' +
              'Search' +
            '</label>' +
            '<input name="search" class="form-control" value="' +
              escapeHtml(
                query.search || ''
              ) +
            '" placeholder="' + escapeHtml(t('Member name, email or phone')) + '">' +
          '</div>' +

          '<div>' +
            '<label class="form-label">' +
              'From' +
            '</label>' +
            '<input name="from" type="date" class="form-control" value="' +
              escapeHtml(
                query.from || ''
              ) +
            '">' +
          '</div>' +

          '<div>' +
            '<label class="form-label">' +
              'To' +
            '</label>' +
            '<input name="to" type="date" class="form-control" value="' +
              escapeHtml(
                query.to || ''
              ) +
            '">' +
          '</div>' +

          '<div>' +
            '<label class="form-label">' +
              'Status' +
            '</label>' +

            '<select name="status" class="form-select select2" data-search="false" data-allow-clear="true" data-placeholder="All statuses">' +

              '<option value=""></option>' +

              '<option value="booked"' +
                (
                  query.status === 'booked'
                    ? ' selected'
                    : ''
                ) +
              '>Booked</option>' +

              '<option value="checked_in"' +
                (
                  query.status === 'checked_in'
                    ? ' selected'
                    : ''
                ) +
              '>Checked in</option>' +

              '<option value="no_show"' +
                (
                  query.status === 'no_show'
                    ? ' selected'
                    : ''
                ) +
              '>No-show</option>' +

              '<option value="cancelled"' +
                (
                  query.status === 'cancelled'
                    ? ' selected'
                    : ''
                ) +
              '>Cancelled</option>' +

            '</select>' +

          '</div>' +

        '</div>' +

        '<div class="d-flex justify-content-end mt-3">' +
          '<button class="btn btn-dark" type="submit">' +
            icon('search') +
            ' Apply filters' +
          '</button>' +
        '</div>' +

      '</form>' +

      '<div class="table-card mb-4">' +

        '<div class="table-responsive">' +

          '<table class="table">' +

            '<thead>' +
              '<tr>' +
                '<th>Member</th>' +
                '<th>Date</th>' +
                '<th>Time</th>' +
                '<th>Status</th>' +
                '<th>Attendance</th>' +
                '<th></th>' +
              '</tr>' +
            '</thead>' +

            '<tbody>' +
              (
                rows ||
                '<tr>' +
                  '<td colspan="6">' +
                    emptyState(
                      'calendar-check',
                      'No bookings found',
                      'Try another date range or search term.'
                    ) +
                  '</td>' +
                '</tr>'
              ) +
            '</tbody>' +

          '</table>' +

        '</div>' +

        paginationHtml(
          data.pagination,
          'bookings'
        ) +

      '</div>' +

      adminWaitlistHtml(
        state.adminWaitlist ||
        []
      );

    $('#pageContent').html(html);

    initSelect2('#pageContent');
  }

  function adminWaitlistHtml(items) {
    var positions = {};

    var rows =
      items.map(
        function (entry) {
          var member =
            entry.member || {};

          positions[
            entry.session_id
          ] =
            (
              positions[
                entry.session_id
              ] ||
              0
            ) +
            1;

          return '' +
            '<tr>' +

              '<td>' +
                '<span class="waitlist-position">' +
                  positions[
                    entry.session_id
                  ] +
                '</span>' +
              '</td>' +

              '<td>' +

                '<strong>' +
                  escapeHtml(
                    member.display_name ||
                    (
                      'User #' +
                      entry.user_id
                    )
                  ) +
                '</strong>' +

                '<div class="small text-muted">' +
                  escapeHtml(
                    member.email ||
                    member.phone ||
                    ''
                  ) +
                '</div>' +

              '</td>' +

              '<td>' +
                escapeHtml(
                  formatDate(
                    entry.date,
                    {
                      day: 'numeric',
                      month: 'short',
                      weekday: 'short'
                    }
                  )
                ) +
              '</td>' +

              '<td>' +

                escapeHtml(
                  entry.start_time
                ) +

                (
                  entry.end_time
                    ? '–' +
                      escapeHtml(
                        entry.end_time
                      )
                    : ''
                ) +

              '</td>' +

              '<td>' +
                escapeHtml(
                  formatDateTime(
                    entry.joined_at
                  )
                ) +
              '</td>' +

            '</tr>';
        }
      ).join('');

    return '' +
      '<section class="section-card">' +

        '<div class="section-card-header">' +

          '<div>' +
            '<h2 class="section-card-title">' +
              'Active waiting list' +
            '</h2>' +
            '<p class="section-card-subtitle">' +
              'Members are ordered by session and join time. When auto-promotion is enabled, the oldest eligible member is moved into a booking when a place opens.' +
            '</p>' +
          '</div>' +

          '<span class="badge rounded-pill text-bg-dark">' +
            items.length +
          '</span>' +

        '</div>' +

        '<div class="table-responsive">' +

          '<table class="table mb-0">' +

            '<thead>' +
              '<tr>' +
                '<th>#</th>' +
                '<th>Member</th>' +
                '<th>Date</th>' +
                '<th>Time</th>' +
                '<th>Joined</th>' +
              '</tr>' +
            '</thead>' +

            '<tbody>' +
              (
                rows ||
                '<tr>' +
                  '<td colspan="5">' +
                    emptyState(
                      'clock',
                      'No one is waiting',
                      'There are no active waiting-list entries in this date range.'
                    ) +
                  '</td>' +
                '</tr>'
              ) +
            '</tbody>' +

          '</table>' +

        '</div>' +

      '</section>';
  }

  async function openAdminBookingModal() {
    showLoader(true);

    try {
      var responses =
        await Promise.all([
          Api.get(
            '/admin/users',
            {
              role: 'member',
              status: 'active',
              page: 1,
              per_page: 100
            }
          ),
          Api.get(
            '/admin/schedule/sessions',
            {
              from: todayYmd(),
              to: addDays(
                todayYmd(),
                60
              )
            }
          )
        ]);

      var users =
        responses[0].data.items ||
        [];

      var sessions =
        (
          responses[1].data ||
          []
        ).filter(
          function (session) {
            return (
              session.status === 'open' &&
              session.booked_count <
              session.capacity &&
              isFutureSession(
                session.date,
                session.start_time
              )
            );
          }
        );

      var userOptions =
        users.map(
          function (user) {
            return '' +
              '<option value="' +
                user.id +
              '">' +
                escapeHtml(
                  user.display_name +
                  (
                    user.phone
                      ? ' · ' +
                        user.phone
                      : user.email
                        ? ' · ' +
                          user.email
                        : ''
                  )
                ) +
              '</option>';
          }
        ).join('');

      var sessionOptions =
        sessions.map(
          function (session) {
            return '' +
              '<option value="' +
                session.id +
              '">' +
                escapeHtml(
                  formatDate(
                    session.date,
                    {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    }
                  ) +
                  ' · ' +
                  session.start_time +
                  ' · ' +
                  session.booked_count +
                  '/' +
                  session.capacity
                ) +
              '</option>';
          }
        ).join('');

      openModal(
        'Add booking',
        'Administrator',

        '<form id="adminBookingModalForm">' +

          '<div class="mb-3">' +
            '<label class="form-label">' +
              'Member' +
            '</label>' +
            '<select name="user_id" class="form-select select2" data-placeholder="' + escapeHtml(t('Choose a member')) + '" required>' +
              '<option value=""></option>' +
              userOptions +
            '</select>' +
          '</div>' +

          '<div>' +
            '<label class="form-label">' +
              'Session' +
            '</label>' +
            '<select name="session_id" class="form-select select2" data-placeholder="' + escapeHtml(t('Choose an available session')) + '" required>' +
              '<option value=""></option>' +
              sessionOptions +
            '</select>' +
            '<div class="form-text">' +
              'Only future open sessions with remaining capacity are shown.' +
            '</div>' +
          '</div>' +

        '</form>',

        '<button class="btn btn-light" data-bs-dismiss="modal" type="button">' +
          'Cancel' +
        '</button>' +

        '<button class="btn btn-brand" type="submit" form="adminBookingModalForm">' +
          '<span class="button-label">' +
            'Create booking' +
          '</span>' +
          '<span class="spinner-border spinner-border-sm ms-2 d-none"></span>' +
        '</button>'
      );

      initSelect2('#appModal');

    } catch (error) {
      toast(
        Api.errorMessage(error),
        'danger'
      );

    } finally {
      showLoader(false);
    }
  }

  /* Admin announcements */
  async function renderAdminAnnouncements() {
    setPageMeta(
      'Announcements',
      'Administrator'
    );

    $('#pageContent').html(
      pageSkeleton()
    );

    try {
      var response =
        await Api.get(
          '/admin/announcements'
        );

      state.announcements =
        response.data || [];

      var html =
        '<div class="page-toolbar">' +

          '<div>' +
            '<h2 class="section-card-title">' +
              'Gym announcements' +
            '</h2>' +
            '<p class="section-card-subtitle">' +
              'Publish notices that appear in the member application.' +
            '</p>' +
          '</div>' +

          '<button class="btn btn-brand" type="button" data-announcement-new>' +
            icon('plus') +
            ' New announcement' +
          '</button>' +

        '</div>' +

        (
          state.announcements.length
            ? '<div class="announcement-list">' +
                state.announcements.map(
                  function (announcement) {
                    return announcementCard(
                      announcement,
                      true
                    );
                  }
                ).join('') +
              '</div>'
            : emptyState(
                'megaphone',
                'No announcements',
                'Create the first notice for your members.'
              )
        );

      $('#pageContent').html(html);

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

  async function openAnnouncementModal(id) {
    var item = null;

    if (id) {
      showLoader(true);

      try {
        item =
          (
            await Api.get(
              '/admin/announcements/' +
              id
            )
          ).data;

      } catch (e) {
        toast(
          Api.errorMessage(e),
          'danger'
        );

        return;

      } finally {
        showLoader(false);
      }
    }

    openModal(
      item
        ? 'Edit announcement'
        : 'New announcement',

      'Member notice',

      '<form id="announcementModalForm" data-announcement-id="' +
        (
          item
            ? item.id
            : ''
        ) +
      '">' +

        '<div class="mb-3">' +
          '<label class="form-label">' +
            'Title' +
          '</label>' +
          '<input name="title" class="form-control" maxlength="180" required value="' +
            escapeHtml(
              item
                ? item.title
                : ''
            ) +
          '">' +
        '</div>' +

        '<div class="mb-3">' +
          '<label class="form-label">' +
            'Message' +
          '</label>' +
          '<textarea name="body" class="form-control" maxlength="5000" required>' +
            escapeHtml(
              item
                ? item.body
                : ''
            ) +
          '</textarea>' +
        '</div>' +

        '<div class="row g-3">' +

          '<div class="col-sm-6">' +
            '<label class="form-label">' +
              'Starts at' +
            '</label>' +
            '<input name="starts_at" type="datetime-local" class="form-control" value="' +
              escapeHtml(
                item
                  ? toInputDateTime(
                      item.starts_at
                    )
                  : ''
              ) +
            '">' +
          '</div>' +

          '<div class="col-sm-6">' +
            '<label class="form-label">' +
              'Expires at' +
            '</label>' +
            '<input name="expires_at" type="datetime-local" class="form-control" value="' +
              escapeHtml(
                item
                  ? toInputDateTime(
                      item.expires_at
                    )
                  : ''
              ) +
            '">' +
          '</div>' +

          '<div class="col-12">' +

            '<div class="form-check form-switch">' +

              '<input name="is_active" class="form-check-input" type="checkbox" role="switch" id="announcementActive"' +
                (
                  !item ||
                  item.is_active
                    ? ' checked'
                    : ''
                ) +
              '>' +

              '<label class="form-check-label" for="announcementActive">' +
                'Visible when within its active date range' +
              '</label>' +

            '</div>' +

          '</div>' +

        '</div>' +

      '</form>',

      '<button class="btn btn-light" data-bs-dismiss="modal" type="button">' +
        'Cancel' +
      '</button>' +

      '<button class="btn btn-brand" type="submit" form="announcementModalForm">' +
        '<span class="button-label">' +
          'Save announcement' +
        '</span>' +
        '<span class="spinner-border spinner-border-sm ms-2 d-none"></span>' +
      '</button>',

      'modal-lg'
    );
  }

  /* Admin reports */
  async function renderAdminReports(query) {
    query =
      query || {
        from:
          ymd(
            new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            )
          ),
        to: todayYmd()
      };

    setPageMeta(
      'Reports',
      'Administrator'
    );

    $('#pageContent').html(
      pageSkeleton()
    );

    try {
      var response =
        await Api.get(
          '/admin/reports/attendance',
          query
        );

      var data =
        response.data;

      var summary =
        data.summary;

      var daily =
        (
          data.daily ||
          []
        ).map(
          function (row) {
            return '' +
              '<tr>' +

                '<td>' +
                  escapeHtml(
                    formatDate(
                      row.date,
                      {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }
                    )
                  ) +
                '</td>' +

                '<td>' +
                  row.reservations +
                '</td>' +

                '<td>' +
                  row.attended +
                '</td>' +

                '<td>' +
                  row.no_shows +
                '</td>' +

                '<td>' +
                  row.cancelled +
                '</td>' +

              '</tr>';
          }
        ).join('');

      $('#pageContent').html(
        '<div class="page-toolbar">' +

          '<div>' +
            '<h2 class="section-card-title">' +
              'Attendance & booking history' +
            '</h2>' +
            '<p class="section-card-subtitle">' +
              'Use this to see how the gym is actually being used, not only how many places were reserved.' +
            '</p>' +
          '</div>' +

        '</div>' +

        '<form id="reportRangeForm" class="filters-card">' +

          '<div class="d-flex gap-2 flex-wrap align-items-end">' +

            '<div>' +
              '<label class="form-label">' +
                'From' +
              '</label>' +
              '<input name="from" type="date" class="form-control" value="' +
                escapeHtml(
                  data.from
                ) +
              '">' +
            '</div>' +

            '<div>' +
              '<label class="form-label">' +
                'To' +
              '</label>' +
              '<input name="to" type="date" class="form-control" value="' +
                escapeHtml(
                  data.to
                ) +
              '">' +
            '</div>' +

            '<button class="btn btn-dark" type="submit">' +
              'Run report' +
            '</button>' +

          '</div>' +

        '</form>' +

        '<div class="metrics-grid mb-4">' +

          '<div class="metric-card">' +
            '<div class="metric-icon brand">' +
              icon('calendar-check') +
            '</div>' +
            '<span class="metric-value">' +
              summary.total_reservations +
            '</span>' +
            '<span class="metric-label">' +
              'Reservations' +
            '</span>' +
          '</div>' +

          '<div class="metric-card">' +
            '<div class="metric-icon success">' +
              icon('check-circle') +
            '</div>' +
            '<span class="metric-value">' +
              summary.attended +
            '</span>' +
            '<span class="metric-label">' +
              'Checked in' +
            '</span>' +
          '</div>' +

          '<div class="metric-card">' +
            '<div class="metric-icon warning">' +
              icon('alert-circle') +
            '</div>' +
            '<span class="metric-value">' +
              summary.no_shows +
            '</span>' +
            '<span class="metric-label">' +
              'No-shows' +
            '</span>' +
          '</div>' +

          '<div class="metric-card">' +
            '<div class="metric-icon info">' +
              icon('activity') +
            '</div>' +
            '<span class="metric-value">' +
              summary.average_occupancy_percent +
              '%' +
            '</span>' +
            '<span class="metric-label">' +
              'Avg occupancy' +
            '</span>' +
          '</div>' +

        '</div>' +

        '<div class="content-grid two-column">' +

          '<section class="section-card">' +

            '<div class="section-card-header">' +
              '<div>' +
                '<h2 class="section-card-title">' +
                  'Daily history' +
                '</h2>' +
                '<p class="section-card-subtitle">' +
                  'Reservations and attendance by session date.' +
                '</p>' +
              '</div>' +
            '</div>' +

            '<div class="table-responsive">' +

              '<table class="table">' +

                '<thead>' +
                  '<tr>' +
                    '<th>Date</th>' +
                    '<th>Reservations</th>' +
                    '<th>Attended</th>' +
                    '<th>No-shows</th>' +
                    '<th>Cancelled</th>' +
                  '</tr>' +
                '</thead>' +

                '<tbody>' +
                  (
                    daily ||
                    '<tr>' +
                      '<td colspan="5">' +
                        'No data in this range.' +
                      '</td>' +
                    '</tr>'
                  ) +
                '</tbody>' +

              '</table>' +

            '</div>' +

          '</section>' +

          '<aside class="content-grid">' +

            '<section class="section-card">' +
              '<h2 class="section-card-title">' +
                'Most popular hour' +
              '</h2>' +
              '<div class="display-6 fw-bold text-brand">' +
                escapeHtml(
                  summary.popular_hour
                    ? summary.popular_hour.start_time
                    : '—'
                ) +
              '</div>' +
              '<p class="section-card-subtitle mb-0">' +
                (
                  summary.popular_hour
                    ? summary.popular_hour.reservations +
                      ' non-cancelled reservations'
                    : 'No booking data yet'
                ) +
              '</p>' +
            '</section>' +

            '<section class="section-card">' +
              '<h2 class="section-card-title">' +
                'Other totals' +
              '</h2>' +
              '<div class="report-stat">' +
                '<span>Cancelled</span>' +
                '<strong>' +
                  summary.cancelled +
                '</strong>' +
              '</div>' +
              '<div class="report-stat">' +
                '<span>Still booked</span>' +
                '<strong>' +
                  summary.still_booked +
                '</strong>' +
              '</div>' +
            '</section>' +

          '</aside>' +

        '</div>'
      );

    } catch (error) {
      $('#pageContent').html(
        emptyState(
          'alert-circle',
          'Unable to load report',
          Api.errorMessage(error)
        )
      );
    }
  }

  /* Admin settings */
  async function renderAdminSettings() {
    setPageMeta(
      'Settings',
      'Administrator'
    );

    $('#pageContent').html(
      pageSkeleton()
    );

    try {
      var response =
        await Api.get(
          '/admin/settings'
        );

      state.settings =
        response.data;

      $('#sidebarGymName, #mobileGymName').text(
        state.settings.gym_name ||
        'BE-FIT'
      );

      var settings =
        state.settings;

      var paymentReminderDays =
        settings.payment_reminder_days_before_expiry !== undefined
          ? settings.payment_reminder_days_before_expiry
          : 5;

      var html =
        '<div class="content-grid two-column">' +

          '<section class="section-card">' +

            '<div class="section-card-header">' +

              '<div>' +
                '<h2 class="section-card-title">' +
                  'Gym & booking rules' +
                '</h2>' +
                '<p class="section-card-subtitle">' +
                  'These rules are enforced by the API, not only by the frontend.' +
                '</p>' +
              '</div>' +

            '</div>' +

            '<form id="settingsForm">' +

              '<div class="row g-3">' +

                '<div class="col-12">' +
                  '<label class="form-label">' +
                    'Gym name' +
                  '</label>' +
                  '<input name="gym_name" class="form-control" maxlength="180" required value="' +
                    escapeHtml(
                      settings.gym_name
                    ) +
                  '">' +
                '</div>' +

                '<div class="col-sm-6">' +
                  '<label class="form-label">' +
                    'Default capacity' +
                  '</label>' +
                  '<input name="default_capacity" type="number" min="1" max="100" class="form-control" required value="' +
                    settings.default_capacity +
                  '">' +
                '</div>' +

                '<div class="col-sm-6">' +
                  '<label class="form-label">' +
                    'Booking days ahead' +
                  '</label>' +
                  '<input name="booking_days_ahead" type="number" min="0" max="365" class="form-control" value="' +
                    settings.booking_days_ahead +
                  '">' +
                  '<div class="form-text">' +
                    '0 = no limit.' +
                  '</div>' +
                '</div>' +

                '<div class="col-sm-6">' +
                  '<label class="form-label">' +
                    'Booking cutoff (minutes)' +
                  '</label>' +
                  '<input name="booking_cutoff_minutes" type="number" min="0" class="form-control" value="' +
                    settings.booking_cutoff_minutes +
                  '">' +
                '</div>' +

                '<div class="col-sm-6">' +
                  '<label class="form-label">' +
                    'Cancellation cutoff (minutes)' +
                  '</label>' +
                  '<input name="cancellation_cutoff_minutes" type="number" min="0" class="form-control" value="' +
                    settings.cancellation_cutoff_minutes +
                  '">' +
                '</div>' +

                '<div class="col-sm-6">' +

                  '<label class="form-label">' +
                    t('Payment reminder (days before expiry)') +
                  '</label>' +

                  '<input name="payment_reminder_days_before_expiry" type="number" min="0" max="365" class="form-control" value="' +
                    paymentReminderDays +
                  '">' +

                  '<div class="form-text">' +
                    t('The reminder is sent this many days before the member\'s current membership expires. 0 = on the expiry date.') +
                  '</div>' +

                '</div>' +

                '<div class="col-12">' +
                  '<hr>' +
                '</div>' +

                '<div class="col-12">' +

                  '<div class="form-check form-switch mb-3">' +

                    '<input name="show_attendee_names" class="form-check-input" type="checkbox" id="showNames"' +
                      (
                        settings.show_attendee_names
                          ? ' checked'
                          : ''
                      ) +
                    '>' +

                    '<label class="form-check-label" for="showNames">' +
                      'Show attendee names to other members' +
                    '</label>' +

                    '<div class="form-text">' +
                      'Recommended off for member privacy. Occupancy counts remain visible.' +
                    '</div>' +

                  '</div>' +

                  '<div class="form-check form-switch mb-3">' +

                    '<input name="waitlist_enabled" class="form-check-input" type="checkbox" id="waitlistEnabled"' +
                      (
                        settings.waitlist_enabled
                          ? ' checked'
                          : ''
                      ) +
                    '>' +

                    '<label class="form-check-label" for="waitlistEnabled">' +
                      'Enable waiting list for full sessions' +
                    '</label>' +

                  '</div>' +

                  '<div class="form-check form-switch">' +

                    '<input name="auto_promote_waitlist" class="form-check-input" type="checkbox" id="autoPromote"' +
                      (
                        settings.auto_promote_waitlist
                          ? ' checked'
                          : ''
                      ) +
                    '>' +

                    '<label class="form-check-label" for="autoPromote">' +
                      'Automatically give cancelled spots to the first waiting member' +
                    '</label>' +

                  '</div>' +

                '</div>' +

              '</div>' +

              '<button class="btn btn-brand mt-4" type="submit">' +

                '<span class="button-label">' +
                  'Save settings' +
                '</span>' +

                '<span class="spinner-border spinner-border-sm ms-2 d-none"></span>' +

              '</button>' +

            '</form>' +

          '</section>' +

          '<aside class="content-grid">' +

            '<section class="section-card">' +

              '<div class="d-flex gap-3">' +

                '<div class="announcement-banner-icon">' +
                  icon('shield') +
                '</div>' +

                '<div>' +
                  '<h2 class="section-card-title mb-1">' +
                    'Privacy default' +
                  '</h2>' +
                  '<p class="section-card-subtitle">' +
                    'Member names are hidden by default. Turn them on only if the gym has decided this is appropriate.' +
                  '</p>' +
                '</div>' +

              '</div>' +

            '</section>' +

            '<section class="section-card">' +

              '<div class="d-flex gap-3">' +

                '<div class="announcement-banner-icon">' +
                  icon('clock') +
                '</div>' +

                '<div>' +

                  '<h2 class="section-card-title mb-1">' +
                    'Suggested starting rules' +
                  '</h2>' +

                  '<p class="section-card-subtitle mb-0">' +
                    '30 days ahead, booking closes 60 minutes before and cancellation closes 120 minutes before. There is no daily or active-booking quantity limit.' +
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
          'Unable to load settings',
          Api.errorMessage(error)
        )
      );
    }
  }

    return {
      renderAdminDashboard: renderAdminDashboard,
      renderAdminMembers: renderAdminMembers,
      openUserModal: openUserModal,
      openPaymentModal: openPaymentModal,
      renderAdminSchedule: renderAdminSchedule,
      loadAdminScheduleTab: loadAdminScheduleTab,
      loadTemplates: loadTemplates,
      openTemplateModal: openTemplateModal,
      loadSessions: loadSessions,
      openSessionModal: openSessionModal,
      loadClosures: loadClosures,
      openClosureModal: openClosureModal,
      renderAdminBookings: renderAdminBookings,
      openAdminBookingModal: openAdminBookingModal,
      renderAdminAnnouncements: renderAdminAnnouncements,
      openAnnouncementModal: openAnnouncementModal,
      renderAdminReports: renderAdminReports,
      renderAdminSettings: renderAdminSettings
    };
  };
})(window, document, jQuery);
