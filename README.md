# Cantina Vino

App personale (singolo file `index.html`). Pubblicata con GitHub Pages.

I dati restano nel browser di chi la usa; nel repository non ci sono vini né chiavi.

## Dove comprare

La pagina **Dove comprare** mostra in quali negozi online si trovano i vini del Radar (guida Berebene), con prezzo, disponibilità e pulsante per l'acquisto.

- I dati stanno in `radar/offerte.json`. Li aggiorna da solo GitHub Actions (`.github/workflows/dove-comprare.yml`) ogni lunedì e giovedì mattina; si può avviare a mano da **Actions → Dove comprare → Run workflow**.
- Lo script è `tools/trova.mjs`: legge le sitemap pubblicate dai negozi, apre le pagine candidate e tiene solo i riscontri certi (stesso produttore e stessa etichetta, annata libera). Le regole di confronto sono in `tools/match.mjs`.
- Nessun link viene costruito: sono gli indirizzi pubblicati dal negozio, letti dopo aver aperto la pagina.
- Per aggiungere o togliere un negozio: elenco `SHOPS` in `tools/trova.mjs`.
