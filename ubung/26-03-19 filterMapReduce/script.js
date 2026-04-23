const personen = [
    {
        "id": 1,
        "name": "Lukas Huber",
        "alter": 28,
        "groesse": 182,
        "geburtsdatum": "1997-05-12",
        "herkunft": "Österreich",
        "gewicht": 78.5,
    },
    {
        "id": 2,
        "name": "Sarah Meyer",
        "alter": 34,
        "groesse": 165,
        "geburtsdatum": "1991-11-20",
        "herkunft": "Deutschland",
        "gewicht": 62.0,
    },
    {
        "id": 3,
        "name": "Mateo Rossi",
        "alter": 19,
        "groesse": 175,
        "geburtsdatum": "2006-02-28",
        "herkunft": "Italien",
        "gewicht": 70.2,
    },
    {
        "id": 4,
        "name": "Elena Fischer",
        "alter": 45,
        "groesse": 170,
        "geburtsdatum": "1980-08-05",
        "herkunft": "Schweiz",
        "gewicht": 65.8,
    },
    {
        "id": 5,
        "name": "Julian Novak",
        "alter": 22,
        "groesse": 190,
        "geburtsdatum": "2003-12-15",
        "herkunft": "Österreich",
        "gewicht": 85.3,
    },
    {
        "id": 6,
        "name": "Sophie Dubois",
        "alter": 31,
        "groesse": 168,
        "geburtsdatum": "1994-03-10",
        "herkunft": "Frankreich",
        "gewicht": 59.5,
    },
    {
        "id": 7,
        "name": "Erik Lindström",
        "alter": 52,
        "groesse": 185,
        "geburtsdatum": "1973-10-22",
        "herkunft": "Schweden",
        "gewicht": 92.1,
    },
];

// Wie viele Personen gibt es?

console.log(`Es gibt ${personen.length} Einträge im Array.`);


//Task 1 – filter:** Find all students who passed (grade ≤ 4). Store the result in `passed`.

const U30 = personen.filter( (person) => person.alter <= 30 );

//Task 2 – map:** Create an array of strings in the format `"Anna (17)"` from the original array. Store it in `labels`.

const labels = personen.map( (person) => `${person.name} (${person.alter})` );

//Task 3 – filter + map:** From only the passed students, extract just their names into an array `passedNames`.

const U30Names = U30.map( (person) => person.name );

//Task 4 – reduce:** Calculate the average grade of all students. Store it in `averageGrade`.

const averageAge = personen.reduce( (acc, person) => acc + person.alter, 0 ) / personen.length;

//Task 5 – chaining (bonus):** In a single chain, find the names of all students aged 17 or older who passed, joined into one comma-separated string.

//console.log!!!