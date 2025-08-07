import { kv } from '@vercel/kv';

export const SLOT_LIMIT = 6;
export const TZ = 'America/Denver';
const key = (date) => `td:session:${date}`;
const lockKey = (date) => `td:lock:${date}`;

export async function readState(date) {
  return (await kv.get(key(date))) ?? { regs: [], waitlist: [] };
}
export async function writeState(date, state) {
  await kv.set(key(date), state);
}
// NEW: same-day 5 PM deadline in America/Denver
export function isClosed(dateISO, now = new Date()) {
  const session = new Date(`${dateISO}T00:00:00`);
  const local = new Date(session.toLocaleString('en-US', { timeZone: TZ }));
  local.setHours(17, 0, 0, 0); // 5:00 PM local time on the day of session
  const deadlineUTC = new Date(local.toLocaleString('en-US', { timeZone: 'UTC' }));
  return now > deadlineUTC;
}
export async function withLock(date, fn) {
  const lk = lockKey(date);
  const token = Math.random().toString(36).slice(2);
  const ok = await kv.set(lk, token, { nx: true, px: 5000 });
  if (!ok) return { ok: false, error: 'busy' };
  try { return await fn(); }
  finally {
    const v = await kv.get(lk);
    if (v === token) await kv.del(lk);
  }
}
