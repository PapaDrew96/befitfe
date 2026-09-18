# BE-FIT Frontend / PWA

Mobile-first frontend for the BE-FIT Slim PHP API.

## Stack

- HTML5 single-page application
- Bootstrap 5.3.8
- jQuery 3.7.1
- Select2 4.0.13
- Custom global CSS (`assets/css/style.css`)
- Hash routing (no server-side rewrite dependency)
- PWA manifest + service worker

## Local Laragon setup

1. Place this folder at:

   `C:\laragon\www\befit-frontend`

2. Add this hosts entry if Laragon does not create it automatically:

   `127.0.0.1 befit.test`

3. Use `server/laragon-apache-vhost.conf.example` as the frontend vhost and restart Apache.

4. The frontend API endpoint is configured in `assets/js/config.js`.

   - HTTP local frontend -> `http://befitapi.test:8082/api/v1`
   - HTTPS local frontend -> `https://befitapi.test/api/v1`

5. Because the frontend and backend are separate origins, update the BACKEND `.env` so the frontend origin is allowed. For the current HTTP Laragon setup:

   `CORS_ALLOWED_ORIGINS=http://befit.test:8082,http://localhost:3000,http://127.0.0.1:3000`

   If you later use local HTTPS, add:

   `https://befit.test`

6. Open:

   `http://befit.test:8082`

   Sign in using the admin account already created in the backend.

## Production deployment

- Serve the frontend over HTTPS.
- Change `API_BASE_URL` logic in `assets/js/config.js` to the production API origin.
- Add the exact production frontend origin to the backend `CORS_ALLOWED_ORIGINS`.
- HTTPS is required for service workers/PWA installation on normal domains.
- The service worker caches only the application shell. API responses are never cached so booking capacity remains live.

## Included functionality

### Member

- Login using email or phone + password
- Weekly dated schedule with previous/next week navigation
- Day selector and live capacity
- Attendee names when enabled by admin settings
- Reserve session
- Cancel own booking
- My upcoming bookings
- Active announcements
- Profile editing
- Password change
- Logout
- Installable PWA support

### Administrator

- Dashboard with daily totals and live session occupancy
- Member create/edit/search/filter/pagination
- Recurring schedule template create/edit/deactivate
- Dated session create/edit with capacity/status/note
- Full-day closure create/remove
- Booking search/filter/pagination
- Manual booking creation using Select2 member/session selectors
- Admin booking cancellation
- Announcement CRUD
- Gym settings and attendee-name privacy control
- Member-view schedule access

## Important backend behavior respected by the UI

- Admin users are created through `/admin/users`; there is no public registration endpoint.
- Session capacity is authoritative on the server.
- Duplicate/full/past/closed booking conflicts are shown using API error messages.
- Changing a password revokes all tokens, so the frontend signs the user out after a successful change.
- There is no API endpoint for deleting dated sessions; use the session status `closed` or `cancelled` instead.

## V2 additions

- configurable booking/cancellation limits from Admin → Settings
- waiting list on full sessions, including automatic promotion after cancellation
- in-app member notifications
- forced password change for temporary passwords
- Forgot password / reset password flow
- attendance statuses: Booked / Checked in / No-show
- administrator attendance report
- attendee-name privacy defaults to hidden after the V2 migration

When upgrading an existing frontend, replace `index.html`, `assets/js/api.js`, `assets/js/app.js`, `assets/css/style.css`, and `service-worker.js`. Then hard-refresh once (`Ctrl+F5`) so the PWA shell updates.


## V2 operational additions

- Admin → Bookings includes an active waiting-list queue below the booking table.
- Members receive in-app alerts for bookings, cancellations, waiting-list promotion, and schedule closures/cancellations.
- Admin → Reports provides attendance/no-show/history metrics.
- Admin → Settings controls booking/cancellation windows, per-day/active booking limits, privacy, and waiting-list behavior.
- New members can be forced to replace a temporary password, and the login screen includes password recovery.


## V3 additions

- Complete English / Greek interface switcher. The selected language is stored in the browser.
- `My Payments / Οι πληρωμές μου` member page showing current paid-until date and payment history.
- Admin payment validation and payment history from the Members screen.
- Temporary password generator + copy button for member onboarding.
- Removed maximum-active-bookings and maximum-bookings-per-day rules. Capacity, duplicate-session protection, cutoffs and waitlist behavior remain.
- Responsive hardening for member and admin screens, including mobile stacked tables. Existing BE-FIT colors were not changed.

The payment status is informational and **never blocks bookings**, even if expired or missing.

Backend V3 requires `database/migrations/003_payments_and_booking_rules.sql` on an existing V2 database.
