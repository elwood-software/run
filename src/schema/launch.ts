import { z } from "../deps.ts";
import { WorkflowSchema } from "./workflow.ts";

// WORKER
export const WorkerSchema = z.object({
  intervalSeconds: z.number().default(60).optional(),
  source: z.object({
    name: z.string(),
    options: z.record(z.any()).default({}).optional(),
  }),
});

// BOOTSTRAP
export const ExecuteWithWorkflowSchema = z.object({
  workflow: WorkflowSchema,
});

export const ExecuteWithWorkflowFileSchema = z.object({
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
  }).default({}).optional(),
  execute: ExecuteSchema.optional(),
  worker: WorkerSchema.optional(),
  server: ServerSchema.optional(),
});
