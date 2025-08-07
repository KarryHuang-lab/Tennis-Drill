import { withLock, readState, writeState } from './_util.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') { 
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
 return res.status(405).end(); }
  const { date, device, name } = req.body ?? {};
  if (!date) { 
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
 return res.status(400).json({ ok:false, error: 'date required' }); }

  const out = await withLock(date, async () => {
    const state = await readState(date);
    let idx = -1; let removedFromRegs = false;

    if (device){ idx = state.regs.findIndex(e => e.device === device); if (idx === -1) idx = state.waitlist.findIndex(e => e.device === device); }
    else if (name){ idx = state.regs.findIndex(e => !e.device && e.name === name); if (idx === -1) idx = state.waitlist.findIndex(e => !e.device && e.name === name); }

    if (idx === -1) return { ok:false, error:'forbidden-or-not-found' };

    removedFromRegs = state.regs[idx]?.name != null && (state.regs[idx]?.device ? (device && state.regs[idx].device === device) : (!device && state.regs[idx].name === name));
    if (removedFromRegs) state.regs.splice(idx,1); else state.waitlist.splice(idx,1);

    if (removedFromRegs && state.waitlist.length){
      const promoted = state.waitlist.shift();
      state.regs.push(promoted);
      await writeState(date, state);
      return { ok:true, promoted };
    }
    await writeState(date, state);
    return { ok:true };
  });

  if (!out?.ok) { 
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
 return res.status(403).json(out); }
  
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  return res.status(200).json(out);
}
