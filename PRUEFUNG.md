# Durchgeführte Prüfung

Prüfstand: 12.10.2026.

- 23 Vitest-Tests bestanden: Bid/Ask, Kauf- und Verkaufslimits einschließlich exakter Grenze, Stop-Buy und Stop-Verkauf, Kurslücke, Stop-Limit auf beiden Seiten, fehlendes Guthaben, Kaufreservierungen, reservierter Verkaufsbestand, Stornierung, Ablauf, Gebühren, Teilverkäufe, Rundungsrest und doppelte Ausführung. Außerdem Kerzenaggregation, ETF-Rechnung und konsistente Importabrechnung.
- 6 Playwright-Tests in echtem Chromium bestanden: erste Mission und Lernfortschritt nach Reload, Navigation, Glossarsuche, Depotkauf/-teilverkauf, JSON-Download und geprüfter Import, Reset, Kerzenbildung, Stop-Limit, ETF-Annahmen, Recherche, Tagebuch nach Reload, beschädigte Daten, abgelehnter Import, wechselnde Übungszahlen, Autoplay und Tastaturfokus.
- Desktopansichten 1440 × 900 und 1280 × 720 aufgenommen. Übersicht und Kerzenlabor visuell geprüft; Browserprüfungen bestätigen keine horizontale Überbreite in allen zentralen Bereichen. Bei geringer Höhe scrollt die Seitenleiste unabhängig vom Arbeitsbereich.
- TypeScript und Produktionsbuild erfolgreich. Lint ohne Meldungen.

Screenshots liegen in `tests/screenshots`. Eine komplette Prüfung in Firefox/Safari, mit Screenreader oder auf mobilen Geräten wurde nicht durchgeführt.

## Verbleibende Modellgrenzen

Ein fiktives handelbares Unternehmen, ganze Stücke, keine Teilausführungen, Warteschlangen, Marktwirkung oder Steuerberechnung. Stop-Referenz und der Folgetick sind ausdrücklich Modellregeln. ETF-Schwankungen dienen der Veranschaulichung und sind keine statistisch kalibrierte Prognose. Kosten-/Bruchstückangaben zu Trade Republic wurden teilweise nur im offiziellen Suchauszug gefunden; die Detailseite war nicht erreichbar. Dies ist direkt in der App gekennzeichnet. Die Standardkosten des Simulators sind eigenständige Modellwerte.

## Erweiterung Trading-Kalender

27 Rechen-/Datentests und 8 Chromium-Browsertests bestanden, Build und Lint erfolgreich. Zusätzliche Prüfungen: Monatsraster und Schaltjahr, Cent-/Nettoarithmetik, Verhinderung doppelter Tageszählung, alte Speicherstände, Tagesdetails, mehrere Trades, Bearbeiten/Löschen, Reload, Monatswechsel, Export/Import. Kalender bei 1440 × 900 und 1280 × 720 aufgenommen und bei 1280 visuell geprüft.


## Erweiterung offene Kalender-Trades

33 Rechentests und 9 Chromium-Browsertests bestanden. Build und Lint erfolgreich. Geprüft: Montag kaufen, offen nach Reload, Dienstag verkaufen, automatische Nettorechnung mit Kauf-/Verkaufskosten, korrekte Zuordnung nur zum Verkaufstag, Bruchstücke, Verlust, ungültige Zeitfolge, Monatswechsel in der Datenlogik, Kompatibilität alter Speicherstände und Sicherungen, Schutz vor Doppelzählung, Export und Import geschlossener Positionen. Desktopansicht bei 1280 × 720 visuell geprüft.


## Cash-Abrechnung im Kalender

34 Rechentests und 10 Chromium-Browsertests bestanden. Regression anhand der Nutzereingaben: Kaufabbuchung 182,20 Euro und Verkaufsgutschrift 195,60 Euro ergeben 13,40 Euro. Änderungen an Anteilen, Einzelpreisen oder alten Gebühren beeinflussen eine neue Cash-Abrechnung nicht. Offene Trades, Verkaufstag, Reload und Export/Import bleiben geprüft. Build und Lint erfolgreich.


## Mac-App-Vorbereitung

Desktop-Hülle mit isolierter Renderer-Umgebung, lokaler App-Adresse, Versionsvergleich, erlaubtem GitHub-Download und Build-Workflow für Intel und Apple Silicon vorbereitet. 36 Unit-Tests und 10 Browsertests bestehen. Build und Lint erfolgreich; Electron-Skripte auf Syntax geprüft. Kein Mac-Build, keine Mac-Installation und kein Live-Release geprüft. npm audit meldet 8 moderate Hinweise in den Entwicklungs-/Buildabhängigkeiten; ein älterer Builder brachte schwerere Hinweise und wurde nicht übernommen.


Electron-Smoke-Test unter Windows anschließend bestanden: lokale Assets, Startbildschirm, Desktop-API (Version 1.0.0) und Kalender. Der Download der Electron-Laufzeit gelang im zweiten Versuch. Kein Mac-Build oder Live-Release bestätigt.

