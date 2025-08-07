# Tennis Drill — Smart Burst Polling

- Idle poll every 30s (when tab is visible).
- When a change is detected *or* after user action (register/cancel/session switch/focus),
  poll every **2s** for **30s**, then fall back to idle.
- API responses include `Cache-Control: no-store` to avoid caching.
