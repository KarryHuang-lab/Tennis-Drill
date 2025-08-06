import { SLOT_LIMIT, readState, isClosed } from './_util.js';
export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const date = url.searchParams.get('date');
  if (!date) return res.status(400).json({ error: 'date required (YYYY-MM-DD)' });
  const state = await readState(date);
  const remaining = Math.max(0, SLOT_LIMIT - state.regs.length);
  return res.status(200).json({ regs: state.regs, waitlist: state.waitlist, remaining, closed: isClosed(date) });
}
