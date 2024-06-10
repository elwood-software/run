import { z } from "../deps.ts";

import { When } from "./scalar.ts";
import { StepSchema } from "./step.ts";

export const JobSchema = z.object({
  label: z.string().optional(),
  description: z.string().optional(),
  when: When.optional(),
  steps: z.array(StepSchema).min(1),
});
