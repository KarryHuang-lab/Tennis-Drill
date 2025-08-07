import { readVersion } from './_util.js';
export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const date = url.searchParams.get('date');
  if (!date) { 
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
 return res.status(400).json({ error: 'date required (YYYY-MM-DD)' }); }
  const ver = await readVersion(date);
  
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  return res.status(200).json({ version: ver });
}
