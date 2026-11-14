// Confronto tra un vino della guida e una pagina prodotto di un negozio.
// Regola: "certo" solo se produttore e vino coincidono; l'annata può differire.
// Nel dubbio si scarta: meglio un "non trovato" che un link al vino sbagliato.

export const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/&amp;/g, ' ').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

const STOP = new Set('d di del della dei degli delle dello dell de da dal il lo la le i gli l e ed in a al alla con su per un una s n the of and'.split(' '));
const PROD_GENERIC = new Set('azienda agricola agricole cantina cantine tenuta tenute fattoria podere poderi domaine chateau maison weingut societa semplice soc agr vini vigneti vigneto vitivinicola winery estate wines casa'.split(' '));
const ABBR = { sup: 'superiore', ris: 'riserva', cl: 'classico', m: 'metodo' };
// Parole che un negozio aggiunge al titolo senza cambiare il vino.
const SHOP_NOISE = new Set(('doc docg igt igp dop doc aoc bio biologico biologica organic organico vino wine vini cl ml lt l bottiglia bottle '
  + 'italia italy vegan vegano naturale senza solfiti aggiunti tappo vite stelvin astuccio astucciato confezione annata vintage nv sa '
  + 'rosso bianco rosato rose red white tranquillo fermo secco dry 75 750 075 0 nuovo new edizione etichetta')
  .split(' '));
// Parole che cambiano il vino: devono esserci da entrambe le parti, o da nessuna.
const CRITICAL = ('riserva superiore classico passito spumante brut metodo frizzante ripasso amarone recioto vendemmia tardiva selezione '
  + 'grappa magnum extra dosaggio dose pas nature millesimato dolce amabile vinsanto vin santo liquoroso chinato ancestrale sur lie '
  + 'appassimento vecchie cru rosso bianco rosato rose').split(' ');
const TWO_WAY = new Set(CRITICAL.filter(t => !['rosso', 'bianco', 'rosato', 'rose'].includes(t)));
const COLORS = { rosso: 'rosso', red: 'rosso', bianco: 'bianco', white: 'bianco', rosato: 'rosato', rose: 'rosato', rosé: 'rosato' };
const FORMAT_BAD = /\b(magnum|jeroboam|doppio magnum|mezza bottiglia|half bottle|1[.,]5 ?l|150 ?cl|3 ?l(t|itri)?|300 ?cl|37[.,]?5 ?cl|375 ?ml|0[.,]375|50 ?cl|500 ?ml|bag in box|cassa|cassetta|box da|kit|set da|[2-9] ?bottiglie|[2-9] ?x ?75|x ?[2-9]\b|gift|regalo|degustazione|verticale)\b/i;

const expand = t => ABBR[t] || t;
export const stripYear = s => String(s || '').replace(/\b(19|20)\d{2}\b/g, ' ');
export const years = s => [...String(s || '').matchAll(/\b(19[5-9]\d|20[0-3]\d)\b/g)].map(m => +m[1]);
export const tokens = s => norm(s).split(' ').filter(t => t && !STOP.has(t)).map(expand);
export const prodTokens = s => norm(String(s || '').replace(/\(.*?\)/g, ' ')).split(' ')
  .filter(t => t && !STOP.has(t) && !PROD_GENERIC.has(t));

// Vocabolario generico = parole di denominazione/vitigno: compaiono nei nomi di
// almeno 3 produttori diversi. Le altre sono nomi di etichetta (distintive).
export function buildVocab(wines) {
  const df = new Map();
  for (const w of wines) for (const t of new Set(tokens(stripYear(w.n)))) {
    if (!df.has(t)) df.set(t, new Set());
    df.get(t).add(norm(w.p));
  }
  const generic = new Set();
  for (const [t, ps] of df) if (ps.size >= 3) generic.add(t);
  return generic;
}

// Profilo del vino cercato, calcolato una volta.
export function profile(w, generic) {
  const nameT = [...new Set(tokens(stripYear(w.n)))].filter(t => !/^\d+$/.test(t));
  const prodT = [...new Set(prodTokens(w.p))];
  const nameOnly = nameT.filter(t => !prodT.includes(t));
  const distinct = nameOnly.filter(t => !generic.has(t) && !TWO_WAY.has(t) && !COLORS[t]);
  const gen = nameOnly.filter(t => !distinct.includes(t));
  return { id: w.id, nameT, prodT, distinct, gen, color: COLORS[norm(w.t)] || null, sweet: /passito|dolce/i.test(w.t || ''), year: w.v || null };
}

// Filtro largo sullo slug/titolo della sitemap: decide solo se vale la pena aprire la pagina.
export function isCandidate(p, tokSet) {
  if (!p.prodT.length || !p.prodT.every(t => tokSet.has(t))) return false;
  if (!p.distinct.every(t => tokSet.has(t))) return false;
  const hit = p.gen.filter(t => tokSet.has(t)).length;
  return p.gen.length === 0 || hit / p.gen.length >= 0.5;
}

// Verifica stretta sulla pagina aperta. title = nome prodotto letto dalla pagina,
// brand = produttore letto dalla pagina (può mancare).
const SMALL = /\b(37[.,]?5 ?cl|375 ?ml|0[.,]375|50 ?cl|500 ?ml|mezza bottiglia|half bottle)\b/i;
export function verify(p, title, brand, generic) {
  const tT = tokens(stripYear(title)).filter(t => !/^\d+$/.test(t));
  const tSet = new Set(tT);
  const all = new Set([...tT, ...prodTokens(brand)]);
  const fmt = p.sweet ? title.replace(SMALL, ' ') : title;
  if (FORMAT_BAD.test(fmt)) return { ok: false, why: 'formato o confezione diversa' };
  if (!p.prodT.every(t => all.has(t))) return { ok: false, why: 'produttore diverso' };
  const missD = p.distinct.filter(t => !tSet.has(t));
  if (missD.length) return { ok: false, why: 'manca il nome etichetta: ' + missD.join(' ') };
  for (const t of TWO_WAY) {
    const inW = p.nameT.includes(t), inT = tSet.has(t);
    if (inW !== inT) return { ok: false, why: (inW ? 'la pagina non dice ' : 'la pagina aggiunge ') + t };
  }
  const tColors = new Set(tT.map(t => COLORS[t]).filter(Boolean));
  const wColorInName = p.nameT.map(t => COLORS[t]).find(Boolean);
  const wColor = wColorInName || p.color;
  if (wColor && tColors.size && !tColors.has(wColor)) return { ok: false, why: 'colore diverso' };
  const hit = p.gen.filter(t => tSet.has(t)).length;
  if (p.gen.length && hit / p.gen.length < 0.6) return { ok: false, why: 'denominazione diversa' };
  const known = new Set([...p.nameT, ...p.prodT, ...prodTokens(brand)]);
  const extras = [...tSet].filter(t => !known.has(t) && !SHOP_NOISE.has(t) && !generic.has(t) && !PROD_GENERIC.has(t) && t.length > 1);
  // Parole in più nel titolo = probabile altra etichetta dello stesso produttore.
  const allowed = p.distinct.length ? 1 : 0;
  if (extras.length > allowed) return { ok: false, why: 'parole in più: ' + extras.join(' ') };
  return { ok: true };
}
