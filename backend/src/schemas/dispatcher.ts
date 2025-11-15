import { z } from 'zod';

const argsSchema = z.record(z.any(), z.any());

export const toProcessSchema = z.object({
  tx: z.number(),
  args: argsSchema,
});

export const toProcessImgSchema = z.object({
  tx: z.coerce.number(
    "'tx' must be a string that can be converted to a number."
  ).int(),

  args: z
    .string("No 'args' field provided.")
    .transform((val, ctx) => {
      try {
        return JSON.parse(val);
      } catch (e) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid JSON format for 'args' field.",
        });
        return z.NEVER;
      }
    })
    .pipe(argsSchema),
});