import type { Result, Status } from "./types.ts";

export const RunnerStatus = {
  Queued: "queued" as Status,
  Pending: "pending" as Status,
  Running: "running" as Status,
  Complete: "complete" as Status,
} as const;

export const RunnerResult = {
  None: "none" as Result,
  Success: "success" as Result,
  Failure: "failure" as Result,
  Cancelled: "cancelled" as Result,
  Skipped: "skipped" as Result,
} as const;

export enum EnvName {
  BootstrapFile = "ELWOOD_RUNNER_BOOTSTRAP_FILE",
}

export enum StateName {
  Input = "input",
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
  Bootstrap = "bootstrap",
  Worker = "worker",
  Serve = "serve",
}

export const LaunchModeNames = Object.values(LaunchMode);
