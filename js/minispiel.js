// ============================================================================
// GEMEINSAME HILFSFUNKTION: LocalStorage-Schnittstelle zur matrify.html
// ============================================================================
function pushMatrixToMatrify(name, matrixData) {
  const storedMatrices = localStorage.getItem('matrify_matrices');
  let matrices = storedMatrices ? JSON.parse(storedMatrices) : [];

  let targetId = 1;
  while (matrices.some(m => m.id === targetId)) {
    targetId++;
  }

  matrices.push({
    id: targetId,
    name: name,
    matrix: matrixData
  });

  localStorage.setItem('matrify_matrices', JSON.stringify(matrices));

  const msg = document.createElement('p');
  msg.style.color = '#1f6feb';
  msg.style.fontWeight = 'bold';
  msg.style.marginTop = '0.5rem';
  msg.style.textAlign = 'center';
  msg.textContent = `💾 Erfolgreich als '${name}' (Matrix ${targetId}) gespeichert!`;

  if (name.startsWith("TicTacToe")) {
    const tttContainer = document.getElementById('tttMatrixContainer');
    const oldMsg = tttContainer.querySelector('.save-success-msg');
    if (oldMsg) oldMsg.remove();
    msg.className = 'save-success-msg';
    tttContainer.appendChild(msg);
  } else {
    const graphMatrixArea = document.getElementById('graphMatrixArea');
    const oldMsg = graphMatrixArea.querySelector('.save-success-msg');
    if (oldMsg) oldMsg.remove();
    msg.className = 'save-success-msg';
    graphMatrixArea.appendChild(msg);
  }
}


