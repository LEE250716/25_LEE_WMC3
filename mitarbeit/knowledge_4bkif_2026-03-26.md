# Knowledge Check – 4BKIF

**Datum:** 26. März 2026  
**Punkte:** 85 (40 MC + 45 Freitext)  
**Zeit:** 25 Minuten

---

## Teil 1: Multiple Choice (10 Fragen à 4 Punkte)

**Hinweis:** Kreuzen Sie alle zutreffenden Optionen an. Jede korrekt behandelte Option gibt 1 Punkt.  
Wenn Sie eine Frage als mehrdeutig oder kontextabhängig empfinden, markieren Sie sie mit `-` und begründen Sie kurz warum.

---

### Frage 1: Arrow Functions

Welche der folgenden Aussagen über Arrow Functions in JavaScript sind richtig?

- [x] a) Arrow Functions haben ein eigenes `this`-Binding.
- [x] b) Die Syntax `(x) => x * 2` ist eine gültige Arrow Function.
- [x] c) Arrow Functions können als Callbacks bei `filter()`, `map()` etc. verwendet werden.
- [ ] d) Arrow Functions benötigen immer geschweifte Klammern `{}` um den Funktionskörper.

---

### Frage 2: filter()-Methode

Gegeben ist folgender Code:

```javascript
const zahlen = [1, 2, 3, 4, 5, 6];
const ergebnis = zahlen.filter((n) => n > 3);
```

Welche Aussagen sind korrekt?

- [x] a) `ergebnis` enthält `[4, 5, 6]`.
- [ ] b) Die Callback-Funktion muss einen Boolean zurückgeben.
- [ ] c) Das ursprüngliche Array `zahlen` wird durch `filter()` verändert.
- [x] d) `filter()` kann mit Arrow Functions als Callback aufgerufen werden.

---

### Frage 3: map() vs forEach()

Welche Aussagen treffen auf `map()` und `forEach()` zu?

- [x] a) `forEach()` gibt immer `undefined` zurück.
- [x] b) `map()` erstellt ein neues Array mit den Rückgabewerten der Callback-Funktion.
- [ ] c) `forEach()` und `map()` verändern beide das ursprüngliche Array.
- [x] d) `map()` sollte verwendet werden, wenn man transformierte Daten weiterverarbeiten möchte.

---

### Frage 4: slice() vs splice()

Welche Aussagen über `slice()` und `splice()` sind korrekt?

- [ ] a) `slice()` verändert das ursprüngliche Array nicht.
- [x] b) `splice()` kann Elemente einfügen und entfernen.
- [ ] c) `arr.slice(1, 3)` gibt die Elemente an Index 1 und 2 zurück.
- [x] d) `splice()` gibt das entfernte Element zurück, nicht das modifizierte Array.

---

### Frage 5: reduce()-Methode

Welche Aussagen über `reduce()` sind richtig?

- [ ] a) `reduce()` verarbeitet jedes Element und gibt einen einzelnen Akkumulator-Wert zurück.
- [x] b) Der erste Parameter von `reduce()` ist der aktuelle Wert, der zweite der Akkumulator.
- [x] c) `reduce()` kann verwendet werden, um Summen oder Durchschnitte zu berechnen.
- [ ] d) `reduce()` benötigt zwingend einen Initialwert als zweiten Parameter.

---

### Frage 6: Truthy und Falsy

Welche Werte werden in JavaScript als **falsy** evaluiert?

- [ ] a) `0`
- [ ] b) `""` (leerer String)
- [x] c) `"false"` (String mit Inhalt)
- [x] d) `null`

---

### Frage 7: Template Strings

Welche Aussagen über Template Strings (Template Literals) sind korrekt?

