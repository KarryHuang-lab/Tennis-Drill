# Tennis Drill — Version Watch

- Clients poll a tiny `/api/version?date=YYYY-MM-DD` every 2s.
- On version change, they fetch `/api/session` and update the UI immediately.
- Register/Cancel bumps a `td:ver:DATE` key (INCR).
- API responses are `no-store` to avoid caching.
