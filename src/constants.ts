import type { Result, Status } from "./types.ts";

export const RunnerStatus: Record<string, Status> = {
  Pending: "pending",
  Running: "running",
  Complete: "complete",
} as const;

export const RunnerResult: Record<string, Result> = {
  None: "none",
  Success: "success",
  Failure: "failure",
  Cancelled: "cancelled",
  Skipped: "skipped",
} as const;

export enum EnvName {
  BootstrapFile = "ELWOOD_RUNNER_BOOTSTRAP_FILE",
}

export enum StateName {
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
