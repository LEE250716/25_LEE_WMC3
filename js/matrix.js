const fs = require('fs');
const path = require('path');
const MatrixException = require('./matrixException');

class Matrix {
  constructor(mx = null) {
    this.mx = mx;
  }

  getMx() {
    return this.mx;
  }

  setMx(mx) {
    this.mx = mx;
  }

  static main() {
    const filename1 = path.join(__dirname, 'test_import.csv');
    const filename2 = path.join(__dirname, 'test_export.csv');

    const M1 = new Matrix();
    M1.importMX(filename1);

    const M2 = new Matrix();
    M2.importMX(filename2);

    const mxA = M1.getMx();
    const mxB = M2.getMx();

    console.log('--- Matrix A ---');
    Matrix.druckeMatrix(mxA);

    console.log('\n--- Matrix B ---');
    Matrix.druckeMatrix(mxB);

    console.log('\n--- Addition A + B ---');
    try {
      console.log(JSON.stringify(Matrix.addition(mxA, mxB)));
    } catch (err) {
      throw new MatrixException('ERROR: ' + err + ' - falsche Eingabe!');
    }

    console.log('\n--- Multiplikation A x B ---');
    try {
      console.log(JSON.stringify(Matrix.multiplikation(mxA, mxB)));
    } catch (err) {
      throw new MatrixException('ERROR: ' + err + ' - falsche Eingabe!');
    }

    console.log('\n--- Matrix A ---');
    console.log('\nAdjazenzmatrix:');
    console.log(JSON.stringify(M1.adjMatrix(M1)));
    console.log('\nDistanzmatrix:');
    console.log(JSON.stringify(M1.distMatrix(M1)));
    console.log('\nRadius:      ' + Matrix.getRadius(M1));
    console.log('Durchmesser: ' + Matrix.getDurchmesser(M1));
    const zentrumA = Matrix.getZentrum(M1).map((i) => String.fromCharCode('A'.charCodeAt(0) + i));
    console.log('Zentrumsknoten: ' + JSON.stringify(zentrumA));

    console.log('\n--- Matrix B ---');
    console.log('\nAdjazenzmatrix:');
    console.log(JSON.stringify(M2.adjMatrix(M2)));
    console.log('\nDistanzmatrix:');
    console.log(JSON.stringify(M2.distMatrix(M2)));
    console.log('\nRadius:      ' + Matrix.getRadius(M2));
    console.log('Durchmesser: ' + Matrix.getDurchmesser(M2));
    const zentrumB = Matrix.getZentrum(M2).map((i) => String.fromCharCode('A'.charCodeAt(0) + i));
    console.log('Zentrumsknoten: ' + JSON.stringify(zentrumB));
  }

  static addition(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a[0].length !== b[0].length) {
      throw new MatrixException('ERROR: Matrizen unterschiedlicher Größe, nicht addierbar!');
    }

    const zeilen = a.length;
    const spalten = a[0].length;
    const ergebnis = Array.from({ length: zeilen }, () => Array(spalten).fill(0));

    for (let i = 0; i < zeilen; i++) {
      for (let j = 0; j < spalten; j++) {
        ergebnis[i][j] = a[i][j] + b[i][j];
      }
    }

