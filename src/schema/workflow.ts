import { z } from "../deps.ts";
import { JobSchema } from "./job.ts";

export const WorkflowSchema = z.object({
  name: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  jobs: z.record(
    z.string().regex(/[a-zA-Z-]+/, {
      message: "Job name must be a valid slug",
    }),
    JobSchema,
  ),
});
