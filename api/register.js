import { SLOT_LIMIT, withLock, readState, writeState, isClosed } from './_util.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { date, name, device } = req.body ?? {};
  if (!date || !name || !device) return res.status(400).json({ ok:false, error: 'date, name, device required' });

  const out = await withLock(date, async () => {
    if (isClosed(date)) return { ok:false, error:'closed' };
    const state = await readState(date);
    if (state.regs.some(e => e.device === device) || state.waitlist.some(e => e.device === device)) return { ok:false, error:'already-has-spot' };
    if (state.regs.some(e => e.name === name) || state.waitlist.some(e => e.name === name)) return { ok:false, error:'name-exists' };
    const entry = { name, device };
    let mode = 'registered';
    if (state.regs.length < SLOT_LIMIT) state.regs.push(entry);
    else { state.waitlist.push(entry); mode = 'waitlisted'; }
    await writeState(date, state);
    return { ok:true, mode, position: mode==='waitlisted' ? state.waitlist.length : null };
  });

  if (!out?.ok){
    const map = { closed:400, 'already-has-spot':409, 'name-exists':409, busy:423 };
    return res.status(map[out?.error] ?? 500).json(out);
  }
  return res.status(200).json(out);
}
