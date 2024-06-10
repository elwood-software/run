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

export const Permissions = z.object({
  env: z.boolean().or(z.array(z.string())).optional().default(false),
  read: z.boolean().or(z.array(z.string())).optional().default(false),
  write: z.boolean().or(z.array(z.string())).optional().default(false),
  net: z.boolean().or(z.array(z.string())).optional().default(false),
  run: z.boolean().or(z.array(z.string())).optional().default(false),
});
