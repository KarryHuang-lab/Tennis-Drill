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
export function isClosed(dateISO, now = new Date()) {
  // Deadline = 11:59:59 PM the day before (America/Denver)
  const session = new Date(`${dateISO}T00:00:00`);
  const local = new Date(session.toLocaleString('en-US', { timeZone: TZ }));
  local.setDate(local.getDate() - 1);
  local.setHours(23, 59, 59, 999);
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
