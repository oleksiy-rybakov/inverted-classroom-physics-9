# Inverted Classroom · Physik 9

Ein Lernportal mit einer eigenständigen Startseite, geführter Vorbereitung und verknüpften Escape-Missionen. Die erste Mission ist **„Die letzte Fahrt“** zur mechanischen Energie.

Website: https://oleksiy-rybakov.github.io/inverted-classroom-physics-9/

## Enthalten

- Fünf deutsch vertonte Erklärfilme, jeweils etwa 2½ Minuten, mit Untertiteln, Kapitelmarken und vollständigen Lesetexten.
- 21 vorbereitende Aufgaben zu Energieformen, Einheiten, Höhenenergie, kinetischer Energie, Spannenergie und Energiebilanzen.
- Das bestehende Energie-Escape-Game mit sechs Räumen und 16 Prüfungen, übernommen aus [energy-escaperoom](https://github.com/oleksiy-rybakov/energy-escaperoom). Originalrepository und Originalwebsite bleiben eigenständig.
- Automatische Speicherung im Browser und Export/Import eines vollständigen JSON-Lernstands.
- Lehrkraft-Vorschau, Hilfeseite und druckbare Lernkapitel.
- Zwei als „In Vorbereitung“ gekennzeichnete Plätze für spätere Missionen. Sie enthalten noch keine Lerninhalte.

## Aufbau

```text
index.html                       Startseite und Lernpass
hilfe.html                       Speichern, Laden und Gerätewechsel
lehrkraft.html                   Vorschau, Unterrichtshinweise und Lösungen
missions/energy/lernen.html      Videos und Übungen der ersten Mission
missions/energy/escape.html      Escape Game der ersten Mission
assets/css/site.css              Portal und Lernseiten
assets/css/portal-bar.css        Gemeinsame Sicherungsleiste und Dialoge
assets/css/energy-game.css       Gestaltung des bestehenden Spiels
assets/js/missions.js            Missionsverzeichnis und Voraussetzungen
assets/js/lessons.js             Lerntexte, Aufgaben und Antwortschlüssel
assets/js/progress.js            Versioniertes Speichermodell und Validierung
assets/js/shared.js              Export, Importvorschau und Meldungen
assets/js/home.js                Fortschrittsanzeige und Missionsübersicht
assets/js/learn.js               Videosteuerung und Lernaufgaben
assets/js/energy-{data,core,story,game}.js
assets/media/energy/             MP4, WebVTT, Vorschaubilder und media.json
assets/media/legacy/             Bilder und Stimmen des übernommenen Spiels
tests/progress.test.cjs          Prüfungen für Speicher, Freischaltung und Physik
```

Die Website besteht aus statischen HTML-, CSS- und JavaScript-Dateien. Sie benötigt keine Datenbank, keine Konten und keinen Build-Schritt. Alle Medien liegen im Repository; keine externe Videoeinbettung oder Laufzeitbibliothek ist erforderlich.

## Lokal öffnen und veröffentlichen

Über einen lokalen HTTP-Server starten, zum Beispiel `python -m http.server 8000` im Projektordner. Anschließend `http://localhost:8000` öffnen. Ein Doppelklick auf HTML-Dateien ist wegen der JSON-Mediendatei und der Speicherregeln von `file:`-Adressen nicht der unterstützte Betriebsweg.

GitHub Pages: **Deploy from a branch → main → / (root)**. Die Datei `.nojekyll` ermöglicht die direkte Auslieferung. Relative Links funktionieren auch unter dem Repository-Unterpfad.

## Freischaltung

Die fünf Lernkapitel werden nacheinander geöffnet. Alle Aufgaben eines Kapitels müssen richtig beantwortet sein. Die Antwortprüfung ist rein lokal und nimmt keine Bewertung durch die Lehrkraft vor. Sind alle 21 Aufgaben richtig, ist das Escape Game verfügbar. Sein Abschluss wird erst nach den 16 bestandenen Prüfungen und dem geöffneten Codeschloss gezählt.

Die Lehrkraft-Vorschau öffnet Inhalte ohne künstlich erzeugte Abschlüsse. Sie ist bewusst frei zugänglich. Dieses statische Portal ist kein geschütztes Prüfungs- oder Benotungssystem.

## Lernstände

Der einzige aktive Stand pro Browser liegt im Schlüssel `inverted-classroom-physics-9:v1`. Eine JSON-Sicherung enthält `app`, `version`, `updatedAt`, `profile`, `settings`, `last` und `missions.energy` mit `preparation` und `escape`.

Gespeichert werden auch unvollständige Eingaben, Hinweise, Notizen, Videopositionen, das zuletzt geöffnete Kapitel, die Escape-Aufgabe und die Arbeitszeit. Beim Import werden Kennung, Version, Datentypen und Längen geprüft. Unbekannte Versionen ersetzen keinen vorhandenen Stand. Ein erfolgreicher Import legt zusätzlich den vorherigen Stand unter dem lokalen Schlüssel mit Suffix `:previous` ab. Die regulär nutzbare Sicherung bleibt die heruntergeladene JSON-Datei.

Vor einem Gerätewechsel **Stand sichern**, am Zielgerät **Stand laden**. Keine automatische Cloud-Synchronisierung. Bei Änderungen in einem anderen Tab werden weitere Schreibvorgänge des älteren Tabs unterbrochen. Ein importierter Stand ist während des anschließenden Neuladens gegen alte `beforeunload`-/`pagehide`-Speicherereignisse geschützt.

## Eine weitere Mission ergänzen

1. Eigenen Ordner `missions/<id>/` mit `lernen.html` und `escape.html` anlegen. Gemeinsame Navigation und Sicherungsdialoge übernehmen.
2. Inhalte, Prüfungen und Medien ergänzen. Beide Seiten verlinken Startseite und die jeweils andere Phase.
3. In `assets/js/missions.js` einen veröffentlichten Eintrag mit `folder`, `available: true` und z. B. `requires: ['energy']` eintragen. Das Missionsverzeichnis trennt Veröffentlichung und individuelle Freischaltung.
4. Das Datenmodell und die Validierung in `progress.js` um die neue Mission ergänzen. Bei Änderungen des Sicherungsformats die Version erhöhen und eine gezielte Migration schreiben. Alte Stände dürfen dabei nicht verloren gehen.
5. Die Seitenlogik der neuen Mission an ihre eigene Zustandsstelle anbinden. Für das aktuelle Portal ist ausschließlich Mission Energie vollständig implementiert; die zwei zukünftigen Karten sind keine fertigen Missionen.
6. Tests für Voraussetzungen, Sichern/Laden, Abschluss und ungültige Importe hinzufügen; danach die komplette neue Mission im Browser durchspielen.

## Prüfen

Mit Node.js: `node --test tests/progress.test.cjs`

Die Tests prüfen die 21 Lernaufgaben, Freischaltung, vollständige und unvollständige Spielstände, Neuladen, abgewiesene Dateien, beschädigten Speicher, Konflikte mehrerer Tabs und sämtliche 16 Rechenprüfungen des übernommenen Spiels. Zusätzlich wurde der Lernweg bis zum Escape Game im Browser bedient, eine Sicherung heruntergeladen und mit unveröffentlichten Eingaben wieder geladen; Desktop- und Smartphone-Layout wurden kontrolliert.

## Inhalt und Herkunft

Alle neuen Erklärtexte, Rechenbeispiele und Lernübungen wurden für dieses Portal erstellt. Die Vertonung verwendet eine synthetische deutsche Stimme. Die vorhandenen Spielbilder und Figurenstimmen stammen aus dem vom Eigentümer benannten Energie-Spiel.

Fachlicher Bezug: [LehrplanPLUS · Mechanische Energie, Gymnasium Physik 9](https://www.lehrplanplus.bayern.de/fachlehrplan/lernbereich/217019). Die quantitative Spannenergie ist als Vertiefung zur Vorbereitung auf das vorhandene Spiel enthalten. Es gelten g = 9,81 N/kg, lineare Federn und die jeweils angegebenen Modellannahmen. Die erste Mission bildet keinen vollständigen Jahreslehrplan ab.

Der Ablauf „Video → zugehörige Aufgaben → Anwendung im Escape Game“ orientiert sich an [wurzel-termumformungen](https://oleksiy-rybakov.github.io/wurzel-termumformungen/).
