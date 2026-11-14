// Trova dove comprare i vini del Radar (Berebene 2026).
// Metodo: 1) legge la sitemap che ogni negozio pubblica per i motori di ricerca
// (nessuna ricerca interna, nessun blocco aggirato); 2) confronta gli indirizzi
// con i vini della guida; 3) APRE ogni pagina candidata e ci legge nome,
// produttore, prezzo e disponibilità; 4) tiene solo i riscontri certi.
// I link sono quelli pubblicati dal negozio: non se ne costruisce nessuno.
import fs from 'node:fs';
import { norm, tokens, prodTokens, stripYear, years, buildVocab, profile, isCandidate, verify } from './match.mjs';

const UA = 'Mozilla/5.0 (compatible; CantinaVino-PriceCheck/1.0; uso personale)';
const LIMIT = +(process.env.LIMIT || 0);           // 0 = tutti i vini
const MAX_CAND = 3;                                 // pagine aperte al massimo per vino e negozio
const SHOPS = [
  { id: 'tannico', name: 'Tannico', host: 'www.tannico.it', tried: true, sitemap: 'https://www.tannico.it/sitemap.xml', child: /sitemap_products_/, keep: /\/products\// },
  { id: 'bernabei', name: 'Bernabei', host: 'www.bernabei.it', tried: true, sitemap: 'https://www.bernabei.it/sitemaps/sitemap_b2c_it_it.xml' },
  { id: 'vinocom', name: 'Vino.com', host: 'www.vino.com', tried: true, sitemap: 'https://www.vino.com/sitemap.xml', keep: /\/dettaglio\// },
  { id: 'callmewine', name: 'Callmewine', host: 'www.callmewine.com', tried: true, sitemap: 'https://www.callmewine.com/sitemap/pdp-it.xml' },
  { id: 'signorvino', name: 'Signorvino', host: 'www.signorvino.com', tried: true, sitemap: 'https://www.signorvino.com/it/sitemap_0-product.xml', drop: /\/it\/en\// },
  { id: 'xtrawine', name: 'XtraWine', host: 'www.xtrawine.com', tried: false, sitemap: 'https://www.xtrawine.com/sitemap.xml', child: /sitemap_products_/, keep: /\/products\//, preferIt: true },
  { id: 'bottleofitaly', name: 'Bottle of Italy', host: 'bottleofitaly.com', tried: false, sitemap: 'https://bottleofitaly.com/sitemap.xml', child: /sitemap_products_/, keep: /\/products\// },
  { id: 'svinando', name: 'Svinando', host: 'www.svinando.com', tried: false, sitemap: 'https://www.svinando.com/sitemap-006-it.xml' },
  { id: 'wineshop', name: 'Wineshop.it', host: 'www.wineshop.it', tried: false, sitemap: 'https://www.wineshop.it/sitemaps/it/sitemap.xml' },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const decode = s => String(s || '').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));

// Una richiesta alla volta per negozio, con pausa. Se il negozio rifiuta più
// volte di fila (403/429) ci si ferma: nessun tentativo di aggirare il blocco.
function client(shop) {
  let last = 0, refused = 0;
  return async function get(url) {
    if (shop.blocked) return { status: 0, text: '' };
    const wait = last + 350 - Date.now(); if (wait > 0) await sleep(wait);
    last = Date.now();
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'it-IT,it;q=0.9' }, redirect: 'follow', signal: AbortSignal.timeout(30000) });
      const text = await r.text();
      if (r.status === 403 || r.status === 429) { if (++refused >= 4) shop.blocked = true; } else refused = 0;
      shop.requests = (shop.requests || 0) + 1;
      return { status: r.status, text, final: r.url };
    } catch (e) { return { status: 0, text: '', error: String(e) }; }
  };
}