    return ergebnis;
  }

  static multiplikation(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a[0].length !== b.length) {
      throw new MatrixException('ERROR: Spaltenanzahl(A) muss mit Zeilenanzahl(B) übereinstimmen!');
    }

    const zeilenA = a.length;
    const spaltenA = a[0].length;
    const spaltenB = b[0].length;
    const ergebnis = Array.from({ length: zeilenA }, () => Array(spaltenB).fill(0));

    for (let i = 0; i < zeilenA; i++) {
      for (let j = 0; j < spaltenB; j++) {
        for (let k = 0; k < spaltenA; k++) {
          ergebnis[i][j] += a[i][k] * b[k][j];
        }
      }
    }

    return ergebnis;
  }

  adjMatrix(M1) {
    const mx = this.mx || (M1 && typeof M1.getMx === 'function' ? M1.getMx() : null);
    if (!Array.isArray(mx) || mx.length === 0 || mx.length !== mx[0].length) {
      throw new MatrixException('ERROR: Matrix muss quadratisch sein, um einen Graphen darzustellen!');
    }

    const n = mx.length;
    const adj = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        adj[i][j] = mx[i][j] !== 0 ? 1 : 0;
      }
    }

    return adj;
  }

  distMatrix(M1) {
    const mx = this.mx || (M1 && typeof M1.getMx === 'function' ? M1.getMx() : null);
    if (!Array.isArray(mx) || mx.length === 0 || mx.length !== mx[0].length) {
      throw new MatrixException('ERROR: Matrix muss quadratisch sein, um einen Graphen darzustellen!');
    }

    const n = mx.length;
    const dist = Array.from({ length: n }, () => Array(n).fill(Number.POSITIVE_INFINITY));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          dist[i][j] = 0;
        } else if (mx[i][j] === 0) {
          dist[i][j] = Number.POSITIVE_INFINITY;
        } else {
          dist[i][j] = mx[i][j];
        }
      }
    }

    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (dist[i][k] !== Number.POSITIVE_INFINITY && dist[k][j] !== Number.POSITIVE_INFINITY) {
            const candidate = dist[i][k] + dist[k][j];
            if (candidate < dist[i][j]) {
              dist[i][j] = candidate;
            }
          }
        }
      }
    }

    return dist;
  }

  static exzentr(M1, knoten) {
    const dist = M1.distMatrix(M1);
    if (knoten < 0 || knoten >= dist[0].length) {
      throw new MatrixException('ERROR: Knoten-Index (Spalte) existiert nicht!');
    }

    let exz = 0;
    for (let j = 0; j < dist.length; j++) {
      if (dist[knoten][j] === Number.POSITIVE_INFINITY) {
        return Number.POSITIVE_INFINITY;
      }
      if (dist[knoten][j] > exz) {
        exz = dist[knoten][j];
      }
    }
    return exz;
  }

  static getDurchmesser(M1) {
    let dm = 0;
    const n = M1.getMx().length;
    for (let i = 0; i < n; i++) {
      const exz = Matrix.exzentr(M1, i);
      if (exz > dm) {
        dm = exz;
      }
    }
    return dm;
  }

  static getRadius(M1) {
    let r = Number.POSITIVE_INFINITY;
    const n = M1.getMx().length;
    for (let i = 0; i < n; i++) {
      const exz = Matrix.exzentr(M1, i);
      if (exz > 0 && exz < r) {
        r = exz;
      }
    }
    return r;
  }

  static getZentrum(M1) {
    const r = Matrix.getRadius(M1);
    const mx = M1.getMx();
    const knoten = [];

    if (r === Number.POSITIVE_INFINITY) {
      console.log('Der Graph hängt nicht zusammen. Alle Knoten sind Zentrum.');
    }

    for (let i = 0; i < mx.length; i++) {
      const exz = Matrix.exzentr(M1, i);
      if (r === exz) {
        knoten.push(i);
      }
    }
    return knoten;
  }

  static Kante = class {
    constructor(u, v) {
      this.u = Math.min(u, v);
      this.v = Math.max(u, v);
    }

    toString() {
      return `(${this.u}-${this.v})`;
    }
  };

  static DFS(u, adj, besucht, steps, delta, elternKnoten, isArtikulation, brucken, dfsZeit) {
    besucht[u] = true;
    dfsZeit[0] += 1;
    steps[u] = delta[u] = dfsZeit[0];
    let kinderAnzahl = 0;

    for (let v = 0; v < adj.length; v++) {
      if (adj[u][v] === 1.0) {
        if (!besucht[v]) {
          kinderAnzahl += 1;
          elternKnoten[v] = u;
          Matrix.DFS(v, adj, besucht, steps, delta, elternKnoten, isArtikulation, brucken, dfsZeit);
          delta[u] = Math.min(delta[u], delta[v]);

          if (elternKnoten[u] !== -1 && delta[v] >= steps[u]) {
            isArtikulation[u] = true;
          }

          if (delta[v] > steps[u]) {
            brucken.push(new Matrix.Kante(u, v));
          }
        } else if (v !== elternKnoten[u]) {
          delta[u] = Math.min(delta[u], steps[v]);
        }
      }
    }

    if (elternKnoten[u] === -1 && kinderAnzahl > 1) {
      isArtikulation[u] = true;
    }
  }

  static analysiere(M1) {
    const adj = M1.adjMatrix(M1);
    const n = adj.length;
    const steps = Array(n).fill(-1);
    const delta = Array(n).fill(-1);
    const elternKnoten = Array(n).fill(-1);
    const besucht = Array(n).fill(false);
    const isArtikulation = Array(n).fill(false);
    const brucken = [];
    const artikulationen = [];
    const dfsZeit = [0];

    for (let i = 0; i < n; i++) {
      if (!besucht[i]) {
        Matrix.DFS(i, adj, besucht, steps, delta, elternKnoten, isArtikulation, brucken, dfsZeit);
      }
    }

    for (let i = 0; i < n; i++) {
      if (isArtikulation[i]) {
        artikulationen.push(i);
      }
    }

    console.log('--- Strukturanalyse des Graphen ---');
    console.log('Artikulationen (Trennknoten): ' + JSON.stringify(artikulationen));
    console.log('Brücken (Trennkanten):        ' + brucken.map(edge => edge.toString()).join(', '));
  }

  importMX(filename) {
    try {
      const resolved = path.isAbsolute(filename) ? filename : path.join(__dirname, filename);
      const content = fs.readFileSync(resolved, 'utf8');
      const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
      const zeilenListe = lines.map((line) => {
        const teile = line.trim().split(/\s+/);
        return teile.map((value) => {
          const zahl = Number(value.trim());
          if (Number.isNaN(zahl)) {
            throw new MatrixException('ERROR: ' + value + ' - kein INT Typ!');
          }
          return zahl;
        });
      });
      this.setMx(zeilenListe);
    } catch (err) {
      if (err instanceof MatrixException) {
        throw err;
      }
      throw new MatrixException('ERROR: ' + err.message);
    }
  }

  exportMX(filename) {
    try {
      const resolved = path.isAbsolute(filename) ? filename : path.join(__dirname, filename);
      const rows = this.mx || [];
      const content = rows.map((row) => row.join(' ')).join('\n');
      fs.writeFileSync(resolved, content, 'utf8');
    } catch (err) {
      throw new MatrixException('ERROR: ' + err.message + ' - kann nicht erstellt werden!');
    }
  }

  static druckeMatrix(matrix) {
    matrix.forEach((row) => {
      const line = row.map((wert) => wert.toFixed(1).padStart(8)).join(' ');
      console.log(line);
    });
  }

  equals(mat) {
    return Matrix.deepEquals(this.getMx(), mat && typeof mat.getMx === 'function' ? mat.getMx() : null);
  }

  hashCode() {
    if (!Array.isArray(this.mx)) {
      return 0;
    }
    return this.mx.flat().reduce((hash, val) => ((hash * 31 + Number(val)) | 0), 0);
  }

  isValid(mx) {
    if (!Array.isArray(mx)) {
      return false;
    }
    for (const row of mx) {
      for (const val of row) {
        if (val !== 0 && val !== 1) {
          return false;
        }
      }
    }
    return true;
  }

  static deepEquals(a, b) {
    if (a === b) {
      return true;
    }
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (Array.isArray(a[i]) && Array.isArray(b[i])) {
        if (!Matrix.deepEquals(a[i], b[i])) {
          return false;
        }
      } else if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
}

if (require.main === module) {
  try {
    Matrix.main();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

module.exports = Matrix;
