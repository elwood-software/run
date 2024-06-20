import { z } from "../deps.ts";

import { Name, When } from "./scalar.ts";
import { StepSchema } from "./step.ts";

export const JobSchema = z.object({
  name: Name.optional(),
  description: z.string().optional(),
  when: When.optional(),
  steps: z.array(StepSchema).min(1),
});
