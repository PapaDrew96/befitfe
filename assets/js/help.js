(function (window, document, $) {
  'use strict';

  window.BefitChunkFactories = window.BefitChunkFactories || {};

  window.BefitChunkFactories.help = function (ctx) {
    var Api = ctx.Api;
    var I18n = ctx.I18n;
    var state = ctx.state;
    var t = ctx.t;
    var icon = ctx.icon;
    var hydrateIcons = ctx.hydrateIcons;
    var escapeHtml = ctx.escapeHtml;
    var setPageMeta = ctx.setPageMeta;

    function tr(value) {
      return escapeHtml(
        t(value)
      );
    }

    function hasValue(settings, key) {
      return settings &&
        settings[key] !== undefined &&
        settings[key] !== null &&
        settings[key] !== '';
    }

    function formatMinutes(value) {
      var minutes = Number(value);

      if (!isFinite(minutes) || minutes < 0) {
        return '';
      }

      if (minutes === 0) {
        return t('Until the session starts');
      }

      var hours =
        Math.floor(
          minutes / 60
        );

      var rest =
        minutes % 60;

      var parts = [];

      if (hours) {
        parts.push(
          hours + ' ' +
          t(
            hours === 1
              ? 'hour'
              : 'hours'
          )
        );
      }

      if (rest) {
        parts.push(
          rest + ' ' +
          t(
            rest === 1
              ? 'minute'
              : 'minutes'
          )
        );
      }

      return parts.join(' ');
    }

    function guideCard(number, title, body, items) {
      return '' +
        '<section class="section-card help-guide-card">' +
          '<div class="help-guide-heading">' +
            '<span class="help-guide-number">' + number + '</span>' +
            '<div>' +
              '<h2 class="section-card-title">' + tr(title) + '</h2>' +
              '<p class="section-card-subtitle">' + tr(body) + '</p>' +
            '</div>' +
          '</div>' +
          '<ol class="help-step-list">' +
            items.map(function (item) {
              return '<li>' + tr(item) + '</li>';
            }).join('') +
          '</ol>' +
        '</section>';
    }

    function ruleItem(label, value, description) {
      return '' +
        '<div class="help-rule-item">' +
          '<span class="help-rule-label">' + tr(label) + '</span>' +
          '<strong>' + escapeHtml(value) + '</strong>' +
          '<p>' + tr(description) + '</p>' +
        '</div>';
    }

    function renderRules(settings) {
      var items = [];

      if (hasValue(settings, 'booking_days_ahead')) {
        var days =
          Number(
            settings.booking_days_ahead
          );

        items.push(
          ruleItem(
            'Booking window',
            days === 0
              ? t('No limit')
              : days + ' ' + t(days === 1 ? 'day' : 'days'),
            days === 0
              ? 'There is no advance-booking limit set by the gym.'
              : 'You can reserve a session up to this far in advance.'
          )
        );
      }

      if (hasValue(settings, 'booking_cutoff_minutes')) {
        items.push(
          ruleItem(
            'Booking deadline',
            formatMinutes(
              settings.booking_cutoff_minutes
            ),
            Number(settings.booking_cutoff_minutes) === 0
              ? 'Bookings remain open until the session starts.'
              : 'Bookings close this long before the session starts.'
          )
        );
      }

      if (hasValue(settings, 'cancellation_cutoff_minutes')) {
        items.push(
          ruleItem(
            'Cancellation deadline',
            formatMinutes(
              settings.cancellation_cutoff_minutes
            ),
            Number(settings.cancellation_cutoff_minutes) === 0
              ? 'You can cancel until the session starts.'
              : 'Member cancellations close this long before the session starts.'
          )
        );
      }

      if (hasValue(settings, 'waitlist_enabled')) {
        var waitlistEnabled =
          !!Number(
            settings.waitlist_enabled
          ) ||
          settings.waitlist_enabled === true;

        items.push(
          ruleItem(
            'Waiting list',
            t(
              waitlistEnabled
                ? 'Available'
                : 'Not available'
            ),
            waitlistEnabled
              ? 'When a session is full, you can join its waiting list.'
              : 'The waiting list is currently disabled.'
          )
        );
      }

      if (
        hasValue(settings, 'auto_promote_waitlist') &&
        (
          !!Number(settings.waitlist_enabled) ||
          settings.waitlist_enabled === true
        )
      ) {
        var autoPromote =
          !!Number(
            settings.auto_promote_waitlist
          ) ||
          settings.auto_promote_waitlist === true;

        items.push(
          ruleItem(
            'Automatic waiting-list promotion',
            t(
              autoPromote
                ? 'On'
                : 'Off'
            ),
            autoPromote
              ? 'If a place opens, the first eligible waiting member is booked automatically.'
              : 'A free place is not assigned automatically from the waiting list.'
          )
        );
      }

      if (hasValue(settings, 'show_attendee_names')) {
        var namesVisible =
          !!Number(
            settings.show_attendee_names
          ) ||
          settings.show_attendee_names === true;

        items.push(
          ruleItem(
            'Attendee names',
            t(
              namesVisible
                ? 'Visible'
                : 'Hidden'
            ),
            namesVisible
              ? 'Member names may be shown in the session attendee list.'
              : 'Only occupancy numbers are shown to other members.'
          )
        );
      }

      if (!items.length) {
        $('#helpRulesCard').remove();
        return;
      }

      $('#helpRulesCard').html(
        '<div class="section-card-header">' +
          '<div>' +
            '<h2 class="section-card-title">' + tr('Your gym rules') + '</h2>' +
            '<p class="section-card-subtitle">' + tr('These values come from the current BE-FIT booking settings.') + '</p>' +
          '</div>' +
          '<span class="badge-soft-brand">' + tr('Live rules') + '</span>' +
        '</div>' +
        '<div class="help-rules-grid">' +
          items.join('') +
        '</div>'
      );
    }

    async function loadRules() {
      try {
        var response =
          await Api.get(
            '/booking-rules'
          );

        return response.data || {};

      } catch (error) {
        if (
          state.user &&
          state.user.role === 'admin'
        ) {
          try {
            var adminResponse =
              await Api.get(
                '/admin/settings'
              );

            return adminResponse.data || {};

          } catch (adminError) {
            return null;
          }
        }

        return null;
      }
    }

    async function renderHelpPage() {
      setPageMeta(
        'Help',
        'Member guide'
      );

      $('#pageContent').html(
        '<div class="help-page">' +

          '<section class="help-hero">' +
            '<div class="help-hero-icon">' +
              icon('help-circle') +
            '</div>' +
            '<div class="min-w-0">' +
              '<p class="eyebrow mb-2">' + tr('BE-FIT GUIDE') + '</p>' +
              '<h2>' + tr('Using BE-FIT is simple') + '</h2>' +
              '<p>' + tr('Use the schedule to reserve your training, manage your bookings and stay informed about any changes.') + '</p>' +
              '<div class="help-hero-actions">' +
                '<button class="btn btn-light" type="button" data-route="#/schedule">' +
                  icon('calendar') +
                  tr('Open schedule') +
                '</button>' +
                '<button class="btn btn-outline-light" type="button" data-route="#/bookings">' +
                  icon('calendar-check') +
                  tr('My bookings') +
                '</button>' +
              '</div>' +
            '</div>' +
          '</section>' +

          '<section id="helpRulesCard" class="section-card">' +
            '<div class="help-rules-loading">' +
              '<span class="spinner-border spinner-border-sm text-brand" aria-hidden="true"></span>' +
              '<span>' + tr('Loading current gym rules…') + '</span>' +
            '</div>' +
          '</section>' +

          '<div class="help-guide-grid">' +
            guideCard(
              1,
              'Find a training session',
              'Your weekly schedule always shows the latest availability.',
              [
                'Open Schedule and choose the day you want.',
                'Check the time, available places and any note from the gym.',
                'Use the week arrows to move forward or back.'
              ]
            ) +
            guideCard(
              2,
              'Reserve your place',
              'A reservation is confirmed only after the app accepts it.',
              [
                'Select Reserve place on the session you want.',
                'Confirm the reservation.',
                'The session will show Your booking and you will receive a notification.'
              ]
            ) +
            guideCard(
              3,
              'If a session is full',
              'The waiting-list option appears only when the gym has enabled it.',
              [
                'Select Join waiting list when the option is available.',
                'You can leave the queue at any time from the same session.',
                'If you receive a place, check Notifications and My bookings.'
              ]
            ) +
            guideCard(
              4,
              'Cancel a booking',
              'Cancel early when your plans change so the place can be used by someone else.',
              [
                'Open Schedule or My bookings.',
                'Select Cancel booking and confirm.',
                'If the cancellation deadline has passed, contact the gym.'
              ]
            ) +
            guideCard(
              5,
              'Payments and updates',
              'BE-FIT keeps your membership information and gym updates in one place.',
              [
                'My payments shows the membership payment status recorded by the gym.',
                'Notices contains general messages for all members.',
                'Notifications contains personal booking confirmations, reminders and schedule changes.'
              ]
            ) +
            guideCard(
              6,
              'Profile and account',
              'Keep your details current so the gym can contact you when needed.',
              [
                'Use Profile to update your name, email or phone.',
                'You can change your password from Profile.',
                'Use EN / EL in the header to switch the application language.'
              ]
            ) +
          '</div>' +

          '<section class="section-card help-contact-card">' +
            '<div class="help-contact-icon">' +
              icon('info') +
            '</div>' +
            '<div>' +
              '<h2 class="section-card-title">' + tr('Need more help?') + '</h2>' +
              '<p class="section-card-subtitle mb-0">' + tr('For account access, exceptional late cancellations or questions about the training schedule, contact the BE-FIT gym administrator.') + '</p>' +
            '</div>' +
          '</section>' +

        '</div>'
      );

      hydrateIcons(
        '#pageContent'
      );

      var rules =
        await loadRules();

      if (
        state.route !== '#/help'
      ) {
        return;
      }

      if (rules) {
        renderRules(rules);
      } else {
        $('#helpRulesCard').remove();
      }
    }

    return {
      renderHelpPage: renderHelpPage
    };
  };
})(window, document, jQuery);