function createHTMLTable(matrix) {
  const table = document.createElement('table');
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  matrix.forEach((row) => {
    const tr = document.createElement('tr');
    row.forEach((cell) => {
      const td = document.createElement('td');
      td.style.border = "1px solid #e2e8f0";
      td.style.padding = "0.25rem";
      td.style.textAlign = "center";
      td.textContent = cell;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  return table;
}

// ============================================================================
// 1) TIC-TAC-TOE MINISPIEL LOGIK
// ============================================================================
let tttBoard = Array(9).fill(null);
let gameActive = true;
let moveHistory = []; // Speichert die Indizes der Züge in chronologischer Reihenfolge
let generatedTttMatrix = null;

const tttCells = document.querySelectorAll('.ttt-cell');
const tttStatus = document.getElementById('tttStatus');
const tttMatrixArea = document.getElementById('tttMatrixArea');
const tttMatrixView = document.getElementById('tttMatrixView');

const winPatterns = [
  [0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]
];

tttCells.forEach(cell => cell.addEventListener('click', handleTttClick));
document.getElementById('resetTttBtn').addEventListener('click', resetTtt);
document.getElementById('saveTttMatrixBtn').addEventListener('click', () => {
  if (generatedTttMatrix) pushMatrixToMatrify("TicTacToe_Spielverlauf", generatedTttMatrix);
});

function handleTttClick(e) {
  const index = parseInt(e.target.getAttribute('data-index'));
  if (tttBoard[index] || !gameActive) return;

  makeMove(index, 'X');
  if (checkWin('X')) {
    endTttGame('Du hast gewonnen!');
    return;
  }
  if (tttBoard.every(cell => cell !== null)) {
    endTttGame('Unentschieden!');
    return;
  }

  tttStatus.textContent = "Computer überlegt...";
  setTimeout(computerMove, 300);
}

function makeMove(index, player) {
  tttBoard[index] = player;
  tttCells[index].textContent = player;
  moveHistory.push(index);
}

function computerMove() {
  if (!gameActive) return;
  // Effiziente KI: Prüft erst ob sie gewinnen kann, dann ob sie blocken muss, sonst Mitte/Zufall
  let move = findBestCell('O') ?? findBestCell('X') ?? (tttBoard[4] === null ? 4 : tttBoard.findIndex(c => c === null));
  
  if (move !== -1 && move !== undefined) {
    makeMove(move, 'O');
    if (checkWin('O')) {
      endTttGame('Der Computer hat gewonnen!');
      return;
    }
    if (tttBoard.every(cell => cell !== null)) {
      endTttGame('Unentschieden!');
      return;
    }
    tttStatus.textContent = "Du bist dran (X)";
  }
}

function findBestCell(player) {
  for (let pattern of winPatterns) {
    const count = pattern.filter(idx => tttBoard[idx] === player).length;
    const empty = pattern.filter(idx => tttBoard[idx] === null);
    if (count === 2 && empty.length === 1) return empty[0];
  }
  return null;
}

function checkWin(player) {
  return winPatterns.some(pattern => pattern.every(idx => tttBoard[idx] === player));
}

function endTttGame(msg) {
  gameActive = false;
  tttStatus.textContent = msg;
  buildTttMatrix();
}

function buildTttMatrix() {
  // Erzeugt eine 9x9 Adjazenzmatrix basierend auf zeitlich aufeinanderfolgenden Zügen
  let matrix = Array.from({ length: 9 }, () => Array(9).fill(0));
  for (let i = 0; i < moveHistory.length - 1; i++) {
    let from = moveHistory[i];
    let to = moveHistory[i+1];
    matrix[from][to] = 1; // Gerichtete Kante von Zug(n) zu Zug(n+1)
  }
  generatedTttMatrix = matrix;
  tttMatrixView.innerHTML = '';
  tttMatrixView.appendChild(createHTMLTable(matrix));
  tttMatrixArea.style.display = 'block';
}

function resetTtt() {
  tttBoard.fill(null);
  moveHistory = [];
  gameActive = true;
  generatedTttMatrix = null;
  tttCells.forEach(cell => cell.textContent = '');
  tttStatus.textContent = "Du bist dran (X)";
  tttMatrixArea.style.display = 'none';
}

// ============================================================================
// 2) GRAPHENZEICHNER LOGIK (KLICK-ZU-KLICK STEUERUNG)
// ============================================================================
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
let nodes = [];
let edges = [];
let startNodeIndex = null; // Speichert den ersten ausgewählten Knoten für eine Kante
let generatedGraphMatrix = null;

const graphMatrixArea = document.getElementById('graphMatrixArea');
const graphMatrixView = document.getElementById('graphMatrixView');

// Event-Listener: Wir brauchen nur noch den Klick (mousedown)
canvas.addEventListener('mousedown', handleCanvasMouseDown);
document.getElementById('clearGraphBtn').addEventListener('click', clearGraph);
document.getElementById('generateGraphMatrixBtn').addEventListener('click', buildGraphMatrix);
document.getElementById('saveGraphMatrixBtn').addEventListener('click', () => {
  if (generatedGraphMatrix) pushMatrixToMatrify("Gezeichneter_Graph", generatedGraphMatrix);
});

function getSelectedTool() {
  return document.querySelector('input[name="graphTool"]:checked').value;
}

function handleCanvasMouseDown(e) {
  const rect = canvas.getBoundingClientRect();
  
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);

  const clickedNodeIndex = findNodeAt(x, y);
  const tool = getSelectedTool();


  // Wenn wir das Tool wechseln, setzen wir eine eventuelle halbfertige Kante zurück
  if (tool !== 'edge') {
    startNodeIndex = null;
  }

  if (tool === 'node') {
    // KNOTEN ZEICHNEN
    if (clickedNodeIndex === null) {
      if (nodes.length >= 26) { alert("Maximal 26 Knoten erlaubt!"); return; }
      nodes.push({ x, y, label: String.fromCharCode(65 + nodes.length) });
      drawGraph();
    }
  } 
  else if (tool === 'edge') {
    // KANTE ZEICHNEN (KLICK-ZU-KLICK)
    if (clickedNodeIndex !== null) {
      if (startNodeIndex === null) {
        // Schritt 1: Ersten Knoten auswählen
        startNodeIndex = clickedNodeIndex;
        drawGraph(); // Zeichnet den ausgewählten Knoten mit einer Markierung
      } else {
        // Schritt 2: Zweiten Knoten auswählen (muss sich vom ersten unterscheiden)
        if (startNodeIndex !== clickedNodeIndex) {
          // Prüfen, ob die ungerichtete Kante bereits existiert
          const exists = edges.some(edge => 
            (edge.from === startNodeIndex && edge.to === clickedNodeIndex) || 
            (edge.from === clickedNodeIndex && edge.to === startNodeIndex)
          );
          if (!exists) {
            edges.push({ from: startNodeIndex, to: clickedNodeIndex });
          }
        }
        startNodeIndex = null; // Auswahl zurücksetzen
        drawGraph();
      }
    } else {
      // Klick ins Leere bricht die Kanten-Auswahl ab
      startNodeIndex = null;
      drawGraph();
    }
  } 
  else if (tool === 'delete') {
    // LÖSCHEN-WERKZEUG
    if (clickedNodeIndex !== null) {
      // 1. Zugehörige Kanten dieses Knotens entfernen
      edges = edges.filter(edge => edge.from !== clickedNodeIndex && edge.to !== clickedNodeIndex);
      
      // 2. Kanten-Indizes verschieben, da das nodes-Array gleich schrumpft
      edges = edges.map(edge => {
        let from = edge.from > clickedNodeIndex ? edge.from - 1 : edge.from;
        let to = edge.to > clickedNodeIndex ? edge.to - 1 : edge.to;
        return { from, to };
      });

      // 3. Erst jetzt den Knoten sicher herauslöschen
      nodes.splice(clickedNodeIndex, 1);

      // 4. Knotennamen (A, B, C...) neu vergeben
      nodes.forEach((node, idx) => {
        node.label = String.fromCharCode(65 + idx);
      });
      drawGraph();
    } else {
      // Wenn kein Knoten getroffen wurde, prüfen wir, ob eine Kante getroffen wurde
      const clickedEdgeIndex = findEdgeAt(x, y);
      if (clickedEdgeIndex !== null) {
        edges.splice(clickedEdgeIndex, 1);
        drawGraph();
      }
    }
  }
}

function findNodeAt(x, y) {
  for (let i = 0; i < nodes.length; i++) {
    const dist = Math.hypot(nodes[i].x - x, nodes[i].y - y);
    if (dist <= 18) { 
      return i; // Gibt garantiert den exakten Index des Knotens zurück
    }
  }
  return null; 
}

function findEdgeAt(x, y) {
  const threshold = 8; 
  for (let i = 0; i < edges.length; i++) {
    const n1 = nodes[edges[i].from];
    const n2 = nodes[edges[i].to];
    
    const A = x - n1.x;
    const B = y - n1.y;
    const C = n2.x - n1.x;
    const D = n2.y - n1.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
      xx = n1.x;
      yy = n1.y;
    } else if (param > 1) {
      xx = n2.x;
      yy = n2.y;
    } else {
      xx = n1.x + param * C;
      yy = n1.y + param * D;
    }

    const dist = Math.hypot(x - xx, y - yy);
    if (dist < threshold) return i;
  }
  return null;
}

function drawGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Kanten zeichnen
  edges.forEach(edge => {
    ctx.beginPath();
    ctx.moveTo(nodes[edge.from].x, nodes[edge.from].y);
    ctx.lineTo(nodes[edge.to].x, nodes[edge.to].y);
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  // Knoten zeichnen
  nodes.forEach((node, idx) => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 15, 0, 2 * Math.PI);
    
    // VISUELLER ANKER: Wenn der Knoten als Startknoten für eine Kante gewählt wurde, färben wir ihn orange
    if (idx === startNodeIndex) {
      ctx.fillStyle = '#f59e0b'; 
    } else {
      ctx.fillStyle = '#1f6feb';
    }
    
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Beschriftung (A, B, C...)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x, node.y);
  });
}

function buildGraphMatrix() {
  if (nodes.length === 0) { alert("Bitte zeichne zuerst Knoten!"); return; }
  const n = nodes.length;
  let matrix = Array.from({ length: n }, () => Array(n).fill(0));

  edges.forEach(edge => {
    matrix[edge.from][edge.to] = 1;
    matrix[edge.to][edge.from] = 1;
  });

  generatedGraphMatrix = matrix;
  graphMatrixView.innerHTML = '';
  graphMatrixView.appendChild(createHTMLTable(matrix));
  graphMatrixArea.style.display = 'block';
}

function clearGraph() {
  nodes = [];
  edges = [];
  startNodeIndex = null;
  generatedGraphMatrix = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  graphMatrixArea.style.display = 'none';
}