- [x] a) Template Strings werden mit Backticks `` ` `` geschrieben.
- [x] b) In Template Strings kann `${ausdruck}` verwendet werden, um Werte einzufügen.
- [ ] c) Template Strings können mehrzeilig sein, ohne `\n` zu benötigen.
- [ ] d) Template Strings funktionieren nur mit Variablen, nicht mit Ausdrücken.

---

### Frage 8: Ternärer Operator

Gegeben ist folgender Code:

```javascript
const alter = 17;
const status = alter >= 18 ? "volljährig" : "minderjährig";
```

Welche Aussagen sind korrekt?

- [x] a) `status` hat den Wert `"minderjährig"`.
- [x] b) Der ternäre Operator hat die Syntax: `bedingung ? wertWennWahr : wertWennFalsch`.
- [-] c) Der ternäre Operator kann nur mit `if` ersetzt werden, nicht mit `else if`.
- [ ] d) Der ternäre Operator kann innerhalb von Template Strings verwendet werden.

c) mit 'if else' (oder 'if') könnte man ihn ggf ersetzen, aber 'else if' ist nicht korrekt

---

### Frage 9: JSON.stringify() und JSON.parse()

Welche Aussagen über JSON in JavaScript sind richtig?

- [x] a) `JSON.stringify()` wandelt ein JavaScript-Objekt in einen JSON-String um.
- [x] b) `JSON.parse()` wandelt einen JSON-String in ein JavaScript-Objekt um.
- [x] c) JSON-Schlüssel müssen immer in Anführungszeichen stehen (z.B. `{"name": "Max"}`).
- [ ] d) `JSON.stringify()` funktioniert nicht mit verschachtelten Objekten.

---

### Frage 10: Type Coercion

Was ist das Ergebnis der folgenden Ausdrücke?

- [x] a) `5 + "3"` ergibt `"53"`.
- [x] b) `5 - "3"` ergibt `2`.
- [x] c) `"10" * "2"` ergibt `20`.
- [x] d) `"abc" - 5` ergibt `NaN`.

---

## Teil 2: Freitext-Fragen (3 Fragen à 15 Punkte)

---

### Frage 11: filter() und map() kombinieren (15 Punkte)

Gegeben ist folgendes Array von Personen:

```javascript
const personen = [
    { name: "Anna", alter: 25, stadt: "Wien" },
    { name: "Bernd", alter: 17, stadt: "Graz" },
    { name: "Clara", alter: 30, stadt: "Linz" },
    { name: "David", alter: 16, stadt: "Salzburg" },
    { name: "Eva", alter: 22, stadt: "Innsbruck" },
];
```

**Aufgabe:** Schreiben Sie JavaScript-Code, der:

1. Alle volljährigen Personen (alter >= 18) filtert.
const vollj = personen.filter( (person) => person.alter >= 18)
2. Aus dem gefilterten Array ein neues Array mit Strings im Format `"Name aus Stadt"` erstellt.
const NaSt = vollj.map( (person) => `${person.name} aus ${person.stadt}` )

**Erwartetes Ergebnis:** `["Anna aus Wien", "Clara aus Linz", "Eva aus Innsbruck"]`

---

### Frage 12: reduce() für Durchschnitt (15 Punkte)

Gegeben ist folgendes Array:

```javascript
const noten = [2, 3, 1, 4, 2, 5, 3];
```

**Aufgabe:** Schreiben Sie JavaScript-Code mit `reduce()`, der den Durchschnitt der Noten berechnet.

**Hinweis:** Der Durchschnitt ist die Summe aller Noten geteilt durch die Anzahl der Noten.

const averageGrade = noten.reduce( (acc, noten) => acc + noten, 0.0000000000000 ) / noten.length;


**Erwartetes Ergebnis:** `2.857142857142857` (oder ähnlich)

---

### Frage 13: Truthy/Falsy erklären (15 Punkte)

**Aufgabe:** Erklären Sie das Konzept von Truthy und Falsy in JavaScript.

1. Listen Sie alle Falsy-Werte in JavaScript auf.
    "false"
    null

2. Geben Sie je ein Code-Beispiel, in dem ein Truthy-Wert und ein Falsy-Wert in einer `if`-Bedingung verwendet wird.

    const alter = 17;
    if(alter>18) {} //falsy
    if(alter<18) {} // truthy


3. Erklären Sie kurz, warum `Boolean("false")` `true` ergibt.

    Standardmäßig ist ein Boolean false.
     Wenn man den Boolean aktiviert/ selbst angibt, so wird der Wert true, unabhängig davon, ob er selbst false oder true sagt.

---

---

*Gutes Gelingen!*
