import { z } from "../deps.ts";

export const Environment = z.record(
  z.string().min(2).regex(/^[a-zA-Z]/, {
    message: "Must start with a letter",
  }),
  z.string(),
);

export const Input = z.record(
  z.string().min(2).refine((arg) => !arg.startsWith("input_"), {
    message: "Input key cannot start with 'input_'",
  }),
  z.any(),
);

export const WhenObject = z.object({
  event: z.string().optional(),
  if: z.string().optional(),
});

export const When = z.enum(["*", "always"])
  .or(z.boolean())
  .or(z.string())
  .or(z.array(z.string().or(WhenObject)))
  .or(WhenObject);

export const PermissionValue = z.boolean()
  .or(z.enum(["inherit", "none", "*"]))
  .or(z.array(z.string()))
  .optional()
  .default("inherit");

export const Permissions = z.object({
  env: PermissionValue,
  read: PermissionValue,
  write: PermissionValue,
  net: PermissionValue,
  run: PermissionValue,
}).or(z.boolean()).or(z.enum(["all", "none", "*"]));
