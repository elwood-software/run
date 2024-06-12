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

export const When = z.string().default("true");

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
