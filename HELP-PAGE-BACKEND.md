# BE-FIT Help page — backend requirement

The frontend Help page is available at `#/help` and loads member-facing booking rules from:

`GET /api/v1/booking-rules`

This endpoint should require the normal authenticated member/admin Bearer token, but **must not require the admin role**.

Return only settings that are safe and useful to members:

```json
{
  "success": true,
  "data": {
    "booking_days_ahead": 30,
    "booking_cutoff_minutes": 60,
    "cancellation_cutoff_minutes": 120,
    "waitlist_enabled": true,
    "auto_promote_waitlist": true,
    "show_attendee_names": false
  },
  "message": "OK",
  "errors": [],
  "meta": {}
}
```

Rules are rendered only when the corresponding key/value exists. A numeric value of `0` is treated as a real configured value and shown using its no-limit/until-start meaning.

Do not expose the full `/admin/settings` payload to members. The Help page has an admin-only fallback to `/admin/settings` so administrators can preview the page before the member endpoint is deployed; normal members do not use that fallback.
