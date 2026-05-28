const matrices = [];
let nextMatrixId = 1;

const fileInput = document.getElementById('fileInput');
const loadButton = document.getElementById('loadButton');
const matrixGrid = document.getElementById('matrixGrid');
const outputPanel = document.getElementById('outputPanel');
const generalStatus = document.getElementById('generalStatus');

function showStatus(message, error = false) {
  generalStatus.textContent = message;
  generalStatus.style.color = error ? '#c53030' : '#1f6feb';
}

function appendOutput(text) {
  const now = new Date().toLocaleTimeString();
  outputPanel.textContent = `[${now}] ${text}\n` + outputPanel.textContent;
}

function clearOutput() {
  outputPanel.textContent = '';
}

function parseCsv(content, fileName) {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const matrix = lines.map((line, rowIndex) => {
    const values = line.trim().split(/[,;\s]+/).filter(Boolean);
    return values.map((value, colIndex) => {
      const number = Number(value.trim());
      if (Number.isNaN(number)) {
        throw new Error(`Ungültiger Wert in ${fileName} bei Zeile ${rowIndex + 1}, Spalte ${colIndex + 1}: '${value}'`);
      }
      return number;
    });
  });
  return matrix;
}

function addMatrix(name, matrix) {
  const matrixItem = {
    id: nextMatrixId++,
    name,
    matrix
  };
  matrices.push(matrixItem);
  renderMatrices();
  return matrixItem;
}

function deleteMatrix(id) {
  const index = matrices.findIndex((item) => item.id === id);
  if (index >= 0) {
    matrices.splice(index, 1);
    renderMatrices();
    appendOutput(`Matrix ${id} wurde entfernt.`);
  }
}

