import { z } from "../deps.ts";

import {
  Description,
  Environment,
  Input,
  Label,
  Name,
  Permissions,
  When,
} from "./scalar.ts";

export const StepSchemaBase = z.object({
  name: Name.optional(),
  label: Label.optional(),
  description: Description.optional(),
  when: When.default("*").optional(),
  input: Input.optional(),
  env: Environment.optional(),
  permissions: Permissions.optional(),
  "run-in-stage": z.boolean().default(false).optional(),
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
