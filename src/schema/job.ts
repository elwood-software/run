// deno-lint-ignore-file

import { z } from "../deps.ts";

import { Description, Label, Name, When } from "./scalar.ts";
import { StepSchema } from "./step.ts";

export const JobSchema = z.object({
  name: Name.optional(),
  label: Label.optional(),
  description: Description.optional(),
  when: When.optional(),
  steps: z.array(StepSchema).min(1),
});
