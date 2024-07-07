import type { Result, Status } from "./types.ts";

export const RunnerStatus = {
  Queued: "queued" as Status,
  Pending: "pending" as Status,
  Running: "running" as Status,
  Complete: "complete" as Status,
  Unassigned: "unassigned" as Status,
} as const;

export const RunnerResult = {
  None: "none" as Result,
  Success: "success" as Result,
  Failure: "failure" as Result,
  Cancelled: "cancelled" as Result,
  Skipped: "skipped" as Result,
} as const;

export enum EnvName {
  LaunchFile = "ELWOOD_RUN_LAUNCH_FILE",
  LaunchOverrideMode = "ELWOOD_RUN_MODE_OVERRIDE",
  StdActionPrefix = "ELWOOD_RUN_STD_ACTIONS_PREFIX",
}

export enum StateName {
  Variables = "vars",
  Outputs = "outputs",
  Timing = "timing",
  Env = "env",
  Stdout = "stdout",
  Stderr = "stderr",
}

export enum ReporterName {
  Console = "console",
  File = "file",
  Supabase = "supabase",
}

export enum LaunchMode {
  Execute = "execute",
  Worker = "worker",
  Serve = "serve",
}

export const LaunchModeNames = Object.values(LaunchMode);
