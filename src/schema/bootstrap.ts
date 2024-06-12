import { z } from "../deps.ts";
import { WorkflowSchema } from "./workflow.ts";

export const BootstrapBaseSchema = z.object({
  cleanup: z.enum(["before", "after", "both"]).default("after").optional(),
});

export const BootstrapWithWorkflowSchema = z.object({
  workflow: WorkflowSchema,
}).and(BootstrapBaseSchema);

export const BootstrapWithWorkflowFile = z.object({
  workflowFile: z.string(),
}).and(BootstrapBaseSchema);

export const BootstrapSchema = z.union([
  BootstrapWithWorkflowFile,
  BootstrapWithWorkflowSchema,
]);
