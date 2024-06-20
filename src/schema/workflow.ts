import { z } from "../deps.ts";
import { JobSchema } from "./job.ts";
import { Permissions, When } from "./scalar.ts";

export const WorkflowSchema = z.object({
  "$schema": z.string().default("https://x.elwood.run/schema@latest.json")
    .optional(),
  name: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  when: When.optional(),
  defaults: z.object({
    permissions: Permissions.optional(),
  }).optional(),
  jobs: z.record(
    z.string().regex(/[a-zA-Z-]+/, {
      message: "Job name must be a valid slug",
    }),
    JobSchema,
  ),
  metadata: z.record(z.string(), z.any()).optional(),
});
