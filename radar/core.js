/* Radar vini da investimento — logica pura (nessun DOM), testabile da Node.
   Unisce i pacchetti dati di più fonti/edizioni (window.RADAR_PACKS) in un
   elenco unico senza doppioni, poi lo valuta con il motore a regole (ENG). */
(function (root) {
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const stripYear = n => String(n || '').replace(/\b(19|20)\d{2}\b/g, ' ');
  // Chiave di deduplicazione: nome (senza anno) + produttore + annata.
  function wineKey(w) { return norm(stripYear(w.n)) + '|' + norm(w.p) + '|' + (w.v || ''); }

  // Unisce i pacchetti: la stessa chiave in fonti/edizioni diverse diventa UNA
  // scheda con più segnalazioni (sources), non più righe. I dati verificati
  // (_gr, _prod) si tengono dal primo pacchetto che li ha.
  function mergePacks(packs) {
    const map = new Map();
    for (const pack of packs || []) {
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
    return Array.from(map.values());
  }

  // Punteggi e indici. Una segnalazione in più fonti indipendenti pesa come
  // segnale a parte (multiSource), senza alterare i punteggi del motore.
  function scoreAll(entries, settings) {
    const ENG = root.ENG, S = settings || ENG.DEFAULT_SETTINGS;
    return entries.map(w => {
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
    const score = w => (w.cls === 'blue' ? w.BC : w.DI) + (w.multiSource ? 3 : 0);
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
  root.RADAR = { norm, wineKey, mergePacks, scoreAll, filterRadar, sortRadar, sourceOptions };
})(typeof window !== 'undefined' ? window : globalThis);
