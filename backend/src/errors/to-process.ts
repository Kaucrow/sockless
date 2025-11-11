export class ToProcessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Thrown for bad request errors in to-process
 * (e.g., trying to modify a nonexistent DB record.)
 */
export class ToProcessBadReqError extends ToProcessError {
  constructor(message: string) {
    super(message);
  }
}