// Sitemap → elenco {url, title?}. Segue un livello di indice.
async function readSitemap(shop, get) {
  const entries = new Map();
  const parse = xml => {
    for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
      const loc = (m[1].match(/<loc>\s*([^<]+?)\s*<\/loc>/) || [])[1]; if (!loc) continue;
      const url = decode(loc);
      if (shop.keep && !shop.keep.test(url)) continue;
      if (shop.drop && shop.drop.test(url)) continue;
      const title = decode((m[1].match(/<image:title>\s*(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?\s*<\/image:title>/) || [])[1] || '');
      entries.set(url, { url, title });
    }
  };
  const top = await get(shop.sitemap);
  if (top.status !== 200) { shop.note = 'sitemap non leggibile (' + (top.status || top.error) + ')'; return []; }
  if (/<sitemapindex/i.test(top.text)) {
    let kids = [...top.text.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map(m => decode(m[1]));
    if (shop.child) kids = kids.filter(k => shop.child.test(k));
    for (const k of kids) { const x = await get(k); if (x.status === 200) parse(x.text); if (shop.blocked) break; }
  } else parse(top.text);
  let list = [...entries.values()];
  if (shop.preferIt) {            // stesso prodotto in più lingue: tiene l'italiano
    const byHandle = new Map();
    for (const e of list) {
      const h = e.url.split('/products/')[1] || e.url;
      const it = /\/it\/products\//.test(e.url), cur = byHandle.get(h);
      if (!cur || (it && !/\/it\/products\//.test(cur.url))) byHandle.set(h, e);
    }
    list = [...byHandle.values()];
  }
  return list;
}

// Legge dalla pagina il prodotto dichiarato (schema.org Product); in mancanza, i meta Open Graph.
function readProduct(html) {
  const out = { name: '', brand: '', price: null, currency: '', avail: null };
  const visit = o => {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) return o.forEach(visit);
    const type = [].concat(o['@type'] || []).join(' ');
    if (/\bProduct\b/.test(type) && o.name && !out.name) {
      out.name = decode(String(o.name));
      const b = o.brand; out.brand = decode(typeof b === 'string' ? b : (b && (b.name || (b[0] && b[0].name))) || '');
      const offs = [].concat(o.offers || []).flatMap(x => x && x.offers ? [].concat(x.offers) : [x]).filter(Boolean);
      const src = offs[0] || [].concat(o.offers || [])[0];
      if (src) {
        const pr = src.price ?? src.lowPrice ?? (src.priceSpecification && src.priceSpecification.price);
        if (pr != null && pr !== '') out.price = +String(pr).replace(',', '.');
        out.currency = src.priceCurrency || (src.priceSpecification && src.priceSpecification.priceCurrency) || '';
        const av = offs.map(x => String(x.availability || '')).join(' ');
        if (/InStock|LimitedAvailability|OnlineOnly|PreOrder|BackOrder/i.test(av)) out.avail = 1;
        else if (/OutOfStock|SoldOut|Discontinued/i.test(av)) out.avail = 0;
      }
    }
    if (o['@graph']) visit(o['@graph']);
    if (o.mainEntity) visit(o.mainEntity);
  };
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { visit(JSON.parse(m[1].trim())); } catch (e) { /* JSON-LD rotto: si ignora */ }
  }
  const meta = k => decode((html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${k}["'][^>]*content=["']([^"']*)["']`, 'i'))
    || html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${k}["']`, 'i')) || [])[1] || '');
  if (!out.name && /product/i.test(meta('og:type'))) out.name = meta('og:title');
  if (out.price == null) { const p = meta('product:price:amount') || meta('og:price:amount'); if (p) { out.price = +p.replace(',', '.'); out.currency = out.currency || meta('product:price:currency') || meta('og:price:currency'); } }
  if (out.avail == null) { const a = meta('product:availability') || meta('og:availability'); if (/in ?stock|instock/i.test(a)) out.avail = 1; else if (/out|oos/i.test(a)) out.avail = 0; }
  if (!Number.isFinite(out.price)) out.price = null;
  return out;
}

// ── avvio ──
globalThis.window = {};
await import('../radar/pack-berebene-2026.js');
const pack = window.RADAR_PACKS[0];
let wines = pack.wines.filter(w => w.n && w.p);
const generic = buildVocab(wines);
if (LIMIT) wines = wines.slice(0, LIMIT);
const profiles = wines.map(w => profile(w, generic));
// indice: primo token del produttore → profili (per non confrontare tutto con tutto)
const byTok = new Map();
for (const p of profiles) { const k = p.prodT.slice().sort((a, b) => b.length - a.length)[0]; if (!k) continue; if (!byTok.has(k)) byTok.set(k, []); byTok.get(k).push(p); }

const offers = {}, debug = { rejects: [], perShop: {} };
async function runShop(shop) {
  const get = client(shop), st = debug.perShop[shop.id] = { urls: 0, candidates: 0, opened: 0, ok: 0, noProduct: 0, why: {} };
  const list = await readSitemap(shop, get);
  st.urls = shop.products = list.length;
  const cand = new Map();     // id vino → [{url, score}]
  for (const e of list) {
    let path = e.url.replace(/^https?:\/\/[^/]+/, '').replace(/\+/g, ' ');
    try { path = decodeURIComponent(path); } catch (err) { path = unescape(path); }
    const set = new Set([...tokens(path.replace(/[_/.-]+/g, ' ')), ...tokens(e.title)]);
    const seen = new Set();
    for (const t of set) for (const p of byTok.get(t) || []) {
      if (seen.has(p.id)) continue; seen.add(p.id);
      if (!isCandidate(p, set)) continue;
      const score = p.gen.filter(g => set.has(g)).length - set.size * 0.01 + (p.year && set.has(String(p.year)) ? 0.5 : 0);
      if (!cand.has(p.id)) cand.set(p.id, []);
      cand.get(p.id).push({ url: e.url, score });
    }
  }
  for (const p of profiles) {
    const cs = (cand.get(p.id) || []).sort((a, b) => b.score - a.score).slice(0, MAX_CAND);
    st.candidates += cs.length;
    for (const c of cs) {
      if (shop.blocked) break;
      const r = await get(c.url); st.opened++;
      if (r.status !== 200) { st.why['pagina ' + r.status] = (st.why['pagina ' + r.status] || 0) + 1; continue; }
      const pr = readProduct(r.text);
      if (!pr.name) { st.noProduct++; continue; }
      const v = verify(p, pr.name, pr.brand, generic);
      if (!v.ok) {
        const k = v.why.split(':')[0]; st.why[k] = (st.why[k] || 0) + 1;
        if (debug.rejects.length < 400) debug.rejects.push({ shop: shop.id, wine: p.id, title: pr.name, brand: pr.brand, why: v.why });
        continue;
      }
      if (pr.currency && pr.currency !== 'EUR') { st.why['valuta'] = (st.why['valuta'] || 0) + 1; continue; }
      const ys = years(pr.name).concat(years(c.url));
      (offers[p.id] = offers[p.id] || []).push({ s: shop.id, u: r.final || c.url, t: pr.name.slice(0, 140), p: pr.price, a: pr.avail, v: ys[0] || null });
      st.ok++;
      break;      // un riscontro certo per negozio basta
    }
  }
  if (shop.blocked) shop.note = 'il negozio ha rifiutato le richieste: ricerca interrotta';
}
await Promise.all(SHOPS.map(s => runShop(s).catch(e => { s.note = 'errore: ' + String(e.message || e).slice(0, 120); console.error(s.id, e); })));

const found = Object.keys(offers).length;
const out = {
  generated: new Date().toISOString(), source: pack.label, total: wines.length, found,
  shops: SHOPS.map(s => ({ id: s.id, name: s.name, host: s.host, tried: s.tried, products: s.products || 0, offers: (debug.perShop[s.id] || {}).ok || 0, note: s.note || '' })),
  offers
};
fs.writeFileSync('radar/offerte.json', JSON.stringify(out));
fs.writeFileSync('radar/_debug.json', JSON.stringify(debug, null, 1));
console.log(`vini ${wines.length} · con almeno un riscontro certo ${found}`);
console.log(JSON.stringify(debug.perShop, null, 1));
