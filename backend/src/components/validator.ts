import { z, type ZodType } from 'zod';
import type { ZodIssue } from 'zod/v3';
import { ValidationError, MissingPropertiesError } from '@errors/validator.js';
import { logger } from '@components/index.js';

class ValidatorComponent {
  static #instance: ValidatorComponent;

  private constructor() {}

  public static get instance(): ValidatorComponent {
    if (!ValidatorComponent.#instance) {
      ValidatorComponent.#instance = new ValidatorComponent();
    }
    return ValidatorComponent.#instance;
  }

  public validate<T extends ZodType>(
    data: unknown,
    schema: T
  ): z.infer<T> {
    try {
      return schema.parse(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Check if ALL issues are "missing property" issues
        const allAreMissingProperties = err.issues.every((issue) =>
          this.isMissingPropertyIssue(issue as ZodIssue),
        );

        if (allAreMissingProperties && err.issues.length > 0) {
          logger.debug(
            `Validation failed (Missing Properties): ${err.message}`,
          );
          throw new MissingPropertiesError(err.issues as ZodIssue[]);
        }

        // Otherwise, throw a general validation error
        logger.debug(`Validation failed (Invalid Data): ${err.message}`);
        throw new ValidationError(err.issues as ZodIssue[]);
      }

      // Log and re-throw unexpected errors
      logger.debug(`An unexpected error occurred during validation: ${err}`);
      throw err;
    }
  }

  private isMissingPropertyIssue(issue: ZodIssue): boolean {
    return (issue.code === 'invalid_type' && issue.received === 'undefined');
  }
}

export const validator = ValidatorComponent.instance;