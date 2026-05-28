class MatrixException extends Error {
  constructor(message) {
    super(message);
    this.name = 'MatrixException';
  }
}

module.exports = MatrixException;
