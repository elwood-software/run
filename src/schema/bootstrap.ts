import { z } from "../deps.ts";
import { WorkflowSchema } from "./workflow.ts";

export const BootstrapBaseSchema = z.object({
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
});

export const BootstrapWithWorkflowSchema = z.object({
  workflow: WorkflowSchema,
}).and(BootstrapBaseSchema);

export const BootstrapWithWorkflowFileSchema = z.object({
  workflowFile: z.string(),
}).and(BootstrapBaseSchema);

export const BootstrapSchema = z.union([
  BootstrapWithWorkflowFileSchema,
  BootstrapWithWorkflowSchema,
]);
