// deno-lint-ignore-file no-namespace

import { z } from "./deps.ts";
import { type WorkflowSchema } from "./schema/workflow.ts";
import { type JobSchema } from "./schema/job.ts";
import {
  type ExecuteSchema,
  type ExecuteWithWorkflowFileSchema,
  type ExecuteWithWorkflowSchema,
  type LaunchSchema,
  type ServerSchema,
  type WorkerSchema,
} from "./schema/launch.ts";
import type * as step from "./schema/step.ts";
import type * as scalar from "./schema/scalar.ts";

// deno-lint-ignore no-explicit-any
export type Json = any;
export type JsonObject = Record<string, Json>;

export type Status =
  | "pending"
  | "running"
  | "complete"
  | "queued"
  | "unassigned";
export type Result = "none" | "success" | "failure" | "cancelled" | "skipped";

export interface RuntimeState {
  status: Status;
  result: Result;
  state: {
    [key: string]: Json;
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

  export type ReportState = {
    id: string;
    name: string;
    status: Status;
    result: Result;
    reason: string | null;
    timing: {
      start: number;
      end: number;
      elapsed: number;
    };
  };

  export type ReportStep = ReportState & {
    outputs: Record<string, Json>;
    stdout: string[];
    stderr: string[];
  };

  export type ReportJob = ReportState & {
    steps: Record<string, ReportStep>;
  };

  export type Report = ReportState & {
    tracking_id: string;
    jobs: Record<string, ReportJob>;
  };
}
export type LaunchExecuteWithFileOptions = z.infer<
  typeof ExecuteWithWorkflowFileSchema
>;
export type LaunchExecuteWithWorkflowOptions = z.infer<
  typeof ExecuteWithWorkflowSchema
>;

export type LaunchExecuteOptions = z.infer<typeof ExecuteSchema>;

export type LaunchWorkerOptions = z.infer<typeof WorkerSchema>;

export type LaunchServerOptions = z.infer<typeof ServerSchema>;

export type LaunchOptions = z.infer<typeof LaunchSchema>;

export type ReporterChangeData = {
  execution_id: string;
  tracking_id: string;
  job_id?: string;
  step_id?: string;
  status: Status;
  result: Result;
  reason?: string | null;
  text?: string;
  at: number;
};

export interface Reporter<Options extends JsonObject = JsonObject> {
  destroy(): Promise<void>;
  setOptions(options: Options): void;
  report(report: Workflow.Report): Promise<void>;
  change(type: string, data: ReporterChangeData): Promise<void>;
}

export interface ReporterConstructor {
  new (): Reporter;
}