function createMatrixTable(matrix) {
  const table = document.createElement('table');
  matrix.forEach((row) => {
    const tr = document.createElement('tr');
    row.forEach((cell) => {
      const td = document.createElement('td');
      td.textContent = Number.isFinite(cell) ? cell : cell;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  return table;
}

function renderMatrices() {
  matrixGrid.innerHTML = '';
  if (matrices.length === 0) {
    matrixGrid.innerHTML = '<p>Keine Matrizen geladen.</p>';
    return;
  }

  matrices.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'matrix-card';

    const header = document.createElement('header');
    const title = document.createElement('div');
    const nameElement = document.createElement('h3');
    nameElement.textContent = item.name;
    const idElement = document.createElement('small');
    idElement.textContent = `Matrix ${item.id}`;
    title.appendChild(nameElement);
    title.appendChild(idElement);
    header.appendChild(title);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Löschen';
    deleteBtn.style.background = '#f43f5e';
    deleteBtn.style.borderColor = '#f43f5e';
    deleteBtn.onclick = () => deleteMatrix(item.id);
    header.appendChild(deleteBtn);
    card.appendChild(header);

    const body = document.createElement('div');
    body.className = 'matrix-body';
    body.appendChild(createMatrixTable(item.matrix));
    card.appendChild(body);

    const footer = document.createElement('footer');

    const selectTarget = document.createElement('select');
    selectTarget.innerHTML = `<option value="">Eine Matrix wählen (für Addition | Multiplikation)</option>` + matrices
      .map((m) => `<option value="${m.id}">${m.name} (Matrix ${m.id})</option>`)
      .join('');
    footer.appendChild(selectTarget);

    const nodeIndexInput = document.createElement('input');
    nodeIndexInput.type = 'number';
    nodeIndexInput.placeholder = 'Knoten-Index für exzentr()';
    footer.appendChild(nodeIndexInput);

    const buttonGroup = document.createElement('div');
    buttonGroup.style.display = 'grid';
    buttonGroup.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
    buttonGroup.style.gap = '10px';

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Addition';
    addBtn.onclick = () => {
      const targetId = Number(selectTarget.value);
      if (!targetId) {
        showStatus('Bitte eine zweite Matrix für Addition wählen.', true);
        return;
      }
      const target = matrices.find((m) => m.id === targetId);
      try {
        const result = Matrix.addition(item.matrix, target.matrix);
        const resultName = `${item.name} + ${target.name}`;
        addMatrix(resultName, result);
        appendOutput(`Addition von Matrix ${item.id} und Matrix ${target.id} als ${resultName} erstellt.`);
        showStatus('Addition erfolgreich erstellt.');
      } catch (err) {
        showStatus(err.message, true);
      }
    };
    buttonGroup.appendChild(addBtn);

    const multiplyBtn = document.createElement('button');
    multiplyBtn.textContent = 'Multiplikation';
    multiplyBtn.onclick = () => {
      const targetId = Number(selectTarget.value);
      if (!targetId) {
        showStatus('Bitte eine Matrix für Multiplikation wählen.', true);
        return;
      }
      const target = matrices.find((m) => m.id === targetId);
      try {
        const result = Matrix.multiplikation(item.matrix, target.matrix);
        const resultName = `${item.name} × ${target.name}`;
        addMatrix(resultName, result);
        appendOutput(`Multiplikation von Matrix ${item.id} und Matrix ${target.id} als ${resultName} erstellt.`);
        showStatus('Multiplikation erfolgreich erstellt.');
      } catch (err) {
        showStatus(err.message, true);
      }
    };
    buttonGroup.appendChild(multiplyBtn);

    const adjBtn = document.createElement('button');
    adjBtn.textContent = 'Adjazenzmatrix';
    adjBtn.onclick = () => {
      try {
        const result = Matrix.adjMatrix(item.matrix);
        const resultName = `Adj(${item.name})`;
        addMatrix(resultName, result);
        appendOutput(`Adjazenzmatrix für Matrix ${item.id} erstellt.`);
        showStatus('Adjazenzmatrix erfolgreich erstellt.');
      } catch (err) {
        showStatus(err.message, true);
      }
    };
    buttonGroup.appendChild(adjBtn);

    const distBtn = document.createElement('button');
    distBtn.textContent = 'Distanzmatrix';
    distBtn.onclick = () => {
      try {
        const result = Matrix.distMatrix(item.matrix);
        const resultName = `Dist(${item.name})`;
        addMatrix(resultName, result);
        appendOutput(`Distanzmatrix für Matrix ${item.id} erstellt.`);
        showStatus('Distanzmatrix erfolgreich erstellt.');
      } catch (err) {
        showStatus(err.message, true);
      }
    };
    buttonGroup.appendChild(distBtn);

    const exzBtn = document.createElement('button');
    exzBtn.textContent = 'Exzentrizität';
    exzBtn.onclick = () => {
      const index = Number(nodeIndexInput.value);
      if (!Number.isInteger(index) || index < 0) {
        showStatus('Bitte einen gültigen Knoten-Index eingeben.', true);
        return;
      }
      try {
        const value = Matrix.exzentr(item.matrix, index);
        appendOutput(`Exzentrizität von Matrix ${item.id} Knoten ${index}: ${formatValue(value)}`);
        showStatus('Exzentrizität erfolgreich berechnet.');
      } catch (err) {
        showStatus(err.message, true);
      }
    };
    buttonGroup.appendChild(exzBtn);

    const dmBtn = document.createElement('button');
    dmBtn.textContent = 'Durchmesser';
    dmBtn.onclick = () => {
      try {
        const value = Matrix.getDurchmesser(item.matrix);
        appendOutput(`Durchmesser von Matrix ${item.id}: ${formatValue(value)}`);
        showStatus('Durchmesser erfolgreich berechnet.');
      } catch (err) {
        showStatus(err.message, true);
      }
    };
    buttonGroup.appendChild(dmBtn);

    const radiusBtn = document.createElement('button');
    radiusBtn.textContent = 'Radius';
    radiusBtn.onclick = () => {
      try {
        const value = Matrix.getRadius(item.matrix);
        appendOutput(`Radius von Matrix ${item.id}: ${formatValue(value)}`);
        showStatus('Radius erfolgreich berechnet.');
      } catch (err) {
        showStatus(err.message, true);
      }
    };
    buttonGroup.appendChild(radiusBtn);

    const zentrumBtn = document.createElement('button');
    zentrumBtn.textContent = 'Zentrum';
    zentrumBtn.onclick = () => {
      try {
        const value = Matrix.getZentrum(item.matrix);
        appendOutput(`Zentrum von Matrix ${item.id}: ${JSON.stringify(value)}`);
        showStatus('Zentrum erfolgreich berechnet.');
      } catch (err) {
        showStatus(err.message, true);
      }
    };
    buttonGroup.appendChild(zentrumBtn);

    const analyseBtn = document.createElement('button');
    analyseBtn.textContent = 'Analysiere';
    analyseBtn.onclick = () => {
      try {
        const report = Matrix.analysiere(item.matrix);
        appendOutput(`Analyse Matrix ${item.id}: Artikulationen=${JSON.stringify(report.artikulationen)}, Brücken=${JSON.stringify(report.brucken)}`);
        showStatus('Analyse erfolgreich durchgeführt.');
      } catch (err) {
        showStatus(err.message, true);
      }
    };
    buttonGroup.appendChild(analyseBtn);

    footer.appendChild(buttonGroup);
    card.appendChild(footer);
    matrixGrid.appendChild(card);
  });
}

function formatValue(value) {
  return value === Number.POSITIVE_INFINITY ? '∞' : String(value);
}

const Matrix = {
  addition(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a[0].length !== b[0].length) {
      throw new Error('ERROR: Matrizen unterschiedlicher Größe, nicht addierbar!');
    }
    return a.map((row, i) => row.map((val, j) => val + b[i][j]));
  },
  multiplikation(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a[0].length !== b.length) {
      throw new Error('ERROR: Spaltenanzahl(A) muss mit Zeilenanzahl(B) übereinstimmen!');
    }
    return a.map((row, i) => {
      return b[0].map((_, j) => row.reduce((sum, value, k) => sum + value * b[k][j], 0));
    });
  },
  adjMatrix(matrix) {
    if (!Array.isArray(matrix) || matrix.length === 0 || matrix.length !== matrix[0].length) {
      throw new Error('ERROR: Matrix muss quadratisch sein, um einen Graphen darzustellen!');
    }
    return matrix.map((row) => row.map((value) => (value !== 0 ? 1 : 0)));
  },
  distMatrix(matrix) {
    if (!Array.isArray(matrix) || matrix.length === 0 || matrix.length !== matrix[0].length) {
      throw new Error('ERROR: Matrix muss quadratisch sein, um einen Graphen darzustellen!');
    }
    const n = matrix.length;
    const dist = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => {
        if (i === j) return 0;
        return matrix[i][j] === 0 ? Number.POSITIVE_INFINITY : matrix[i][j];
      })
    );
    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const candidate = dist[i][k] + dist[k][j];
          if (candidate < dist[i][j]) {
            dist[i][j] = candidate;
          }
        }
      }
    }
    return dist;
  },
  exzentr(matrix, knoten) {
    const dist = Matrix.distMatrix(matrix);
    if (knoten < 0 || knoten >= dist.length) {
      throw new Error('ERROR: Knoten-Index (Spalte) existiert nicht!');
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
  },
  getDurchmesser(matrix) {
    const n = matrix.length;
    let dm = 0;
    for (let i = 0; i < n; i++) {
      const exz = Matrix.exzentr(matrix, i);
      if (exz > dm) dm = exz;
    }
    return dm;
  },
  getRadius(matrix) {
    const n = matrix.length;
    let r = Number.POSITIVE_INFINITY;
    for (let i = 0; i < n; i++) {
      const exz = Matrix.exzentr(matrix, i);
      if (exz > 0 && exz < r) r = exz;
    }
    return r;
  },
  getZentrum(matrix) {
    const r = Matrix.getRadius(matrix);
    const knoten = [];
    for (let i = 0; i < matrix.length; i++) {
      if (Matrix.exzentr(matrix, i) === r) {
        knoten.push(i);
      }
    }
    return knoten;
  },
  analysiere(matrix) {
    const adj = Matrix.adjMatrix(matrix);
    const n = adj.length;
    const visited = Array(n).fill(false);
    const disc = Array(n).fill(-1);
    const low = Array(n).fill(-1);
    const parent = Array(n).fill(-1);
    const articulation = Array(n).fill(false);
    const bridges = [];
    let time = 0;

    function dfs(u) {
      visited[u] = true;
      disc[u] = low[u] = ++time;
      let children = 0;
      for (let v = 0; v < n; v++) {
        if (adj[u][v] !== 1) continue;
        if (!visited[v]) {
          children++;
          parent[v] = u;
          dfs(v);
          low[u] = Math.min(low[u], low[v]);
          if (parent[u] !== -1 && low[v] >= disc[u]) articulation[u] = true;
          if (parent[u] === -1 && children > 1) articulation[u] = true;
          if (low[v] > disc[u]) bridges.push([u, v]);
        } else if (v !== parent[u]) {
          low[u] = Math.min(low[u], disc[v]);
        }
      }
    }

    for (let i = 0; i < n; i++) {
      if (!visited[i]) dfs(i);
    }
    return {
      artikulationen: articulation.map((value, index) => (value ? index : -1)).filter((v) => v !== -1),
      brucken: bridges
    };
  }
};

loadButton.addEventListener('click', () => {
  const files = Array.from(fileInput.files);
  if (files.length === 0) {
    showStatus('Bitte zuerst CSV-Dateien auswählen.', true);
    return;
  }
  let loadedCount = 0;
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const matrix = parseCsv(event.target.result, file.name);
        addMatrix(file.name, matrix);
        appendOutput(`CSV ${file.name} importiert.`);
        loadedCount++;
        if (loadedCount === files.length) {
          showStatus(`${files.length} Datei(en) importiert.`);
        }
      } catch (error) {
        showStatus(error.message, true);
      }
    };
    reader.readAsText(file, 'utf8');
  });
});

renderMatrices();
