/* Radar vini da investimento — logica pura (nessun DOM), testabile da Node.
   Unisce i pacchetti dati di più fonti/edizioni (window.RADAR_PACKS) in un
   elenco unico senza doppioni, poi lo valuta con il motore a regole (ENG). */
(function (root) {
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const stripYear = n => String(n || '').replace(/\b(19|20)\d{2}\b/g, ' ');
  // Chiave di deduplicazione: nome (senza anno) + produttore + annata.
  function wineKey(w) { return norm(stripYear(w.n)) + '|' + norm(w.p) + '|' + (w.v || ''); }

  // Confronto tra nomi di produttore: tolte le parole generiche (azienda, domaine…)
  // i nomi devono coincidere, oppure uno contenere l'altro con almeno 2 parole
  // (così "Curto" non si confonde con "Nadia Curto", né "COS" con "Costadilà").
  const GENERIC = new Set('il lo la le i gli di de del della dei degli du des et e and azienda agricola agricole cantina cantine tenuta tenute fattoria podere domaine chateau maison weingut bodega celler societa semplice soc agr vini vigneti vigneto'.split(' '));
  const prodTokens = s => norm(String(s || '').replace(/\(.*?\)/g, ' ')).split(' ').filter(t => t && !GENERIC.has(t));
  function sameProducer(a, b) {
    const A = prodTokens(a), B = prodTokens(b);
    if (!A.length || !B.length) return false;
    const [sm, lg] = A.length <= B.length ? [A, B] : [B, A];
    if (!sm.every(t => lg.includes(t))) return false;
    return sm.length === lg.length || sm.length >= 2;
  }

  // Stesso nome in regioni diverse = produttori diversi (es. due "Pratello"). Regione
  // mancante o '-' = non si può escludere. Confronto sul prefisso (Trentino-AA / Trentino-Alto Adige).
  const sameRegion = (a, b) => { const x = norm(a), y = norm(b); return !x || !y || x === 'non indicata' || y === 'non indicata' || x.slice(0, 5) === y.slice(0, 5); };
  // Unisce i pacchetti: la stessa chiave in fonti/edizioni diverse diventa UNA
  // scheda con più segnalazioni (sources), non più righe. I dati verificati
  // (_gr, _prod) si tengono dal primo pacchetto che li ha. I pacchetti di
  // PRODUTTORI (es. Triple A) aggiungono la loro segnalazione ai vini di quel
  // produttore; i produttori senza vini nel radar restano come schede a sé
  // (kind:'producer'), senza punteggio: non c'è un vino da valutare.
  function mergePacks(packs) {
    const map = new Map();
    const prodPacks = [];
    for (const pack of packs || []) {
      if (pack.producers) { prodPacks.push(pack); continue; }
      for (const w of pack.wines || []) {
        const k = wineKey(w);
        const sig = { source: pack.source, edition: pack.edition, label: pack.label || (pack.source + ' ' + pack.edition), note: w.g || '' };
        let e = map.get(k);
        if (!e) { e = Object.assign({}, w, { key: k, sources: [] }); map.set(k, e); }
        else {
          if (!e._gr && w._gr) e._gr = w._gr;
          if (!e._prod && w._prod) e._prod = w._prod;
          if (w.g && !(e.g || '').includes(w.g)) e.g = e.g ? e.g + ' · ' + w.g : w.g;
        }
        if (!e.sources.some(s => s.source === sig.source && s.edition === sig.edition)) e.sources.push(sig);
      }
    }
    const wineList = Array.from(map.values());
    const out = wineList.slice();
    for (const pack of prodPacks) {
      const label = pack.label || (pack.source + ' ' + pack.edition);
      for (const pr of pack.producers) {
        const sig = { source: pack.source, edition: pack.edition, label, note: 'Produttore ' + pack.source + (pr.nation ? ' · ' + pr.nation : '') };
        let matched = false;
        for (const e of wineList) {
          if (e.kind === 'producer' || !sameProducer(e.p, pr.p) || !sameRegion(e.r, pr.r)) continue;
          matched = true;
          if (!e.sources.some(s => s.source === sig.source && s.edition === sig.edition)) e.sources.push(sig);
        }
        if (!matched) {
          const k = 'prod|' + norm(pr.p);
          let e = out.find(x => x.key === k);
          if (!e) { e = { kind: 'producer', key: k, n: pr.p, p: pr.p, r: pr.r || '', nation: pr.nation || '', t: '', v: null, g: '', sources: [] }; out.push(e); }
          if (!e.sources.some(s => s.source === sig.source && s.edition === sig.edition)) e.sources.push(sig);
        }
      }
    }
    return out;
  }

  // Punteggi e indici. Una segnalazione in più fonti indipendenti pesa come
  // segnale a parte (multiSource), senza alterare i punteggi del motore.
  function scoreAll(entries, settings) {
    const ENG = root.ENG, S = settings || ENG.DEFAULT_SETTINGS;
    return entries.map(w => {
      if (w.kind === 'producer') return Object.assign({}, w, { sc: null, reasons: [], flags: [], DI: 0, BC: 0, cls: 'produttore', dataConfidence: 'bassa', multiSource: false, nSources: w.sources.length });
      const b = ENG.baseScores(w);
      const idx = ENG.indices(b.sc, S.weights);
      const nSrc = new Set(w.sources.map(s => s.source)).size;
      return Object.assign({}, w, { sc: b.sc, denomWhy: b.denom, plevel: b.plevel, reasons: b.reasons, flags: b.flags,
        DI: idx.DI, BC: idx.BC, cls: idx.cls, dataConfidence: b.dataConfidence, multiSource: nSrc > 1, nSources: nSrc });
    });
  }

  // Filtri: classi, fonte (stringa 'Berebene' o 'Berebene|2026'), testo, tipo.
  function filterRadar(list, f) {
    f = f || {};
    const q = norm(f.text || '');
    return list.filter(w => {
      if (f.classes && f.classes.size && !f.classes.has(w.cls)) return false;
      if (f.source && !w.sources.some(s => s.source === f.source || (s.source + '|' + s.edition) === f.source)) return false;
      if (f.type && w.t !== f.type) return false;
      if (f.multiOnly && !w.multiSource) return false;
      if (q && !norm([w.n, w.p, w.r].join(' ')).includes(q)) return false;
      return true;
    });
  }
  function sortRadar(list) {
    const score = w => w.cls === 'produttore' ? -1 : (w.cls === 'blue' ? w.BC : w.DI) + (w.multiSource ? 3 : 0);
    return list.slice().sort((a, b) => score(b) - score(a) || a.n.localeCompare(b.n, 'it'));
  }
  function sourceOptions(packs) {
    const out = [];
    for (const p of packs || []) {
      if (!out.some(o => o.value === p.source)) out.push({ value: p.source, label: p.source + ' (tutte le edizioni)' });
      out.push({ value: p.source + '|' + p.edition, label: p.label || (p.source + ' ' + p.edition) });
    }
    return out;
  }
  root.RADAR = { sameProducer, norm, wineKey, mergePacks, scoreAll, filterRadar, sortRadar, sourceOptions };
})(typeof window !== 'undefined' ? window : globalThis);
