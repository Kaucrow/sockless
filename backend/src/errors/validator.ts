import type { ZodIssue } from 'zod/v3';

export class ValidationAppError extends Error {
  public readonly issues: ZodIssue[];

  constructor(message: string, issues: ZodIssue[]) {
    super(message);
    this.name = this.constructor.name;
    this.issues = issues;
  }
}

/**
 * Thrown when validation fails only due to missing required properties.
 */
export class MissingPropertiesError extends ValidationAppError {
  constructor(issues: ZodIssue[]) {
    // Creates a list of the missing keys, e.g., "name, address.street"
    const missingKeys = issues
      .map((issue) => issue.path.join('.'))
      .filter(Boolean); // Filter out empty strings if any

    super(
      `Validation failed: Missing required properties: ${missingKeys.join(
        ', ',
      )}`,
      issues,
    );
  }
}

/**
 * Thrown for any other validation failure
 * (e.g., invalid string formats, incorrect types, etc.).
 */
export class ValidationError extends ValidationAppError {
  constructor(issues: ZodIssue[]) {
    // Creates a summary, e.g., "email (Invalid email); age (Number must be positive)"
    const summary = issues
      .map((issue) => `${issue.path.join('.')} (${issue.message})`)
      .join('; ');
    super(`Validation failed: ${summary}`, issues);
  }
}