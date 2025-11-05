import { z, type ZodType } from 'zod';
import { ValidationError } from '@errors/validator.js';
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
        logger.debug(`Validation failed (Invalid Data): ${err.message}`);
        throw new ValidationError(err.issues[0]!.path.join('.'), err.issues[0]!.message);
      }
      throw err;
    }
  }
}

export const validator = ValidatorComponent.instance;