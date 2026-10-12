# Kostenlosen Freundesbereich einrichten

Das Backend ist vorbereitet, aber es wurde noch kein Supabase-Projekt in deinem Namen erstellt. Ohne diesen Schritt sind Freunde, Kommentare und Online-Freigaben nicht live. Die ETF-Verwaltung funktioniert unabhängig davon lokal.

1. Auf https://supabase.com/dashboard mit deinem GitHub-Konto anmelden.
2. Eine kostenlose Organisation und ein Projekt **kursklar** anlegen, möglichst mit europäischer Region. Das Datenbankpasswort im eigenen Passwortmanager speichern; hier nicht teilen.
3. Im Projekt **SQL Editor** öffnen. Den gesamten Inhalt von `backend/setup.sql` einfügen und einmal ausführen. Die Tabellen verwenden Row Level Security; Freunde müssen eine Anfrage annehmen, bevor eine Freigabe lesbar ist.
4. Unter **Authentication → Providers → Email** E-Mail/Passwort-Anmeldung aktivieren. E-Mail-Bestätigung nach Möglichkeit aktiviert lassen. Der Bestätigungslink bestätigt das Konto; anschließend in Kursklar anmelden. Für zuverlässigen E-Mail-Versand kann ein eigener SMTP-Anbieter notwendig werden. Kein Passwort und keinen Service-Role-Key in Kursklar eintragen.
5. Projekt-URL und **öffentlichen Publishable-Key** (oder alten `anon`-Key) unter den Projekteinstellungen/API Keys kopieren.
6. In Kursklar **Freunde** öffnen und diese beiden öffentlichen Angaben eintragen. Dein Freund verwendet dieselben Angaben, registriert aber sein eigenes Konto.
7. Freundescode austauschen, Anfrage senden und beim anderen Konto annehmen. Pro Freund die gewünschten Daten auswählen und **Freigabe aktivieren** drücken.

Diese beiden öffentlichen Angaben kannst du mir zur weiteren Einrichtung schicken. Keine geheimen Schlüssel, keine Datenbankpasswörter und keine persönlichen Kontopasswörter senden.

## Was online gespeichert wird

Nur die ausdrücklich freigegebene Auswahl: abgeschlossene Missionen und daraus berechnete Abzeichen, ausgewählte abgeschlossene Trades/manuelle Ergebnisse, auf Wunsch alle aktuellen offenen Trades und ausgewählte ETFs einschließlich ihrer Käufe und Sparraten. Trade-Notizen werden nicht übertragen. Das lokale Übungsdepot, Tagebuch und Recherche bleiben privat.

Der Abgleich läuft ungefähr alle 15 Sekunden bei geöffneter, angemeldeter App und Internetverbindung. Es ist keine sekundengenaue Broker-Ansicht. Beenden einer Freigabe löscht die veröffentlichte Auswahl; Entfernen einer Freundschaft löscht beide Freigaben und gemeinsame Online-Aufgaben/Kommentare. Bereits heruntergeladene Kopien können nicht zurückgerufen werden.

Sparpläne sind manuelle Aufzeichnungen. Geplante Sparraten werden nie automatisch als ausgeführte Käufe gebucht. Bestandswerte beruhen ausschließlich auf einem optionalen manuell eingetragenen Kurs.

## Prüfung vor Freigabe an deinen Freund

Mit zwei Testkonten anmelden und mindestens prüfen: Anfrage vor Annahme nicht nutzbar, nur ausgewählte Daten sichtbar, keine privaten Notizen, Aktualisierung nach neuem offenen Trade, Widerruf, Aufgaben/Kommentare und entferntes Freundeskonto. Zusätzlich mit einem dritten Konto Zugriffe auf fremde Freigaben verifizieren. SQL-Skript und Client sind lokal vorbereitet; diese Backend-Prüfung kann erst im echten Projekt erfolgen.

Die kostenlose Supabase-Stufe hat Nutzungslimits; inaktive Free-Projekte können pausiert werden. Es wurde kein kostenpflichtiger Tarif gebucht. Siehe https://supabase.com/docs/guides/platform/free-project-pausing .
