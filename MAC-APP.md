# Kursklar als Mac-App verteilen

Vorbereitet für GitHub-Benutzer **RyZEeeeeeeeeee**, Repository-Name **kursklar**. Es wurde noch kein Repository angelegt und keine Mac-Datei veröffentlicht.

## Einmalige Einrichtung

1. Melde dich bei GitHub an und erstelle ein **öffentliches** Repository mit dem Namen `kursklar` (ohne vorab erzeugte README).
2. Lade den Inhalt des vorbereiteten Projektpakets hoch. Auch der versteckte Ordner `.github` muss enthalten sein. Am einfachsten geht das mit GitHub Desktop: Repository klonen, Projektdateien in den geklonten Ordner kopieren, committen und pushen. `node_modules`, `dist`, `release` und lokale Browserdaten gehören nicht ins Repository.
3. Auf der GitHub-Seite unter **Actions → Mac-App bauen → Run workflow** den ersten Build starten.
4. Nach erfolgreichem Lauf liegen unter **Artifacts** separate Downloads für Intel (`x64`) und Apple Silicon (`arm64`, M1/M2/M3/…). Entpacke das passende ZIP: Darin liegt die `.dmg`-Datei für deinen Freund.

Der Workflow läuft auf macOS, denn hier unter Windows kann kein geprüfter Mac-DMG-Build erstellt werden. Standard-Runner sind für öffentliche Repositories kostenlos; Quellcode und App-Downloads sind damit öffentlich.

## Erste Veröffentlichung und spätere Updates

Für die Update-Prüfung braucht die App eine veröffentlichte GitHub-Release mit den `.dmg`-Dateien als Anhänge. Reine Actions-Artefakte genügen nicht.

Die erste Version ist **1.0.0**. Erstelle über GitHub einen Git-Tag **v1.0.0** (z. B. beim Anlegen einer Release). Der Tag startet den Workflow, der beide DMG-Dateien an die Release anhängt. Keine Vorabversion/Prerelease markieren. Wenn eine Datei noch fehlt, meldet die App das und bietet keinen falschen Download an.

Bei einer Änderung:

1. Änderungen prüfen und `package.json` auf die neue Version setzen, z. B. `1.0.1`; `npm install --package-lock-only` ausführen.
2. Änderungen hochladen und den passenden Tag `v1.0.1` erstellen.
3. Der Mac-Workflow baut beide Dateien und veröffentlicht sie.
4. Kursklar prüft beim Start und per **Updates prüfen** die neueste Release. **Update herunterladen** öffnet die passende Datei im Browser. Dein Freund beendet Kursklar und ersetzt die alte App im Programme-Ordner.

Bei Nutzung eines anderen Repository-Namens muss `desktop/release-config.json` angepasst werden. GitHub-Builds tragen ihren tatsächlichen Repository-Namen automatisch ein. Keine Tokens in die App einbauen.

## Installation und Daten

DMG öffnen und Kursklar nach Programme kopieren. Die App funktioniert offline; Internet wird nur für die Update-Prüfung und externe Quellen benötigt. Es ist kein eigener Server erforderlich. Die Einträge liegen im lokalen Benutzerprofil der App, getrennt von den Daten deiner bisherigen Browser-App. Beim Ersetzen der App bleibt das Profil bestehen. Vor Updates empfiehlt sich ein JSON-Export in der App.

Die kostenlose Variante ist **nicht mit einer Apple-Developer-ID signiert oder notarisiert**. macOS kann die Installation blockieren oder einen Sicherheitshinweis anzeigen; eine problemlose Installation ist erst nach Prüfung auf dem Mac bestätigt. Gatekeeper soll nicht global deaktiviert werden. Vollautomatische Installation ist nicht Bestandteil dieser Variante; Updates werden manuell ersetzt.

## Lokal prüfen

`npm run desktop` startet die Desktop-App auf dem jeweiligen System. `npm run desktop:mac` erstellt auf einem Mac die DMG. Tests: `npm test`, `npm run test:browser`, `node desktop/smoke.cjs` (nach `npm run build`). Der Electron-Smoke-Test unter Windows besteht: Desktop-Start, gebündelte lokale Assets, Desktop-API und Kalender. Mac-Build und Installation auf dem Mac sind noch ausstehend.


