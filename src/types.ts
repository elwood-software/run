// deno-lint-ignore-file no-namespace

// deno-lint-ignore no-explicit-any
export type Json = any;
export type JsonObject = Record<string, Json>;

export namespace RunnerDefinition {
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

  export interface Normalized {
    name: string;
    jobs: Job[];
  }

  export interface Job {
    id: string;
    name: string;
    steps: Step[];
  }

  export interface Step {
    id: string;
    name: string;
    action: string;
    if: string;
    with: Record<
      string,
      string | string[] | number | number[] | Record<string, unknown>
    >;
    permissions: StepPermission;
  }

  export interface StepPermission {
    env: string[] | boolean;
    read: string[] | boolean;
    write: string[] | boolean;
    net: string[] | boolean;
    run: string[] | boolean;
  }
}
