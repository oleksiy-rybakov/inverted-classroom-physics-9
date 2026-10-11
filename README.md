# Inverted Classroom · Physik 9

Ein Lernportal mit einer eigenständigen Startseite, geführter Vorbereitung und verknüpften Escape-Missionen. Die erste Mission ist **„Die letzte Fahrt“** zur mechanischen Energie.

Website: https://oleksiy-rybakov.github.io/inverted-classroom-physics-9/

## Enthalten

- Fünf deutsch vertonte Erklärfilme, jeweils etwa 2½ Minuten, mit Untertiteln, Kapitelmarken und vollständigen Lesetexten.
- Fünf Videoaufgaben, jeweils mit **Gegeben – Gesucht – Lösung – Antwortsatz**: Einheiten, Höhenenergie, kinetische Energie, Spannenergie und Energiebilanzen.
- Das bestehende Energie-Escape-Game mit sechs Räumen und 16 Prüfungen, übernommen aus [energy-escaperoom](https://github.com/oleksiy-rybakov/energy-escaperoom). Originalrepository und Originalwebsite bleiben eigenständig.
- Automatische Speicherung im Browser und Export/Import eines vollständigen JSON-Lernstands.
- Anmeldung mit getrennten Schüler- und Lehrerpasswörtern, verschlüsselter Lehrkraftbereich, Hilfeseite und druckbare Lernkapitel.
- Getrennte Freigabepasswörter für jede veröffentlichte Lernmission und jedes Escape Game. Unfertige Missionen erscheinen nur in der Lehrkraftansicht als Entwürfe.

## Aufbau

```text
anmelden.html                    Passwortanmeldung und Rollenwahl durch das Passwort
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
assets/js/auth-crypto.js          Web-Crypto-Schlüsselableitung und Entschlüsselung
assets/js/auth.js                 Sitzungen und Rollenprüfungen
assets/js/login.js                Anmeldeformular
assets/access/config.json         Verschlüsselte Rollenpakete, keine Klartextpasswörter
assets/access/gates.json          Verschlüsselte, bereichsgebundene Freigaben
assets/js/gates.js                Passwortprüfung für Mission und Escape Game
assets/js/worksheet{,-view}.js    Vollständige Rechenwege und vierteilige Eingabe
assets/css/worksheet.css         Aufgabenformulare und Freigabeseiten
assets/js/progress.js            Versioniertes Speichermodell und Validierung
assets/js/shared.js              Export, Importvorschau und Meldungen
assets/js/home.js                Fortschrittsanzeige und Missionsübersicht
assets/js/learn.js               Videosteuerung und Lernaufgaben
assets/js/energy-{data,core,story,game}.js
assets/media/energy/             MP4, WebVTT, Vorschaubilder und media.json
assets/media/legacy/             Bilder und Stimmen des übernommenen Spiels
tests/progress.test.cjs          Prüfungen für Speicher, Freischaltung und Physik
tests/auth.test.cjs               Rollen, Sitzung, Verschlüsselung und Zugriffsschutz
scripts/manage-access.cjs         Passwörter ändern, Lehrkraftpaket neu verschlüsseln
scripts/manage-gates.cjs          Freigaben aus sicherer Standardeingabe ändern
tests/gates.test.cjs              Getrennte Freigaben, Sitzung und direkte Links
```

Die Website besteht aus statischen HTML-, CSS- und JavaScript-Dateien. Sie benötigt keine Datenbank, keine individuellen Benutzerkonten und keinen Build-Schritt. Alle Medien liegen im Repository; keine externe Videoeinbettung oder Laufzeitbibliothek ist erforderlich.

## Lokal öffnen und veröffentlichen

Über einen lokalen HTTP-Server starten, zum Beispiel `python -m http.server 8000` im Projektordner. Anschließend `http://localhost:8000` öffnen. Ein Doppelklick auf HTML-Dateien ist wegen der JSON-Mediendatei und der Speicherregeln von `file:`-Adressen nicht der unterstützte Betriebsweg.

GitHub Pages: **Deploy from a branch → main → / (root)**. Die Datei `.nojekyll` ermöglicht die direkte Auslieferung. Relative Links funktionieren auch unter dem Repository-Unterpfad.

## Freischaltung

Nach der Schüleranmeldung benötigt jede Lernmission ihr eigenes Freigabepasswort. Danach werden die fünf Lernkapitel nacheinander geöffnet. Pro Video wird eine vollständige Aufgabe bearbeitet: Angaben in passenden Einheiten, gesuchte Größe, Formel und Rechenausdruck, gerundetes Ergebnis und Antwortsatz. Ein Endergebnis allein genügt nicht. Zahlen und Formeln werden lokal geprüft; die Bedeutung und Sprache des Antwortsatzes bleiben ein bestätigter Selbstcheck. Nach allen fünf Aufgaben wird das Escape Game zusätzlich mit seinem eigenen Passwort geöffnet. Sein Abschluss wird erst nach den 16 bestandenen Prüfungen und dem geöffneten Codeschloss gezählt.

Die Lehrkraft-Vorschau öffnet Inhalte ohne künstlich erzeugte Abschlüsse. Sie steht ausschließlich angemeldeten Lehrkräften zur Verfügung. Vorschau und Trainingsmodus sind getrennt vom Lernstand gespeichert und werden nicht durch importierte Dateien aktiviert.

## Anmeldung und Rollen

Das Passwort bestimmt die Rolle. Das Schülerpasswort öffnet die Missionsübersicht; Lernmissionen und Escape Games benötigen jeweils ihre zusätzliche Freigabe. Das Lehrerpasswort öffnet zusätzlich den Lehrkraftbereich, die Lösungssammlung im Spiel, die Vorschau und den Trainingsmodus. Die tatsächlichen Passwörter sind nicht in diesem Repository dokumentiert.

Direkte Aufrufe von `lehrkraft.html` zeigen angemeldeten Schülern nur eine Zugriffsmeldung. Ohne Anmeldung führen geschützte Seiten zur Anmeldeseite zurück. Bei deaktiviertem JavaScript wird kein geschützter Seiteninhalt eingeblendet. Die Lehrkraftseite und die fertige Escape-Lösungssammlung liegen nur als verschlüsseltes Paket vor und werden erst mit dem passenden Schlüssel entschlüsselt; ein verändertes Rollenfeld genügt nicht.

Die Verschlüsselung verwendet AES-256-GCM mit zufälliger 96-Bit-IV und PBKDF2-HMAC-SHA-256 mit 600.000 Durchläufen und zufälligem 128-Bit-Salt pro Zugang. Rollenkennung und Portalversion sind als zusätzliche authentifizierte Daten gebunden. Umsetzung mit [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey). Schlüssel und Rolle liegen für bis zu zwölf Stunden im Sitzungsspeicher des Tabs. Das Klartextpasswort wird nicht gespeichert. Abmelden entfernt die Anmeldung und meldet andere offene Portal-Tabs desselben Browsers ebenfalls ab. Lernstände bleiben erhalten.

Freigaben sind an den jeweiligen Bereich und die aktuelle Anmeldung gebunden. Entschlüsselte Freigabeschlüssel liegen ausschließlich im Sitzungsspeicher und werden beim Abmelden entfernt. Lehrkräfte können Mission und Spiel ohne diese zusätzlichen Passwörter öffnen. Die Kapitelvorschau wird separat im Lehrkraftbereich eingeschaltet.

Alte Lernstandsdateien bleiben lesbar. Ihre früheren Flags `settings.preview` und `escape.training` werden beim Laden verworfen. Anmeldung, Freigaben, Schlüssel und Rollen sind niemals Bestandteil einer Lernstandsdatei. Es gibt weiterhin einen gemeinsamen Lernstand pro Browser; das Rollenpasswort erzeugt kein persönliches Konto.

### Grenzen der statischen Veröffentlichung

GitHub Pages stellt Dateien öffentlich bereit und führt keine serverseitige Zugriffskontrolle aus. Die Anmeldung steuert den regulären Lernweg, die Verschlüsselung schützt den aktuellen Lehrkraft-Inhalt mit der Stärke des gewählten Lehrerpassworts. Die Schüler-Medien sowie die lokale Aufgabenprüfung und deren Antwortdaten bleiben technisch einsehbar. Die frühere, bereits öffentliche Fassung und Git-Historie lassen sich dadurch nicht rückwirkend geheim machen. Für vertrauliche personenbezogene Daten oder eine manipulationsgeschützte Prüfung wird ein Server mit eigener Rechteprüfung benötigt.

### Freigabepasswörter ändern

`scripts/manage-gates.cjs` liest Bereich-Passwort-Paare über die Standardeingabe. Bereichsnamen haben das Schema `<missions-id>:learn` oder `<missions-id>:escape`. Es aktualisiert ausschließlich die angegebenen Bereiche in `assets/access/gates.json`; andere Freigaben bleiben erhalten. Passwörter nicht in Befehlsargumente oder gespeicherte Dateien schreiben. Die verschlüsselten Tickets nutzen dieselben Kryptoverfahren wie die Rollenpakete und binden den Bereich als authentifizierte Daten. Nach Veröffentlichung muss die betroffene Freigabe erneut eingegeben werden. Die Passwortübersicht im verschlüsselten Lehrkraftpaket muss bei Änderungen ebenfalls aktualisiert werden.

### Rollenpasswörter ändern

`scripts/manage-access.cjs` liest ein JSON-Objekt über die Standardeingabe: `currentTeacherPassword`, `studentPassword` und `teacherPassword`. Es entschlüsselt das bestehende Lehrkraftpaket nur im Arbeitsspeicher und erzeugt für beide Zugänge neue Salts und Schlüssel. Die beiden neuen Passwörter müssen unterschiedlich sein. Zugangsdaten nicht in Befehlsargumente, Quellcode, Commits oder gespeicherte Eingabedateien schreiben. Anschließend ausschließlich die aktualisierte `assets/access/config.json` veröffentlichen. Alte Sitzungen können das neue Paket nicht entschlüsseln und müssen sich erneut anmelden; bereits offene Seiten werden erst bei ihrem nächsten Laden aktualisiert.

## Lernstände

Der einzige aktive Stand pro Browser liegt im Schlüssel `inverted-classroom-physics-9:v1`. Das Sicherungsformat hat Version 2. Eine JSON-Sicherung enthält `app`, `version`, `updatedAt`, `profile`, `settings`, `last` und `missions.energy` mit `preparation` und `escape`.

Version-1-Sicherungen werden beim Lesen migriert. Die früheren 21 Kurzantworten bleiben unter `preparation.legacyAnswers` erhalten, zählen aber nicht als vollständige neue Rechenwege. Notizen, Videopositionen und vorhandene Escape-Spielstände bleiben erhalten; die fünf neuen Aufgaben müssen für den regulären Escape-Zugang abgeschlossen werden. Der Speicherschlüssel bleibt absichtlich unverändert, damit alte Browserstände gefunden werden.

Gespeichert werden auch unvollständige Eingaben, Hinweise, Notizen, Videopositionen, das zuletzt geöffnete Kapitel, die Escape-Aufgabe und die Arbeitszeit. Beim Import werden Kennung, Version, Datentypen und Längen geprüft. Unbekannte Versionen ersetzen keinen vorhandenen Stand. Ein erfolgreicher Import legt zusätzlich den vorherigen Stand unter dem lokalen Schlüssel mit Suffix `:previous` ab. Die regulär nutzbare Sicherung bleibt die heruntergeladene JSON-Datei.

Vor einem Gerätewechsel **Stand sichern**, am Zielgerät **Stand laden**. Keine automatische Cloud-Synchronisierung. Bei Änderungen in einem anderen Tab werden weitere Schreibvorgänge des älteren Tabs unterbrochen. Ein importierter Stand ist während des anschließenden Neuladens gegen alte `beforeunload`-/`pagehide`-Speicherereignisse geschützt.

## Eine weitere Mission ergänzen

1. Eigenen Ordner `missions/<id>/` mit `lernen.html` und `escape.html` anlegen. Gemeinsame Navigation und Sicherungsdialoge übernehmen.
2. Inhalte, Prüfungen und Medien ergänzen. Beide Seiten verlinken Startseite und die jeweils andere Phase.
3. In `assets/js/missions.js` einen Eintrag mit `folder` und Voraussetzungen ergänzen. Bis zur Fertigstellung `available: false` setzen: Schüler sehen diese Mission nicht, auch direkte HTML-Aufrufe werden gesperrt. Erst nach vollständiger Prüfung `available: true` setzen.
4. Zwei Freigaben (`<id>:learn`, `<id>:escape`) in `assets/access/gates.json` erzeugen. Jede Missionsseite erhält am Body `data-mission="<id>"` und `data-phase="learn"` bzw. `"escape"`. `gates.js` vor `shared.js` laden, Seitenlogik erst nach erfolgreichem `PortalUIReady` starten. Fehlende Freigaben bleiben für Schüler gesperrt.
5. Das Datenmodell und die Validierung in `progress.js` um die neue Mission ergänzen. Bei Änderungen des Sicherungsformats die Version erhöhen und eine gezielte Migration schreiben. Alte Stände dürfen dabei nicht verloren gehen.
6. Die Seitenlogik der neuen Mission an ihre eigene Zustandsstelle anbinden. Für das aktuelle Portal ist ausschließlich Mission Energie vollständig implementiert; die zwei zukünftigen Karten sind keine fertigen Missionen.
7. Tests für Voraussetzungen, Sichern/Laden, Abschluss und ungültige Importe hinzufügen; danach die komplette neue Mission im Browser durchspielen.

## Prüfen

Mit Node.js: `node --test tests/*.test.cjs`

Die Tests prüfen die fünf strukturierten Lernaufgaben, die getrennten Freigaben, den Rollenwechsel, die Migration alter Sicherungen, Freischaltung, vollständige und unvollständige Spielstände, Neuladen, abgewiesene Dateien, beschädigten Speicher, Konflikte mehrerer Tabs und sämtliche 16 Rechenprüfungen des übernommenen Spiels. Zusätzlich wurde der Lernweg bis zum Escape Game im Browser bedient, eine Sicherung heruntergeladen und mit unveröffentlichten Eingaben wieder geladen; Desktop- und Smartphone-Layout wurden kontrolliert.

## Inhalt und Herkunft

Alle neuen Erklärtexte, Rechenbeispiele und Lernübungen wurden für dieses Portal erstellt. Die Vertonung verwendet eine synthetische deutsche Stimme. Die vorhandenen Spielbilder und Figurenstimmen stammen aus dem vom Eigentümer benannten Energie-Spiel.

Fachlicher Bezug: [LehrplanPLUS · Mechanische Energie, Gymnasium Physik 9](https://www.lehrplanplus.bayern.de/fachlehrplan/lernbereich/217019). Die quantitative Spannenergie ist als Vertiefung zur Vorbereitung auf das vorhandene Spiel enthalten. Es gelten g = 9,81 N/kg, lineare Federn und die jeweils angegebenen Modellannahmen. Die erste Mission bildet keinen vollständigen Jahreslehrplan ab.

Der Ablauf „Video → zugehörige Aufgaben → Anwendung im Escape Game“ orientiert sich an [wurzel-termumformungen](https://oleksiy-rybakov.github.io/wurzel-termumformungen/).
