/* Eine vollständige Rechenaufgabe pro Lernvideo. */
const LESSONS = [
  {
    "id": "basics",
    "title": "Energie erkennen",
    "short": "Grundlagen",
    "symbol": "E",
    "time": "5–8 Min.",
    "intro": "Drei Energieformen. Eine gemeinsame Einheit. Bereite deine Werkzeuge für die Bergstation vor.",
    "rule": "Energie wird umgewandelt und übertragen. Rechne vor dem Einsetzen in SI-Einheiten und runde erst das Endergebnis.",
    "read": [
      [
        "Energie steckt in Zuständen",
        "Ein angehobener Körper besitzt Höhenenergie gegenüber einem Bezugsniveau. Ein bewegter Körper besitzt kinetische Energie. Eine verformte Feder speichert Spannenergie. Die Einheit aller drei Energieformen ist Joule (J)."
      ],
      [
        "Einheiten zuerst",
        "1 kg = 1000 g; 1 t = 1000 kg; 1 m = 100 cm = 1000 mm. 1 kJ = 1000 J; 1 mJ = 0,001 J. Von km/h nach m/s teilst du durch 3,6. Von N/cm nach N/m multiplizierst du mit 100. Beispiel: 3 N/cm = 300 N/m."
      ],
      [
        "Genauigkeit zum Schluss",
        "Vorangestellte Nullen zählen nicht: 0,0750 hat drei gültige Ziffern. Endnullen nach dem Komma zählen mit: 12,0 hat drei, 12 hat zwei. Bei Produkten und Quotienten richtet sich die Genauigkeit nach der ungenauesten Angabe. Exakte Faktoren wie ½ und Umrechnungsfaktoren begrenzen die Genauigkeit nicht. Beispiel: 12,049 wird mit drei gültigen Ziffern zu 12,0."
      ]
    ],
    "tasks": [
      {
        "type": "worksheet",
        "id": "work-basics",
        "family": "conversion",
        "unknown": "v",
        "unit": "m/s",
        "precision": 3,
        "prompt": "Die Talbahn fährt mit 72,0 km/h. Berechne ihre Geschwindigkeit in m/s. Gib das Ergebnis mit drei gültigen Ziffern an.",
        "given": [
          {
            "label": "v (im Aufgabentext)",
            "unit": "km/h",
            "value": 72
          }
        ],
        "raw": 20,
        "formula": "",
        "calculation": "72,0 / 3,6 = 20,0",
        "sentence": "Die Talbahn fährt mit einer Geschwindigkeit von 20,0 m/s.",
        "hint": "1 km/h entspricht 1/3,6 m/s. Teile den Wert in km/h durch 3,6. Die Null in 20,0 zeigt die dritte gültige Ziffer."
      }
    ]
  },
  {
    "id": "height",
    "title": "Energie durch Höhe",
    "short": "Höhenenergie",
    "symbol": "h",
    "time": "8–12 Min.",
    "intro": "Wie viel Energie gewinnt ein Körper beim Anheben? Und wie berechnest du eine unbekannte Höhe?",
    "rule": "Eₕ = m · g · h. Das Bezugsniveau legt h = 0 fest. Hier gilt g = 9,81 N/kg = 9,81 m/s².",
    "read": [
      [
        "Ein festgelegter Nullpunkt",
        "Die Höhe h wird über einem festgelegten Bezugsniveau gemessen, zum Beispiel über dem Hallenboden. Bei gleicher Masse wächst Eₕ proportional zur Höhe. Doppelte Höhe bedeutet doppelte Höhenenergie."
      ],
      [
        "Einen Rechenweg aufbauen",
        "Gegeben: m = 2,00 kg, h = 3,00 m, g = 9,81 N/kg. Gesucht: Eₕ in J. Ansatz: Eₕ = m · g · h. Einsetzen: 2,00 kg · 9,81 N/kg · 3,00 m = 58,86 J. Mit drei gültigen Ziffern: Eₕ = 58,9 J."
      ],
      [
        "Die Höhe finden",
        "Ist Eₕ gegeben und h gesucht, teilst du beide Seiten durch m · g: h = Eₕ / (m · g). Beispiel: 39,24 J / (2,00 kg · 9,81 N/kg) = 2,00 m. Stelle vor dem Einsetzen nach der gesuchten Größe um."
      ]
    ],
    "tasks": [
      {
        "type": "worksheet",
        "id": "work-height",
        "family": "height",
        "unknown": "Eh",
        "unit": "J",
        "precision": 3,
        "prompt": "Ein Werkzeugkoffer mit einer Masse von 750 g wird 4,00 m über den Boden gehoben. Berechne seine Höhenenergie gegenüber dem Boden mit g = 9,81 N/kg. Gib das Ergebnis mit drei gültigen Ziffern an; die Masse gilt hier ebenfalls mit drei gültigen Ziffern.",
        "given": [
          {
            "label": "Masse m",
            "unit": "kg",
            "value": 0.75
          },
          {
            "label": "Höhe h",
            "unit": "m",
            "value": 4
          },
          {
            "label": "Ortsfaktor g",
            "unit": "N/kg",
            "value": 9.81
          }
        ],
        "raw": 29.43,
        "formula": "E_h = m*g*h",
        "calculation": "0,750 * 9,81 * 4,00 = 29,43",
        "sentence": "Der Werkzeugkoffer besitzt gegenüber dem Boden eine Höhenenergie von 29,4 J.",
        "hint": "Rechne 750 g zuerst in kg um. Für die Höhenenergie gilt E_h = m*g*h. Runde erst das Ergebnis."
      }
    ]
  },
  {
    "id": "kinetic",
    "title": "Energie in Bewegung",
    "short": "Bewegungsenergie",
    "symbol": "v²",
    "time": "8–12 Min.",
    "intro": "Geschwindigkeit wirkt quadratisch. Rechne mit dem Wagen, bevor du das Fahrwerk der Talbahn überprüfst.",
    "rule": "Eₖᵢₙ = ½ · m · v². Setze m in kg und v in m/s ein.",
    "read": [
      [
        "Geschwindigkeit im Quadrat",
        "Verdoppelt sich v bei gleicher Masse, vervierfacht sich Eₖᵢₙ. Dreifache Geschwindigkeit bedeutet neunfache kinetische Energie. Doppelte Masse bei gleicher Geschwindigkeit bedeutet dagegen doppelte Energie."
      ],
      [
        "Erst umrechnen",
        "Ein Wagen hat 2000 g Masse und fährt 18 km/h. In SI-Einheiten: m = 2 kg und v = 5 m/s. Eₖᵢₙ = ½ · 2 · 5² J = 25 J. Hier betrachten wir den Wagen ohne zusätzliche Rotationsenergie."
      ],
      [
        "Unbekannte Größen",
        "Aus Eₖᵢₙ = ½ · m · v² folgt v² = 2 · Eₖᵢₙ / m. Für den Betrag der Geschwindigkeit: v = √(2 · Eₖᵢₙ / m). Die Masse erhältst du mit m = 2 · Eₖᵢₙ / v²."
      ]
    ],
    "tasks": [
      {
        "type": "worksheet",
        "id": "work-kinetic",
        "family": "kinetic",
        "unknown": "Ek",
        "unit": "J",
        "precision": 3,
        "prompt": "Ein Wagen mit einer Masse von 1,50 kg fährt mit 7,20 km/h. Berechne seine kinetische Energie ohne zusätzliche Rotationsenergie. Gib das Ergebnis mit drei gültigen Ziffern an.",
        "given": [
          {
            "label": "Masse m",
            "unit": "kg",
            "value": 1.5
          },
          {
            "label": "Geschwindigkeit v",
            "unit": "m/s",
            "value": 2
          }
        ],
        "raw": 3,
        "formula": "E_kin = 1/2*m*v^2",
        "calculation": "0,5 * 1,50 * 2,00^2 = 3,00",
        "sentence": "Der Wagen besitzt eine kinetische Energie von 3,00 J.",
        "hint": "7,20 km/h entsprechen 2,00 m/s. Die Geschwindigkeit wird in E_kin = 1/2*m*v^2 quadriert."
      }
    ]
  },
  {
    "id": "spring",
    "title": "Energie in der Feder",
    "short": "Spannenergie",
    "symbol": "s²",
    "time": "8–12 Min.",
    "intro": "Im Federpuffer steckt Energie. Unterscheide die Verformung von der gesamten Federlänge.",
    "rule": "Für eine lineare Feder gilt Eₛₚ = ½ · D · s². D in N/m; s in m, gemessen ab der ungespannten Lage.",
    "read": [
      [
        "Verformung und Federhärte",
        "s ist die Verlängerung oder Stauchung gegenüber der ungespannten Feder. Die Federhärte D beschreibt, wie stark die benötigte Kraft mit der Verformung wächst: F = D · s. Das Modell gilt im linearen elastischen Bereich."
      ],
      [
        "Spannenergie berechnen",
        "D = 200 N/m und s = 10 cm = 0,10 m ergeben Eₛₚ = ½ · 200 · 0,10² J = 1 J. Die Verformung steht im Quadrat: doppelte Verformung bedeutet vierfache Spannenergie."
      ],
      [
        "Federweg oder Federhärte finden",
        "Aus Eₛₚ = ½ · D · s² erhältst du s = √(2 · Eₛₚ / D). Ist die Federhärte gesucht, gilt D = 2 · Eₛₚ / s². Nutze für s die Verformung in Metern."
      ]
    ],
    "tasks": [
      {
        "type": "worksheet",
        "id": "work-spring",
        "family": "spring",
        "unknown": "Es",
        "unit": "J",
        "precision": 3,
        "prompt": "Eine lineare Feder hat die Federhärte D = 120,0 N/m und wird gegenüber ihrer ungespannten Länge um 25,0 cm zusammengedrückt. Berechne die Spannenergie mit drei gültigen Ziffern.",
        "given": [
          {
            "label": "Federhärte D",
            "unit": "N/m",
            "value": 120
          },
          {
            "label": "Verformung s",
            "unit": "m",
            "value": 0.25
          }
        ],
        "raw": 3.75,
        "formula": "E_sp = 1/2*D*s^2",
        "calculation": "0,5 * 120,0 * 0,250^2 = 3,75",
        "sentence": "Die zusammengedrückte Feder speichert eine Spannenergie von 3,75 J.",
        "hint": "25,0 cm sind 0,250 m. Setze die Verformung, nicht die gesamte Federlänge, in E_sp = 1/2*D*s^2 ein."
      }
    ]
  },
  {
    "id": "balance",
    "title": "Energie bleibt erhalten",
    "short": "Energiebilanzen",
    "symbol": "ΣE",
    "time": "10–15 Min.",
    "intro": "Verbinde die Energieformen. Betrachte immer einen Anfangs- und einen Endzustand.",
    "rule": "Ohne Reibung und ohne Energieübertragung nach außen bleibt die betrachtete mechanische Energie konstant. Alle Höhen gehören zum selben Bezugsniveau.",
    "read": [
      [
        "Ein Fall aus der Ruhe",
        "Ein Körper startet in Höhe h aus der Ruhe. Luftwiderstand wird vernachlässigt. Am Boden wählen wir h = 0. Dann gilt Eₕ,Anfang = Eₖᵢₙ,Ende. Formeln einsetzen: m · g · h = ½ · m · v². Durch m teilen, mit 2 multiplizieren und die Wurzel ziehen: v = √(2 · g · h)."
      ],
      [
        "Eine allgemeine Bilanz",
        "Bewegt sich der Wagen in beiden Zuständen oberhalb des Bodens, gilt Eₖᵢₙ,₁ + Eₕ,₁ = Eₖᵢₙ,₂ + Eₕ,₂. Daher: ½ · m · v₁² + m · g · h₁ = ½ · m · v₂² + m · g · h₂. Umgestellt: v₂ = √(v₁² + 2 · g · (h₁ − h₂)). Nicht vorhandene Energieanteile darfst du erst nach Betrachtung des Zustands weglassen."
      ],
      [
        "Feder und Reibung",
        "Bei einem idealen waagerechten Federstart wird Eₛₚ zu Eₖᵢₙ: ½ · D · s² = ½ · m · v². Daraus folgt v = s · √(D / m), für positive Beträge. Bei Reibung nimmt die mechanische Energie ab; innere Energie nimmt zu. Die Gesamtenergie bleibt erhalten."
      ],
      [
        "Dein Rechenkompass",
        "1. Gegeben und gesucht notieren. 2. Energieansatz aufstellen. 3. Energieformeln einsetzen. 4. Nach der gesuchten Größe umstellen. 5. SI-Werte einsetzen. 6. Rechnen, erst am Ende runden und einen Antwortsatz formulieren. Im Escape Game gibst du Formeln mit *, /, ^2 und sqrt(...) ein. Beispiel: h = E_h/(m*g)."
      ]
    ],
    "tasks": [
      {
        "type": "worksheet",
        "id": "work-balance",
        "family": "fall",
        "unknown": "v",
        "unit": "m/s",
        "precision": 3,
        "prompt": "Ein Wagen rollt aus der Ruhe eine ideale Bahn hinab. Sein Startpunkt liegt 1,25 m über dem tiefsten Punkt. Vernachlässige Reibung und Rotationsenergie. Berechne mit g = 9,81 m/s² seine Geschwindigkeit am tiefsten Punkt in m/s und mit drei gültigen Ziffern.",
        "given": [
          {
            "label": "Höhenunterschied h",
            "unit": "m",
            "value": 1.25
          },
          {
            "label": "Ortsfaktor g",
            "unit": "m/s²",
            "value": 9.81
          }
        ],
        "raw": 4.9522722057657536,
        "formula": "v = sqrt(2*g*h)",
        "calculation": "sqrt(2 * 9,81 * 1,25)",
        "sentence": "Am tiefsten Punkt beträgt die Geschwindigkeit des Wagens 4,95 m/s.",
        "hint": "Aus m*g*h = 1/2*m*v^2 folgt v = sqrt(2*g*h). Die Masse kürzt sich heraus. Rechne die Wurzel vor dem Runden aus."
      }
    ]
  }
];
if(typeof module!=='undefined')module.exports=LESSONS;
