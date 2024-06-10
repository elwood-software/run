// deno-lint-ignore-file no-namespace

import { z } from "./deps.ts";
import { type WorkflowSchema } from "./schema/workflow.ts";
import { type JobSchema } from "./schema/job.ts";
import type * as step from "./schema/step.ts";
import type * as scalar from "./schema/scalar.ts";

// deno-lint-ignore no-explicit-any
export type Json = any;
export type JsonObject = Record<string, Json>;

export type Status = "pending" | "running" | "complete";
export type Result = "none" | "success" | "failure" | "cancelled" | "skipped";

export interface State {
  status: Status;
  result: Result;
  state: {
    [key: string]: unknown;
    reason: string | null;
  };
}

export namespace Workflow {
  export type Configuration = z.infer<typeof WorkflowSchema>;

  export type Job = z.infer<typeof JobSchema>;
  export type Step = z.infer<typeof step.StepSchema>;
  export type StepBase = z.infer<typeof step.StepSchemaBase>;
  export type StepWithRun = z.infer<typeof step.StepSchemaWithRun>;
  export type StepSchemaWithAction = z.infer<typeof step.StepSchemaWithAction>;

  export type Environment = z.infer<typeof scalar.Environment>;
  export type Input = z.infer<typeof scalar.Input>;
  export type When = z.infer<typeof scalar.When>;
  export type Permissions = z.infer<typeof scalar.Permissions>;
}
