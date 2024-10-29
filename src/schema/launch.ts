// deno-lint-ignore-file

import { z } from "../deps.ts";
import { WorkflowSchema } from "./workflow.ts";

// WORKER
export const WorkerSchema = z.object({
  "interval-seconds": z.number().default(60).optional(),
  source: z.object({
    name: z.string(),
    options: z.record(z.any()).default({}).optional(),
  }),
  selector: z.record(z.any()).default({}).optional(),
  "exit-after": z.string().nullable().default(null).optional(),
});

// BOOTSTRAP
export const ExecuteWithWorkflowSchema = z.object({
  variables: z.record(z.any()).default({}).optional(),
  workflow: WorkflowSchema,
});

export const ExecuteWithWorkflowFileSchema = z.object({
  variables: z.record(z.any()).default({}).optional(),
  workflowFile: z.string(),
});

export const ExecuteSchema = z.union([
  ExecuteWithWorkflowFileSchema,
  ExecuteWithWorkflowSchema,
]);

// SERVER
export const ServerSchema = z.object({
  port: z.number().default(8080).optional(),
});

export const LaunchSchema = z.object({
  cleanup: z.enum(["before", "after", "both"]).or(z.boolean()).default("after")
    .optional(),
  reporters: z.array(z.object({
    name: z.string(),
    options: z.record(z.any()).default({}).optional(),
  })).default([]).optional(),
  env: z.object({
    set: z.record(z.string()).default({}).optional(),
    load: z.array(z.string()).default([]).optional(),
    passthrough: z.array(z.string()).default([]).optional(),
    required: z.array(z.string()).default([]).optional(),
    remove: z.array(z.string()).default([]).optional(),
  }).default({}).optional(),
  execute: ExecuteSchema.optional(),
  worker: WorkerSchema.optional(),
  server: ServerSchema.optional(),
});
