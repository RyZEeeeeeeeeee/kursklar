# Kursklar

Deutschsprachige Lernplattform mit 38 Missionen, Kerzenlabor, sieben Order-Szenarien, ETF-Rechner, Übungsdepot, Recherche und Tagebuch. React + TypeScript + Vite. Keine Anmeldung, Cloud oder echten Orders.

## Start

```powershell
cd G:\Aktien
npm install
npm run dev -- --host 127.0.0.1
```

Im Browser http://127.0.0.1:5173 öffnen. Für einen Produktionsbuild: `npm run build`, anschließend `npm run preview`. Die erzeugten Dateien liegen in `dist`.

## Prüfungen

- `npm test`: gezielte Tests der Engine, Kostenbasis, Reservierungen, Ein-/Auszahlungsszenarien, Kerzenaggregation, ETF-Rechnung und Importvalidierung.
- `npm run test:browser`: Chromium-Abläufe einschließlich Mission, Depot, Reload, Export/Import, Kerzen, Stop-Limit, Rechner, Recherche, Tagebuch und Desktoplayout. Bei Bedarf vorher `npx playwright install chromium`.
- `npm run build`: TypeScript-Prüfung und Produktionsbuild.
- `npm run lint`: statische Prüfung.

## Modell und Struktur

- `src/content.ts`: eigenständige Inhalte und Quellen, Prüfstand 12.10.2026.
- `src/engine.ts`: Centarithmetik, deterministische Ticks, Orderregeln, ETF-Modell.
- `src/storage.ts`: versioniertes JSON, Zod-Schema und vollständige Wiederberechnung der Handelsabrechnung beim Import.
- `src/Chart.tsx`: zugänglicher SVG-Chart; Hover und Tastaturfokus zeigen OHLC.
- `src/App.tsx`: Navigation und interaktive Lernbereiche.

Stop-Trigger ist ausdrücklich der letzte gehandelte Kurs. Nach Auslösen wird beim nächsten Tick gehandelt. Kauf nutzt Ask, Verkauf Bid. Limits dürfen nicht verletzt werden. Ein offener Market-/Stop-Kauf reserviert 20 % Preisreserve und die Gebühr; die Engine prüft vor Ausführung erneut verfügbares Geld. Größere Sprünge führen gegebenenfalls zur Stornierung. Offene Aufträge verfallen am Szenarioende.

Kaufgebühren zählen zur durchschnittlichen Kostenbasis. Teilverkäufe verteilen die Basis mit Cent-Rundung; der letzte Verkauf bucht den Rest aus. Marktwert und unrealisierter Gewinn verwenden den Bid, ohne eine zukünftige Verkaufsgebühr abzuziehen. Depot und Orderlabor sind getrennt; das Depot behält seinen Marktstand über Reloads.

## Grenzen

Ganze Stücke, ein fiktives handelbares Unternehmen, keine Teilausführungen, Warteschlangen, Marktwirkung oder Steuern. Die ETF-Schwankungen sind ein didaktischer, fest definierter Verlauf, kein kalibriertes Marktmodell. Trade-Republic-Details sind modus-/landabhängig; nicht vollständig abrufbare Kosten-/Bruchstückdetails sind gekennzeichnet. Daten liegen nur im Browser und können beim Löschen der Browserdaten verloren gehen. JSON-Sicherungen über „Daten & Einstellungen“.


## Trading-Kalender

Unter Trading-Kalender können einzelne abgeschlossene Trades (Ergebnis vor Kosten, Kosten, Uhrzeit, Wertpapier und Notizen) oder ein Tages-Nettoergebnis erfasst werden. Monats- und Tageswerte werden in Cent aufsummiert. Ein Tagesgesamtwert und Einzeltrades dürfen am selben Datum nicht gemischt werden. Einträge sind bearbeitbar und nach Bestätigung löschbar, werden lokal gespeichert und mit JSON exportiert/importiert. Alte Formatversion-1-Sicherungen ohne Kalender bleiben kompatibel.


### Käufe offen halten und später schließen

Neue Trades werden mit Stückzahl (bis 6 Nachkommastellen), Kaufdatum/-uhrzeit, Kaufpreis pro Anteil und Kaufkosten erfasst. Ohne Verkauf bleiben sie offen und werden in einer monatsübergreifenden Liste angezeigt. Ein späterer Verkauf ergänzt Datum, Uhrzeit, Preis und Kosten. Die App berechnet gerundeten Verkaufserlös minus gerundeten Kaufbetrag minus beide Gebühren. Das realisierte Ergebnis zählt ausschließlich am Verkaufstag; der Kauf bleibt im Kalender sichtbar. Ein Verkauf schließt alle Anteile dieses Eintrags. Für getrennte Ausstiege getrennte Positionen erfassen. Alte manuelle Einträge und Exporte bleiben kompatibel; offene und geschlossene Positionen werden mit exportiert.


### Aktuelle Berechnung: Cash-Gesamtbeträge

Neue Kalender-Trades rechnen ausschließlich Verkaufsgutschrift minus Kaufabbuchung. Beide Beträge werden inklusive bereits verrechneter Gebühren eingetragen. Stückzahl und Einzelpreise dienen nur der Dokumentation; Gebühren werden nicht zusätzlich abgezogen. Ältere Positionen behalten ihre bisherige Berechnung und sind gekennzeichnet. Beim Bearbeiten müssen die tatsächlichen Cash-Beträge ergänzt werden; es erfolgt keine automatische Umdeutung der alten Gebührenfelder.


