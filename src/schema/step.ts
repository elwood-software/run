import { z } from "../deps.ts";

import { Environment, Input, Permissions } from "./scalar.ts";

export const StepSchemaBase = z.object({
  name: z.string().min(2).regex(/^[a-zA-Z]/, {
    message: "Must start with a letter",
  }).optional(),
  label: z.string().optional(),
  description: z.string().optional(),
  when: z.string().default("*").optional(),
  input: Input.optional(),
  env: Environment.optional(),
  permissions: Permissions.optional(),
});

export const StepSchemaWithRun = StepSchemaBase.merge(
  z.object({
    run: z.string(),
  }),
);

export const StepSchemaWithAction = StepSchemaBase.merge(
  z.object({
    action: z.string(),
  }),
);

export const StepSchema = z.union([
  StepSchemaWithRun,
  StepSchemaWithAction,
]);
