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

/** Robust Denver 5:00 PM deadline (handles DST correctly without external libs). */
function getDenverOffsetMs(dateISO) {
  const [y, m, d] = dateISO.split('-').map(Number);
  // Pick UTC noon; for a given local day the offset doesn't change around 5 PM
  const utcNoon = Date.UTC(y, m - 1, d, 12, 0, 0);
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });
  const parts = fmt.formatToParts(new Date(utcNoon));
  const get = (t) => +parts.find(p => p.type === t).value;
  const asIfUTC = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return asIfUTC - utcNoon; // local - UTC (ms)
}

export function isClosed(dateISO, now = new Date()) {
  const [y, m, d] = dateISO.split('-').map(Number);
  const offset = getDenverOffsetMs(dateISO);
  // local 17:00 as if UTC minus offset => actual UTC timestamp of 5 PM Denver
  const localAsUTC = Date.UTC(y, m - 1, d, 17, 0, 0);
  const deadlineUTCms = localAsUTC - offset;
  return now.getTime() > deadlineUTCms;
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
