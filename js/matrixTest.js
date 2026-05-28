const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Matrix = require('./matrix');
const MatrixException = require('./matrixException');

const baseDir = __dirname;
const filePath = (name) => path.join(baseDir, name);

function writeTestFile(name, content) {
  fs.writeFileSync(filePath(name), content, 'utf8');
}

function cleanupTestFile(name) {
  try {
    fs.unlinkSync(filePath(name));
  } catch (_err) {
    // ignore
  }
}

function runTest(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
  } catch (error) {
    console.error(`FAIL: ${name}: ${error.message}`);
    cleanupTestFile('test_import.csv');
    cleanupTestFile('test_wrong.csv');
    cleanupTestFile('test_export.csv');
    process.exit(1);
  }
}

writeTestFile('test_import.csv', '1 2 3\n4 5 6\n');
writeTestFile('test_wrong.csv', '1 2 X\n4 5 6\n');

runTest('TestImportMXok', () => {
  const M1 = new Matrix();
  M1.importMX(filePath('test_import.csv'));
  assert.deepStrictEqual(M1.getMx(), [[1, 2, 3], [4, 5, 6]]);
});

runTest('TestImportMXNoFile', () => {
  const M1 = new Matrix();
  assert.throws(() => M1.importMX(filePath('no_file_available.csv')), MatrixException);
});

runTest('TestImportMXWrongData', () => {
  const M1 = new Matrix();
  assert.throws(() => M1.importMX(filePath('test_wrong.csv')), MatrixException);
});

runTest('TestExportMXOK', () => {
  const M1 = new Matrix();
  const M2 = new Matrix();
  M1.importMX(filePath('test_import.csv'));
  M1.exportMX(filePath('test_export.csv'));
  M2.importMX(filePath('test_export.csv'));
  assert.deepStrictEqual(M1.getMx(), M2.getMx());
});

runTest('TestExportMXWrongPath', () => {
  const M1 = new Matrix();
  M1.importMX(filePath('test_import.csv'));
  assert.throws(() => M1.exportMX(filePath(path.join('wrong', 'test_export.csv'))), MatrixException);
});

runTest('TestBerechne', () => {
  const mxA = [[1, 0, 1], [0, 1, 0], [1, 0, 1]];
  const mxB = [[1, 2, 3], [2, 4, 2], [3, 2, 1]];
  const mAB = [[2, 2, 4], [2, 5, 2], [4, 2, 2]];
  const mAxB = [[4, 4, 4], [2, 4, 2], [4, 4, 4]];
  assert.deepStrictEqual(Matrix.addition(mxA, mxB), mAB);
  assert.deepStrictEqual(Matrix.multiplikation(mxA, mxB), mAxB);
});

runTest('TestBerechneAddOnly', () => {
  const mxA = [[1, 0, 1], [0, 1, 0]];
  const mxB = [[1, 2, 3], [2, 4, 2]];
  const mAB = [[2, 2, 4], [2, 5, 2]];
  assert.deepStrictEqual(Matrix.addition(mxA, mxB), mAB);
  assert.throws(() => Matrix.multiplikation(mxA, mxB), MatrixException);
});

runTest('TestBerechneMultOnly', () => {
  const mxA = [[1, 0, 1], [0, 1, 0]];
  const mxB = [[1, 2, 3], [2, 4, 2], [3, 2, 1]];
  const mAxB = [[4, 4, 4], [2, 4, 2]];
  assert.throws(() => Matrix.addition(mxA, mxB), MatrixException);
  assert.deepStrictEqual(Matrix.multiplikation(mxA, mxB), mAxB);
});

runTest('TestAdj', () => {
  const mxA = [[1, 2, 3], [2, 4, 2], [3, 2, 1]];
  const mxAdj = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
  const M1 = new Matrix(mxA);
  assert.deepStrictEqual(M1.adjMatrix(M1), mxAdj);
});

runTest('TestAdjNichtQuad', () => {
  const mxA = [[1, 2, 3], [2, 4, 2]];
  const M1 = new Matrix(mxA);
  assert.throws(() => M1.adjMatrix(M1), MatrixException);
});

runTest('TestDist', () => {
  const mxA = [[1, 2, 3], [2, 4, 2], [3, 2, 1]];
  const mxDist = [[0, 2, 3], [2, 0, 2], [3, 2, 0]];
  const M1 = new Matrix(mxA);
  assert.deepStrictEqual(M1.distMatrix(M1), mxDist);
});

runTest('TestDistNichtQuad', () => {
  const mxA = [[1, 2, 3], [2, 4, 2]];
  const M1 = new Matrix(mxA);
  assert.throws(() => M1.distMatrix(M1), MatrixException);
});

runTest('TestExzentr', () => {
  const mxA = [[1, 2, 3], [2, 4, 2], [3, 2, 1]];
  const M1 = new Matrix(mxA);
  assert.strictEqual(Matrix.exzentr(M1, 2), 3);
  assert.strictEqual(Matrix.getDurchmesser(M1), 3);
  assert.strictEqual(Matrix.getRadius(M1), 2);
  assert.deepStrictEqual(Matrix.getZentrum(M1), [1]);
});

runTest('TestExzentr2', () => {
  const mxA = [[1, 7, 1], [0, 4, 0], [1, 0, 1]];
  const M1 = new Matrix(mxA);
  assert.strictEqual(Matrix.exzentr(M1, 2), 8);
  assert.strictEqual(Matrix.getDurchmesser(M1), Number.POSITIVE_INFINITY);
  assert.strictEqual(Matrix.getRadius(M1), 7);
  assert.deepStrictEqual(Matrix.getZentrum(M1), [0]);
});

runTest('TestExzentrWrong', () => {
  const mxA = [[1, 7, 1], [0, 4, 0], [1, 0, 1]];
  const M1 = new Matrix(mxA);
  assert.throws(() => Matrix.exzentr(M1, 5), MatrixException);
  assert.strictEqual(Matrix.getDurchmesser(M1), Number.POSITIVE_INFINITY);
  assert.strictEqual(Matrix.getRadius(M1), 7);
});

runTest('TestZusammenhangskomponenten', () => {
  const mxA = [[0, 0, 3], [0, 0, 2], [3, 2, 0]];
  const M1 = new Matrix(mxA);
  Matrix.analysiere(M1);
});

cleanupTestFile('test_import.csv');
cleanupTestFile('test_wrong.csv');
cleanupTestFile('test_export.csv');

console.log('All tests finished.');
