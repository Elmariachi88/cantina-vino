// Sonda: controlla quali negozi rispondono dal runner di GitHub e cosa pubblicano
// (robots.txt, sitemap, catalogo Shopify). Non aggira nessun blocco: registra e basta.
import fs from 'node:fs';
const UA = 'Mozilla/5.0 (compatible; CantinaVino-PriceCheck/1.0; uso personale)';
const shops = ['www.tannico.it','www.bernabei.it','www.vino.com','www.callmewine.com','www.signorvino.com',
  'www.xtrawine.com','bottleofitaly.com','www.vino75.com','www.svinando.com','www.wineshop.it'];
async function get(url) {
  try {
    const r = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'it-IT,it' }, redirect: 'follow', signal: AbortSignal.timeout(25000) });
    const t = await r.text();
    return { url, final: r.url, status: r.status, type: r.headers.get('content-type'), len: t.length, head: t.slice(0, 1500), text: t };
  } catch (e) { return { url, error: String(e) }; }
}
const out = {};
for (const h of shops) {
  const o = out[h] = {};
  const rb = await get(`https://${h}/robots.txt`);
  o.robots = { status: rb.status, error: rb.error, sitemaps: (rb.text || '').split('\n').filter(l => /^sitemap:/i.test(l)).map(l => l.split(/:\s*/).slice(1).join(':').trim()),
    disallow: (rb.text || '').split('\n').filter(l => /disallow/i.test(l)).slice(0, 40) };
  const pj = await get(`https://${h}/products.json?limit=2`);
  o.productsJson = { status: pj.status, type: pj.type, final: pj.final, head: (pj.head || pj.error || '').slice(0, 900) };
  const sm = [];
  for (const s of (o.robots.sitemaps.length ? o.robots.sitemaps : [`https://${h}/sitemap.xml`]).slice(0, 3)) {
    const x = await get(s);
    const locs = [...(x.text || '').matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(m => m[1]);
    const e = { url: s, status: x.status, error: x.error, len: x.len, nLoc: locs.length, sample: locs.slice(0, 12) };
    // un livello sotto: la prima sitemap figlia che sembra di prodotti
    const child = locs.find(l => /product|prodott|dettaglio|vini|wine/i.test(l) && /\.xml/.test(l)) || locs.find(l => /\.xml/.test(l));
    if (child) { const c = await get(child); const cl = [...(c.text || '').matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(m => m[1]);
      e.child = { url: child, status: c.status, len: c.len, nLoc: cl.length, sample: cl.slice(0, 8) }; }
    sm.push(e);
  }
  o.sitemaps = sm;
  const hp = await get(`https://${h}/`);
  o.home = { status: hp.status, final: hp.final, error: hp.error, len: hp.len, shopify: /cdn\.shopify\.com|Shopify\.shop/.test(hp.text || ''), blocked: /captcha|cf-chl|Access Denied|Just a moment/i.test(hp.text || '') };
}
fs.mkdirSync('radar', { recursive: true });
fs.writeFileSync('radar/_probe.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, { home: v.home.status, pj: v.productsJson.status, sm: v.sitemaps.map(s => s.status + ':' + s.nLoc) }]))));
