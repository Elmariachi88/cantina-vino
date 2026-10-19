(function () {
  const D = (k, S, L, M, N, why) => ({ k, S, L, M, N, why });
  // Ordine: dal più specifico al più generico. Primo match vince.
  const DENOMS = [
    // — Piemonte —
    D(/barolo/i, 2, 5, 3, 5, "Barolo: denominazione di riferimento mondiale"),
    D(/barbaresco/i, 3, 5, 3, 5, "Barbaresco: Nebbiolo da collezione"),
    D(/\bboca\b/i, 5, 5, 5, 2, "Boca: Alto Piemonte, micro-denominazione in forte riscoperta"),
    D(/lessona/i, 5, 5, 5, 2, "Lessona: Alto Piemonte, micro-denominazione in riscoperta"),
    D(/bramaterra/i, 5, 5, 4, 1, "Bramaterra: Nebbiolo alpino quasi sconosciuto"),
    D(/carema/i, 5, 5, 4, 2, "Carema: Nebbiolo di montagna su terrazze"),
    D(/gattinara/i, 4, 5, 4, 3, "Gattinara: Nebbiolo longevo, prezzo sotto Langa"),
    D(/ghemme/i, 4, 5, 4, 2, "Ghemme: Nebbiolo longevo, poco conosciuto"),
    D(/timorasso|derthona/i, 4, 4, 5, 2, "Timorasso: bianco longevo in forte ascesa"),
    D(/monleale|colli tortonesi/i, 4, 4, 3, 2, "Colli Tortonesi: zona del Timorasso"),
    D(/nebbiolo d'alba|langhe nebbiolo/i, 3, 3, 3, 4, "Nebbiolo di Langa: porta d'ingresso a Barolo/Barbaresco"),
    D(/langhe rosso/i, 3, 3, 2, 3, "Langhe Rosso"),
    D(/langhe freisa|freisa/i, 4, 4, 3, 1, "Freisa: vitigno antico, tannico, longevo, ignorato dal mercato"),
    D(/ruch[eè]/i, 5, 3, 4, 1, "Ruchè: micro-denominazione, vitigno salvato dall'estinzione"),
    D(/pelaverga/i, 5, 2, 4, 1, "Pelaverga: vitigno rarissimo di Verduno"),
    D(/nascetta/i, 5, 3, 4, 1, "Nascetta: bianco autoctono quasi scomparso"),
    D(/erbaluce/i, 4, 3, 4, 1, "Erbaluce: bianco di grande acidità, invecchia"),
    D(/canavese/i, 4, 3, 3, 1, "Canavese: Nebbiolo pedemontano poco noto"),
    D(/grignolino/i, 4, 2, 4, 1, "Grignolino: rosso chiaro in rivalutazione"),
    D(/dogliani superiore/i, 3, 3, 3, 2, "Dogliani Superiore: Dolcetto da invecchiamento"),
    D(/dogliani|dolcetto/i, 2, 2, 1, 2, "Dolcetto: vino da bere giovane"),
    D(/barbera d'asti sup|barbera d'alba|lavignone/i, 2, 3, 2, 3, "Barbera strutturata"),
    D(/barbera/i, 2, 2, 2, 3, "Barbera"),
    D(/albarossa/i, 4, 3, 1, 1, "Albarossa"),
    D(/monferrato rosso/i, 2, 3, 1, 2, "Monferrato Rosso"),
    D(/gavi/i, 2, 2, 2, 3, "Gavi"),
    D(/arneis|favorita|cortese|piemonte chardonnay|langhe chardonnay/i, 2, 1, 1, 2, "Bianco piemontese da bere giovane"),
    D(/moscato|asti spumante|brachetto/i, 1, 1, 1, 3, "Aromatico dolce da bere giovane"),
    // — Lombardia —
    D(/valtellina superiore|sassella|grumello|inferno|valgella/i, 4, 5, 4, 3, "Valtellina Superiore: Nebbiolo alpino eroico"),
    D(/valtellina/i, 4, 3, 4, 2, "Nebbiolo di Valtellina"),
    D(/franciacorta/i, 2, 3, 2, 4, "Franciacorta: metodo classico noto"),
    D(/\bop\b.*(metodo classico|pas dos|dosaggio zero|brut nature|cruas|classese|brut)|oltrenero/i, 3, 3, 3, 2, "Oltrepò metodo classico: Pinot Nero sottovalutato"),
    D(/buttafuoco/i, 4, 3, 2, 1, "Buttafuoco: micro-zona dell'Oltrepò"),
    D(/\bop\b.*pinot nero|pinot nero dell'oltrep/i, 3, 3, 3, 2, "Pinot Nero dell'Oltrepò"),
    D(/bonarda|sangue di giuda|croatina|\bop\b|oltrep|provincia di pavia/i, 2, 1, 1, 1, "Oltrepò quotidiano"),
    D(/lugana/i, 2, 3, 3, 3, "Lugana: Turbiana, bianco che regge l'invecchiamento"),
    D(/botticino/i, 5, 3, 2, 1, "Botticino: micro-denominazione bresciana"),
    D(/chiaretto|valtenesi/i, 3, 1, 2, 1, "Rosato del Garda"),
    D(/groppello/i, 4, 2, 2, 1, "Groppello: autoctono gardesano"),
    D(/lambrusco/i, 1, 1, 3, 3, "Lambrusco: vino frizzante da consumo"),
    D(/valcalepio|colleoni|lariane|curtefranca|sebino|san martino della battaglia|garda/i, 3, 2, 1, 1, "Denominazione minore lombarda"),
    // — Veneto —
    D(/soave cl|soave classico|monte carbonare|calvarino|campo vulcano/i, 2, 4, 4, 3, "Soave Classico vulcanico: bianco longevo in rivalutazione"),
    D(/soave/i, 1, 2, 2, 3, "Soave"),
    D(/valpolicella superiore/i, 2, 3, 2, 4, "Valpolicella Superiore"),
    D(/ripasso/i, 2, 3, 1, 3, "Ripasso"),
    D(/valpolicella/i, 1, 2, 1, 3, "Valpolicella"),
    D(/bardolino chiaretto/i, 2, 1, 2, 2, "Chiaretto"),
    D(/bardolino/i, 2, 2, 4, 2, "Bardolino: riforma dei cru, stile in rivalutazione"),
    D(/durello/i, 4, 4, 4, 1, "Lessini Durello: acidità altissima, ideale per metodo classico lungo"),
    D(/fior d'arancio/i, 3, 2, 1, 1, "Moscato Fior d'Arancio"),
    D(/colli euganei/i, 3, 4, 3, 1, "Colli Euganei vulcanici: rossi longevi poco conosciuti"),
    D(/tai rosso|colli berici/i, 4, 2, 2, 1, "Colli Berici"),
    D(/vespaiolo/i, 5, 3, 2, 1, "Vespaiolo di Breganze: autoctono raro"),
    D(/breganze/i, 3, 3, 1, 1, "Breganze"),
    D(/custoza/i, 2, 2, 2, 1, "Custoza"),
    D(/raboso/i, 4, 4, 2, 1, "Raboso: rosso tannico, longevo, dimenticato"),
    D(/prosecco|valdobbiadene|asolo/i, 1, 1, 1, 5, "Prosecco: prodotto di massa, nessun valore d'invecchiamento"),
    D(/piave|pinot grigio delle venezie/i, 1, 1, 1, 3, "Vino quotidiano del Veneto"),
    // — Friuli —
    D(/vitovska|carso/i, 5, 4, 4, 2, "Vitovska del Carso: autoctono rarissimo, stile minerale"),
    D(/schioppettino/i, 5, 4, 4, 1, "Schioppettino: autoctono friulano salvato dall'estinzione"),
    D(/picolit/i, 5, 5, 2, 2, "Picolit: passito rarissimo e longevo"),
    D(/verduzzo/i, 4, 3, 1, 1, "Verduzzo"),
    D(/rosazzo/i, 4, 4, 3, 3, "Rosazzo: cru storico dei Colli Orientali"),
    D(/refosco/i, 3, 3, 2, 1, "Refosco: rosso autoctono"),
    D(/collio rosso/i, 3, 3, 2, 2, "Collio Rosso"),
    D(/collio/i, 3, 3, 3, 3, "Collio: bianchi di collina di riferimento"),
    D(/isonzo/i, 3, 3, 2, 2, "Friuli Isonzo"),
    D(/colli orientali|cormòns/i, 3, 3, 2, 2, "Colli Orientali del Friuli"),
    D(/friuli grave|aquileia|venezia giulia/i, 1, 1, 1, 2, "Friuli di pianura: vino quotidiano"),
    // — Trentino —
    D(/\btrento\b/i, 3, 4, 4, 3, "Trentodoc: metodo classico di montagna in crescita"),
    D(/san leonardo/i, 3, 4, 2, 4, "San Leonardo: taglio bordolese storico"),
    D(/teroldego/i, 3, 3, 3, 2, "Teroldego Rotaliano"),
    D(/nosiola/i, 5, 3, 3, 1, "Nosiola: autoctono trentino raro"),
    D(/trentino riesling/i, 4, 4, 3, 1, "Riesling di montagna"),
    D(/marzemino/i, 3, 2, 2, 1, "Marzemino"),
    D(/cembra|müller|muller/i, 3, 2, 2, 1, "Müller Thurgau di montagna"),
    D(/trentino/i, 2, 1, 1, 1, "Trentino quotidiano"),
    // — Valle d'Aosta —
    D(/fumin/i, 5, 4, 4, 1, "Fumin: autoctono alpino rarissimo"),
    D(/cornalin/i, 5, 3, 4, 1, "Cornalin: autoctono valdostano rarissimo"),
    D(/petite arvine/i, 5, 3, 4, 2, "Petite Arvine: bianco alpino rarissimo"),
    D(/morgex/i, 5, 3, 4, 2, "Blanc de Morgex: vigneti tra i più alti d'Europa"),
    D(/petit rouge|torrette/i, 5, 3, 3, 1, "Petit Rouge: autoctono valdostano"),
    D(/\bvda\b|valle d'aosta/i, 5, 3, 3, 1, "Valle d'Aosta: produzioni minuscole"),
    // — Liguria —
    D(/rossese/i, 5, 3, 4, 2, "Rossese di Dolceacqua: micro-denominazione in ascesa"),
    D(/granaccia/i, 5, 3, 3, 1, "Granaccia di Quiliano: micro-produzione"),
    D(/ormeasco|pornassio/i, 5, 3, 2, 1, "Ormeasco di Pornassio: Dolcetto di montagna"),
    D(/bianchetta|albarola|levanto|tigullio/i, 5, 2, 2, 1, "Vitigno ligure rarissimo"),
    D(/cinque terre/i, 5, 2, 2, 3, "Cinque Terre: viticoltura eroica"),
    D(/pigato|vermentino.*(riviera|luni)|colli di luni|riviera ligure/i, 3, 2, 2, 2, "Bianco ligure"),
    // — Emilia-Romagna —
    D(/modigliana|marzeno|oriolo|petrignone|predappio|brisighella/i, 4, 4, 5, 1, "Sottozona di Romagna: Sangiovese d'altura in ascesa"),
    D(/albana passito|scaccomatto/i, 3, 5, 2, 1, "Albana passito: dolce longevo"),
    D(/albana/i, 3, 3, 4, 1, "Albana secco: bianco tannico in rivalutazione"),
    D(/spergola/i, 5, 2, 3, 1, "Spergola: autoctono reggiano raro"),
    D(/romagna sangiovese sup|romagna sangiovese/i, 2, 2, 2, 2, "Sangiovese di Romagna"),
    D(/gutturnio|ortrugo|malvasia|pignoletto|famoso|pagadebit|trebbiano del rubicone|monterosso|colli d'imola|colli piacentini/i, 2, 1, 1, 1, "Vino emiliano quotidiano"),
    // — Toscana —
    D(/rosso di montalcino/i, 2, 3, 2, 4, "Rosso di Montalcino: accesso ai produttori di Brunello"),
    D(/chianti classico/i, 2, 4, 3, 5, "Chianti Classico"),
    D(/chianti rufina/i, 3, 4, 3, 3, "Chianti Rufina: Sangiovese di montagna longevo"),
    D(/chianti/i, 1, 2, 1, 3, "Chianti"),
    D(/nobile di montepulciano/i, 3, 4, 3, 4, "Vino Nobile"),
    D(/rosso di montepulciano/i, 2, 2, 2, 3, "Rosso di Montepulciano"),
    D(/bolgheri rosso/i, 3, 4, 3, 5, "Bolgheri: già pienamente prezzato"),
    D(/bolgheri/i, 3, 2, 2, 4, "Bolgheri Bianco"),
    D(/montecucco/i, 4, 3, 4, 1, "Montecucco: Sangiovese a fianco di Montalcino, a una frazione del prezzo"),
    D(/\borcia\b/i, 5, 3, 3, 1, "Orcia: piccola denominazione tra Montalcino e Montepulciano"),
    D(/cortona/i, 4, 4, 4, 2, "Cortona Syrah: nicchia di altissimo livello"),
    D(/ciliegiolo/i, 4, 2, 4, 1, "Ciliegiolo: autoctono in rivalutazione"),
    D(/morellino/i, 2, 2, 2, 3, "Morellino di Scansano"),
    D(/maremma/i, 2, 2, 3, 2, "Maremma Toscana"),
    D(/vernaccia di san gimignano/i, 3, 3, 3, 3, "Vernaccia di San Gimignano: bianco storico longevo"),
    D(/colline lucchesi/i, 5, 4, 3, 1, "Colline Lucchesi: piccola zona di culto biodinamico"),
    D(/pomino/i, 5, 3, 1, 2, "Pomino"),
    D(/ansonica/i, 5, 2, 2, 1, "Ansonica dell'Elba"),
    D(/val di cornia/i, 4, 3, 2, 1, "Val di Cornia"),
    // — Umbria —
    D(/sagrantino/i, 3, 5, 3, 3, "Sagrantino: il rosso più tannico d'Italia, longevità estrema"),
    D(/montefalco rosso/i, 3, 3, 2, 2, "Montefalco Rosso"),
    D(/trebbiano spoletino|spoleto/i, 4, 4, 5, 1, "Trebbiano Spoletino: bianco longevo in forte ascesa"),
    D(/torgiano rosso/i, 4, 4, 1, 2, "Torgiano Rosso"),
    D(/trasimeno gamay/i, 5, 3, 3, 1, "Gamay del Trasimeno: vitigno raro"),
    D(/orvieto/i, 2, 2, 2, 3, "Orvieto"),
    D(/grechetto|torgiano bianco|assisi|colli martani/i, 3, 2, 2, 1, "Umbria quotidiano"),
    // — Lazio —
    D(/cesanese di affile/i, 5, 3, 5, 1, "Cesanese di Affile: micro-denominazione"),
    D(/cesanese/i, 4, 3, 5, 1, "Cesanese: rosso autoctono in forte ascesa"),
    D(/fiorano/i, 5, 4, 3, 2, "Fiorano: tenuta storica romana"),
    D(/aleatico/i, 5, 2, 2, 1, "Aleatico di Gradoli"),
    D(/atina/i, 5, 3, 2, 1, "Atina Cabernet"),
    D(/bellone/i, 4, 2, 3, 1, "Bellone: autoctono laziale"),
    D(/frascati|roma |est!|marino|castelli romani/i, 2, 2, 2, 2, "Bianco laziale"),
    // — Abruzzo / Molise —
    D(/colline teramane|casauria|villamagna|terre tollesi/i, 3, 4, 3, 2, "Sottozona del Montepulciano d'Abruzzo"),
    D(/montepulciano d'abruzzo/i, 1, 3, 3, 3, "Montepulciano d'Abruzzo"),
    D(/trebbiano d'abruzzo/i, 2, 3, 4, 3, "Trebbiano d'Abruzzo: bianco di culto quando artigianale"),
    D(/cerasuolo d'abruzzo/i, 2, 2, 4, 2, "Cerasuolo d'Abruzzo: rosato in forte crescita"),
    D(/pecorino|passerina|tullum|controguerra/i, 2, 2, 3, 2, "Bianco abruzzese-marchigiano"),
    D(/tintilia/i, 5, 3, 5, 1, "Tintilia: autoctono molisano in forte ascesa"),
    D(/pentro/i, 5, 3, 2, 1, "Pentro di Isernia: micro-denominazione"),
    D(/biferno|molise/i, 4, 3, 2, 1, "Molise"),
    // — Campania / Basilicata —
    D(/taurasi piano|taurasi/i, 3, 5, 4, 3, "Taurasi: Aglianico da lunghissimo invecchiamento"),
    D(/campi taurasini|irpinia aglianico/i, 3, 4, 3, 2, "Aglianico d'Irpinia"),
    D(/fiano di avellino/i, 3, 4, 4, 3, "Fiano di Avellino: tra i bianchi più longevi d'Italia"),
    D(/greco di tufo/i, 3, 4, 3, 3, "Greco di Tufo"),
    D(/casavecchia/i, 5, 4, 4, 1, "Casavecchia: vitigno rarissimo del Casertano"),
    D(/galluccio/i, 5, 4, 3, 1, "Galluccio: micro-denominazione vulcanica"),
    D(/costa d'amalfi/i, 5, 3, 3, 3, "Costiera Amalfitana: viticoltura eroica"),
    D(/campi flegrei/i, 5, 3, 4, 1, "Campi Flegrei: suoli vulcanici, piede franco"),
    D(/asprinio/i, 5, 2, 3, 1, "Asprinio: vite maritata ai pioppi, unica in Italia"),
    D(/vesuvio/i, 4, 2, 3, 2, "Vesuvio"),
    D(/ischia/i, 5, 2, 2, 2, "Ischia"),
    D(/aglianico del taburno/i, 4, 4, 3, 1, "Aglianico del Taburno"),
    D(/aglianico del vulture/i, 4, 5, 4, 2, "Aglianico del Vulture: vulcanico, longevità da grande rosso"),
    D(/cilento|paestum/i, 3, 3, 3, 1, "Cilento"),
    D(/coda di volpe/i, 4, 2, 2, 1, "Coda di Volpe"),
    D(/falanghina|sannio|beneventano|caudium|campania/i, 2, 2, 2, 2, "Campania quotidiano"),
    D(/matera|basilicata|l'atto|rogito/i, 3, 2, 2, 1, "Basilicata"),
    // — Puglia / Calabria —
    D(/gioia del colle/i, 4, 3, 4, 1, "Gioia del Colle: Primitivo d'altura, stile più fine"),
    D(/castel del monte.*(vigna|ris)|nero di troia vigna/i, 3, 4, 3, 1, "Nero di Troia di Castel del Monte"),
    D(/nero di troia|castel del monte/i, 2, 3, 3, 1, "Nero di Troia"),
    D(/susumaniello/i, 4, 3, 4, 1, "Susumaniello: autoctono riscoperto"),
    D(/salice salentino|negroamaro|brindisi/i, 2, 3, 2, 2, "Salento"),
    D(/primitivo/i, 1, 2, 1, 3, "Primitivo: grandi volumi"),
    D(/locorotondo|gravina|verdeca|minutolo|bombino|fiano del salento|fiano minutolo|salento/i, 3, 2, 2, 1, "Bianco pugliese"),
    D(/cirò rosso.*(sup|ris)|cirò rosso cl/i, 3, 4, 4, 1, "Cirò Classico: Gaglioppo in rivalutazione"),
    D(/cirò/i, 3, 1, 3, 1, "Cirò"),
    D(/mantonico/i, 5, 4, 3, 1, "Mantonico: bianco calabrese raro e longevo"),
    D(/pecorello/i, 5, 2, 2, 1, "Pecorello: autoctono calabrese raro"),
    D(/magliocco|terre di cosenza|savuto|lamezia|pollino/i, 4, 3, 3, 1, "Calabria interna: Magliocco e Gaglioppo di montagna"),
    D(/greco bianco|val di neto|britto|gaglioppo|calabria/i, 3, 2, 2, 1, "Calabria"),
    // — Sicilia / Sardegna —
    D(/etna rosato/i, 3, 2, 4, 3, "Etna Rosato"),
    D(/etna bianco/i, 3, 4, 5, 3, "Etna Bianco: Carricante, bianco vulcanico longevo in ascesa"),
    D(/etna/i, 3, 4, 4, 4, "Etna Rosso: già molto ricercato"),
    D(/cerasuolo di vittoria/i, 4, 3, 3, 2, "Cerasuolo di Vittoria: unica DOCG siciliana"),
    D(/frappato/i, 4, 2, 4, 2, "Frappato"),
    D(/marsala/i, 4, 5, 3, 2, "Marsala: vino ossidativo quasi eterno, fuori moda"),
    D(/noto|eloro|pachino/i, 4, 3, 3, 1, "Val di Noto"),
    D(/pantelleria/i, 5, 2, 2, 2, "Pantelleria"),
    D(/lucido|grappoli del grillo/i, 3, 3, 3, 2, "Sicilia bianca artigianale"),
    D(/sicilia|nero d'avola|grillo|catarratto|inzolia|grecanico/i, 1, 2, 1, 3, "Sicilia di volume"),
    D(/vernaccia di oristano/i, 5, 5, 3, 1, "Vernaccia di Oristano: stile flor, longevità estrema"),
    D(/mandrolisai/i, 5, 3, 3, 1, "Mandrolisai: micro-denominazione del centro Sardegna"),
    D(/cagnulari/i, 5, 3, 3, 1, "Cagnulari: autoctono sardo rarissimo"),
    D(/torbato/i, 5, 2, 2, 1, "Torbato: vitigno quasi unico di Alghero"),
    D(/carignano del sulcis/i, 4, 3, 3, 2, "Carignano del Sulcis: vecchie viti ad alberello"),
    D(/mamuthone|sartu|dule/i, 4, 4, 4, 2, "Cannonau di Mamoiada/Barbagia: zona di culto"),
    D(/cannonau/i, 2, 3, 3, 2, "Cannonau"),
    D(/monica|nuragus|isola dei nuraghi|alghero/i, 3, 2, 2, 1, "Sardegna quotidiano"),
    D(/vermentino di gallura/i, 3, 2, 2, 2, "Vermentino di Gallura"),
    D(/vermentino/i, 1, 1, 1, 2, "Vermentino"),
  ];
  const DEF = { Rosso: [2, 2, 2, 2], Bianco: [2, 1, 1, 1], Rosato: [2, 1, 1, 1], Bollicina: [2, 1, 1, 2], "Passito/Dolce": [3, 3, 1, 1] };

  // Produttori: reputazione di mercato. icon = già ricercati da collezionisti (alta notorietà),
  // noto = conosciuti e distribuiti, ind = grandi volumi / industria.
  const P = (rx, lvl) => ({ rx, lvl });
  const PRODUCERS = [
    P(/giacomo conterno|roagna|valentini|emidio pepe|bruno giacosa|quintodecimo|burlotto|arpepe|le piane|occhipinti|\bcos\b|zidarich|luigi tecce|pietracupa|de bartoli|bussola|montenidoli|monteraponi|sandrone|elio altare|vajra|isole e olena|fontodi|marisa cuomo|passopisciaro|girolamo russo|terre nere|schiopetto|vie di romans|lis neris|edi keber|amerighi|paolo scavino|produttori del barbaresco|castello di ama|san leonardo|gini|pieropan|bucci/i, "icon"),
    P(/vietti|massolino|travaglini|mastrojanni|selvapiana|f[eè]lsina|querciabella|volpaia|di meo|tiberio|cataldi madonna|masciarelli|walter massa|vigneti massa|elio ottin|les cr[eê]tes|grosjean|pojer|paternoster|basilisco|elvio cogno|graci|benanti|pietradolce|cottanera|jermann|livio felluga|venica|caprai|pio cesare|ceretto|renato ratti|poliziano|avignonesi|michele satta|col d'orcia|argiano|badia a coltibuono|castellare|riecine|nittardi|ricasoli|suavia|ca' rugate|prà|inama|speri|musella|gianfranco fino|polvanera|antonella corda|sedilesu|contini|planeta|tasca d'almerita|lungarotti|scacciadiavoli|tabarrini|adanti|perticaia|palazzone|sergio mottura|ciolli|coletti conti|fiorano|la visciola|salvatore molettieri|luigi maffini|mastroberardino|villa raiano|colli di lapio|rocca del principe|ettore sammarco|casebianche|foradori|maso martis|revì|ferrari|ca' del bosco|bellavista|barone pizzini|ferghettina|calatroni|nino negri|rainoldi|mamete prevostini|prevostini|dirupi|luretta|paltrinieri|zerbina|mutiliana|noelia ricci|tre monti|umani ronchi|garofoli|tavignano|borgo paglianetto|belisario|la monacesca|monacesca|pievalta|sartarelli|andrea felici|velenosi|le caniette|guerrieri rizzardi|le fraghe|pieropan|allegrini|tommasi|bertani|masi|zenato|ca' dei frati|ottella|marco felluga|russiz|specogna|rodaro|petrussa|la viarte|torre rosazza|primosic|gradis'ciutta|antonutti|tenuta di valgiano|sassotondo|antonio camillo|le pupille|colle ?massari|poderi del paradiso|panizzi|donatella cinelli|leone de castris|torrevento|rivera|cantele|tenute rubino|felline|morgante|valle dell'acate|gulfi|feudo montoni|zisola|donnafugata|cusumano|firriato|argiolas|santadi|pala|surrau|fontanavecchia|mustilli|feudi di san gregorio|la sibilla|casa d'ambra|braida|pecchenino|abbona|chionetti|hilberg|cascina castl[eé]t|la giustiniana|villa sparina|la scolca|broglia|claudio mariotto|torraccia del piantavigna|antoniotti|cassina|produttori nebbiolo di carema|orsolani|ferrando|cieck|favaro|balbiano|luca ferraris|montalbera|accornero|vicara|g\.?g\.? rossi|forti del vento|malvirà|cornarea|monchiero carbone|negro giuseppe|deltetto|rattalino|giuseppe cortese|pelissero|bruno grimaldi|mossio|rizzi|claudio alario|arnaldo rivera|pertinace|damiano ciolli/i, "noto"),
    P(/cantina tollo|mezzacorona|\bcavit\b|rotari|zonin|santa margherita|\bbolla\b|ruffino|piccini|leonardo da vinci|cecchi|banfi|antinori|frescobaldi|fontanafredda|gancia|araldica|duchessa lia|settesoli|mandrarossa|feudo arancio|corvo|duca di salaparuta|rapitalà|cevico|colli emiliani|cavicchioli|giacobazzi|cleto chiarli|carpenè|la gioiosa|villa sandi|mionetto|ruggeri|pasqua|sartori|cantina di soave|cantina di bardolino|maschio|fazi battaglia|ciù ciù|piersanti|castignano|tormaresca|san marzano|mottura$|pietra pura|san giorgio|varvaglione|santa maria la palma|sella & mosca|gotto d'oro|fontana candida|\bbigi\b|cotarella|falesco|solopaca|cantina del taburno|la guardiense|due palme|valpolicella negrar|valtidone|carpi e sorbara|vinchio|marchesi di barolo|marchese di barolo|michele chiarlo|bersano|prunotto|cantina produttori cormòns|fantinel|cabert|ca' bolani|collavini|altemasi|cesarini sforza|cantina sociale|cembra|tenuta il bosco|losito|nino negri|cantina cinque terre|produttori di manduria|cantina mesa|cantina gallura|cantina di gallura|cantina dorgali|cantina di venosa|cantina di mogoro|cantina di dolianova|cantina di sorgono|cantina giba|cantina settecani|cantina di soliera|cantina di sorbara|monte schiavo|attems|castello della sala|lunelli|tenuta castelbuono|masseria li veli|cantine san giorgio|cantina valpolicella|moser|opera vitivinicola|carpenè malvolti|bisol|nino franco|foss marai|andreola|merotto|adami|bortolomiol|biancavigna|maschio dei cavalieri|sorrentino|ocone|vinosia|terre stregate|librandi|statti|caparra|ippolito/i, "ind"),
  ];
  // Alcuni artigiani finiscono nella lista "ind" per errore di regex larghe: correggi qui
  const IND_EXCEPT = /produttori nebbiolo di carema|cave mont blanc|cave des onze|institut agricole|librandi|statti|ippolito|caparra|nino franco|adami|bortolomiol|merotto|andreola|bisol|biancavigna|foss marai|maschio dei cavalieri|sorrentino|ocone|vinosia|terre stregate|moser|opera vitivinicola/i;

  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const r1 = x => Math.round(x * 2) / 2;

  function producerLevel(p) {
    const s = p || "";
    for (const x of PRODUCERS) {
      if (x.rx.test(s)) {
        if (x.lvl === "ind" && IND_EXCEPT.test(s)) continue;
        return x.lvl;
      }
    }
    return "art";
  }
  function denomOf(name, tipo) {
    for (const d of DENOMS) if (d.k.test(name)) return d;
    const df = DEF[tipo] || DEF.Rosso;
    return { S: df[0], L: df[1], M: df[2], N: df[3], why: "Denominazione generica" };
  }

  // Segnali estratti dalla nota della guida
  function guideSignals(g) {
    const s = (g || "");
    return {
      oscarN: /oscar nazionale|miglior rosato|94\/100/i.test(s),
      oscarR: /oscar regionale/i.test(s),
      value: /valore|q\/p|qualit[aà]\/prezzo|punteggio|filetto|menzione|novit|residuo|fuori soglia|edizione speciale berebene/i.test(s) && !/gdo/i.test(s),
      residuo: /residuo|fuori soglia/i.test(s),
      gdo: /gdo|vini quotidiani|linea |selezione entry|versione entry/i.test(s),
      bio: /\bbio\b/i.test(s),
      novita: /novit/i.test(s),
    };
  }

  function baseScores(w) {
    const d = denomOf(w.n, w.t);
    const pl = producerLevel(w.p);
    const g = guideSignals(w.g);
    const reasons = [];
    const flags = [];
    // Qualità
    let Q = 3;
    if (g.oscarN) { Q = 5; reasons.push(/94\/100/.test(w.g) ? "Punteggio 94/100 in guida" : (/miglior rosato/i.test(w.g) ? "Miglior Rosato d'Italia" : "Oscar Nazionale")); }
    else if (g.oscarR) { Q = 4.5; reasons.push("Oscar Regionale"); }
    if (g.value) { Q += 1; reasons.push(g.residuo ? "La guida segnala valore residuo sopra il prezzo" : "Segnalato per valore dalla guida"); }
    if (pl === "icon") { Q = Math.max(Q, 4.5); reasons.push("Produttore di culto"); }
    else if (pl === "noto") Q += 0.5;
    if (g.gdo) { Q -= 1; flags.push("Linea GDO / grande distribuzione"); }
    if (pl === "ind") Q -= 0.5;
    // Qualità reale (quando disponibile): un punteggio critico VERIFICATO
    // (Gambero Rosso Berebene 2026, sito ufficiale, etichetta+produttore+annata
    // confermati) sostituisce la stima basata su regole — non è un'invenzione
    // del modello, è un dato esterno controllato.
    let qConfidence = "stimata";
    if (w._gr && w._gr.score) {
      Q = clamp(2 + (w._gr.score - 85) * 0.3, 1, 5.5);
      qConfidence = "verificata";
      reasons.push(`Punteggio reale Gambero Rosso Berebene 2026: ${w._gr.score}/100`);
    }
    // Scarsità
    let S = d.S;
    if (pl === "icon") S += 1;
    if (pl === "ind") { S -= 2; flags.push("Grandi volumi"); }
    if (g.gdo) S -= 2;
    // Scarsità reale (quando disponibile): ettari vitati e bottiglie/anno
    // della denominazione, da Italian Wine Central — sostituisce la stima
    // 1–5 basata sull'opinione del modello con un dato di produzione reale.
    let sConfidence = "stimata";
    if (w._prod && w._prod.bottles) {
      const b = w._prod.bottles;
      S = b < 100000 ? 5 : b < 500000 ? 4 : b < 2000000 ? 3 : b < 10000000 ? 2 : 1;
      sConfidence = "verificata";
      reasons.push(`Produzione reale: ~${Math.round(b).toLocaleString("it-IT")} bottiglie/anno (${w._prod.status}${w._prod.ha ? ", " + w._prod.ha + " ha vitati" : ""})`);
    }
    // Longevità
    let L = d.L;
    const t = w.t;
    if (t === "Rosato") L = Math.min(L, pl === "icon" ? 3 : 2);
    if (t === "Bollicina") {
      const mc = /metodo classico|pas dos|dosaggio zero|brut nature|extra brut|\btrento\b|franciacorta|durello|cruas|classese|riserva|nature/i.test(w.n);
      L = mc ? Math.max(3, (/pas dos|dosaggio zero|nature|riserva|20(1\d|20|21)/i.test(w.n) ? 4 : 3)) : 1;
    }
    if (t === "Rosso" && /\bris\.|riserva|\bsup\.|superiore/i.test(w.n)) L += 0.5;
    if (w.v && w.v <= 2020 && t !== "Bollicina") { L += 0.5; reasons.push("Esce già con anni di affinamento"); }
    if (pl === "icon") L += 1;
    if (pl === "ind") L -= 1;
    // Momentum
    let M = d.M;
    if (g.oscarN || g.oscarR) M += 0.5;
    if (g.novita) M += 0.5;
    // Notorietà
    let N = d.N;
    if (pl === "icon") N = Math.max(N, 5);
    else if (pl === "noto") N = Math.max(N, 3.5);
    else if (pl === "ind") N = Math.max(N, 3);
    if (g.oscarN) { N += 1; flags.push("Già in copertina (Oscar Nazionale)"); }
    else if (g.oscarR) N += 0.5;
    // Liquidità
    const pliq = pl === "icon" ? 5 : pl === "noto" ? 3 : pl === "ind" ? 2 : 1;
    let X = (N + pliq) / 2;
    if (t === "Rosato" || (t === "Bollicina" && L < 3)) X -= 1;

    const sc = { Q: clamp(r1(Q), 1, 5), S: clamp(r1(S), 1, 5), L: clamp(r1(L), 1, 5), M: clamp(r1(M), 1, 5), N: clamp(r1(N), 1, 5), X: clamp(r1(X), 1, 5) };
    if (d.S >= 5) reasons.push("Micro-denominazione / vitigno raro");
    if (d.M >= 4) reasons.push("Denominazione in ascesa");
    if (sc.L >= 4) reasons.push("Potenziale d'invecchiamento alto");
    if (sc.N <= 2 && sc.Q >= 3.5) reasons.push("Ancora fuori dai radar del mercato");
    const dataConfidence = (qConfidence === "verificata" && sConfidence === "verificata") ? "alta"
      : (qConfidence === "verificata" || sConfidence === "verificata") ? "media" : "bassa";
    return { sc, denom: d.why, plevel: pl, reasons: [...new Set(reasons)], flags, sig: g, dataConfidence, gr: w._gr || null, prod: w._prod || null };
  }

  const DEFAULT_WEIGHTS = { Q: 20, S: 20, L: 25, M: 20, U: 15 };
  const DEFAULT_SETTINGS = {
    weights: { ...DEFAULT_WEIGHTS },
    years: 10, storage: 0.5, exitFee: 20, illiq: 2,
    cagrLo: 0, cagrHi: 8, spread: 3,
    assumedPrice: 15, useAssumed: true, takeProfit: 2, momentumAlert: 15,
  };

  function indices(sc, W) {
    const w = W || DEFAULT_WEIGHTS;
    const tot = w.Q + w.S + w.L + w.M + w.U || 1;
    const raw = (w.Q * sc.Q + w.S * sc.S + w.L * sc.L + w.M * sc.M + w.U * (6 - sc.N)) / tot;
    const DI = Math.round((raw - 1) / 4 * 100);
    const BC = Math.round(((sc.Q + sc.L + sc.N + sc.X) / 4 - 1) / 4 * 100);
    let cls;
    if (sc.L < 3) cls = "bere";
    else if (sc.N >= 4 && sc.Q >= 4 && sc.L >= 4) cls = "blue";
    else if (sc.N <= 2.5 && DI >= 62) cls = "scoperta";
    else if (sc.M >= 4 && sc.N <= 3.5) cls = "emergente";
    else cls = "valore";
    return { DI, BC, cls };
  }

  const WINDOW = { 1: 2, 2: 4, 3: 8, 4: 15, 5: 25 };
  function drinkWindow(v, L) {
    if (!v) return null;
    const k = clamp(Math.round(L), 1, 5);
    return v + WINDOW[k];
  }

  // Economia per bottiglia: tutte le ipotesi vengono dalle impostazioni utente
  function economics(price, info, S, yearsOverride) {
    if (!price || price <= 0) return null;
    const T = yearsOverride || S.years;
    const score = info.cls === "blue" ? info.BC : info.DI;
    const f = clamp((score - 40) / 50, 0, 1);
    let g = (S.cagrLo + (S.cagrHi - S.cagrLo) * f) / 100;
    if (info.cls === "bere") g = Math.min(g, 0);
    const exit = clamp((S.exitFee + (5 - info.sc.X) * S.illiq) / 100, 0, 0.9);
    const net = gg => price * Math.pow(1 + gg, T) * (1 - exit) - S.storage * T;
    const sp = S.spread / 100;
    const base = net(g), lo = net(g - sp), hi = net(g + sp);
    const ann = v => (v > 0 ? Math.pow(v / price, 1 / T) - 1 : -1);
    const be = Math.pow((price + S.storage * T) / (price * (1 - exit)), 1 / T) - 1;
    return { T, g, exit, base, lo, hi, annBase: ann(base), annLo: ann(lo), annHi: ann(hi), be };
  }

  const API = { DENOMS, PRODUCERS, baseScores, indices, economics, drinkWindow, DEFAULT_SETTINGS, DEFAULT_WEIGHTS, clamp, producerLevel, denomOf, guideSignals };
  window.ENG = API;
})();
