// api/_util.js —— Upstash 版本
import { Redis } from '@upstash/redis';

export const SLOT_LIMIT = 6;
export const TZ = 'America/Denver';
const key = (date) => `td:session:${date}`;
const lockKey = (date) => `td:lock:${date}`;

const redis = Redis.fromEnv(); // 使用 UPSTASH_REDIS_REST_URL / TOKEN

export async function readState(date) {
  const raw = await redis.get(key(date));
  return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : { regs: [], waitlist: [] };
}

export async function writeState(date, state) {
  await redis.set(key(date), JSON.stringify(state));
}

// 截止时间 = 活动前一天 23:59:59（Denver 时区）
export function isClosed(dateISO, now = new Date()) {
  const session = new Date(`${dateISO}T00:00:00`);
  const local = new Date(session.toLocaleString('en-US', { timeZone: TZ }));
  local.setDate(local.getDate() - 1);
  local.setHours(23, 59, 59, 999);
  const deadlineUTC = new Date(local.toLocaleString('en-US', { timeZone: 'UTC' }));
  return now > deadlineUTC;
}

// 简单分布式锁，5 秒过期，避免并发超卖
export async function withLock(date, fn) {
  const lk = lockKey(date);
  const token = Math.random().toString(36).slice(2);
  const ok = await redis.set(lk, token, { nx: true, px: 5000 }); // 5s
  if (!ok) return { ok: false, error: 'busy' };
  try { return await fn(); }
  finally {
    const v = await redis.get(lk);
    if (v === token) await redis.del(lk);
  }
}
