export class ValidationAppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Thrown for validation failure
 * (e.g., invalid string formats, incorrect types, etc.).
 */
export class ValidationError extends ValidationAppError {
  constructor(property: string, message: string) {
    super(`Property '${property}': ${message}`);
  }
}