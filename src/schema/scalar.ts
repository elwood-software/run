import { z } from "../deps.ts";

/**
 * Name scalar
 * @private
 */
export const Name = z.string()
  .min(2, {
    message: "Must be at least 2 characters",
  })
  .max(246, {
    message: "Must be at most 246 characters",
  })
  .regex(/[a-zA-Z0-9_]/, {
    message: "Can contain only A-Z, a-z, 0-9, and _",
  })
  .regex(/^[a-zA-Z]/, {
    message: "Must start with a letter",
  });

export const Label = z.string()
  .max(254, {
    message: "Must be at most 254 characters",
  });

/**
 * Description scalar
 * @private
 */
export const Description = z.string().max(1024, {
  message: "Must be at most 1024 characters",
});

/**
 * Environment scalar
 * @private
 */
export const Environment = z.record(
  z.string().min(2).regex(/^[a-zA-Z]/, {
    message: "Must start with a letter",
  }),
  z.string(),
);

/**
 * Input scalar
 * @private
 */
export const Input = z.record(
  z.string()
    .min(2, {
      message: "Must be at least 2 characters",
    })
    .max(64, {
      message: "Must be at most 64 characters",
    })
    .regex(/^[a-zA-Z]/, {
      message: "Must start with a letter",
    })
    .refine((arg) => !arg.startsWith("input_"), {
      message: "Input key cannot start with 'input_'",
    }),
  z.any(),
);

/**
 * When Object scalar
 * @private
 */
export const WhenObject = z.object({
  event: z.string().optional(),
  if: z.string().optional(),
});

/**
 * When scalar
 * @private
 */
export const When = z.enum(["*", "always"])
  .or(z.boolean())
  .or(z.string())
  .or(z.array(z.string().or(WhenObject)))
  .or(WhenObject);

/**
 * Permissions scalar
 * @private
 */
export const PermissionValue = z.boolean()
  .or(z.enum(["inherit", "none", "*"]))
  .or(z.array(z.string()))
  .optional()
  .default("inherit");

/**
 * Permission Scalar
 * @private
 */
export const Permissions = z.object({
  env: PermissionValue,
  read: PermissionValue,
  write: PermissionValue,
  net: PermissionValue,
  run: PermissionValue,
}).or(z.boolean()).or(z.enum(["all", "none", "*"]));

/**
 * Variable scalar
 * @private
 */
export const Variable = z.union([
  z.string(),
  z.boolean(),
  z.number(),
  z.object({
    type: z.enum(["string", "number", "boolean"]),
    default: z.any(),
  }),
]);
