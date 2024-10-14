import { Manager } from "../runtime/manager.ts";
import type { LaunchExecuteWithFileOptions, LaunchOptions } from "../types.ts";
import { RunnerResult } from "../constants.ts";
import { isAbsolute, join } from "../deps.ts";
import { loadWorkflowFile, verifyWorkflow } from "../libs/load-workflow.ts";

export type MainArgs = {
  workflowFile: string;
  cwd?: string;
  workspaceDir: string;
  cleanup?: "before" | "after";
};

export async function main(args: MainArgs) {
  if (!args.workflowFile) {
    console.error("No workflow file provided");
    Deno.exit(1);
  }

  const { cleanup = "after" } = args;
  const cwd = args.cwd ?? Deno.cwd();
  let workflowFile = args.workflowFile;

  if (!isAbsolute(workflowFile)) {
    workflowFile = join(cwd, workflowFile);
  }

  const env = {};
  const passthroughEnv: string[] = [];
  const loadEnv: string[] = [];
  const variables = {};

  // create our manager from the environment
  const manager = new Manager({
    workspaceDir: "",
    stdActionsPrefix: "https://x.elwood.run/a",
    executionUid: Deno.uid() ?? 0,
    executionGid: Deno.gid() ?? 0,
    env,
    passthroughEnv,
    loadEnv,
  });

  // verify the workflow is correct
  const workflow = await verifyWorkflow(await loadWorkflowFile(workflowFile));

  // cleanup the workspace before if they asj
  if (cleanup == "before") {
    await manager.cleanup();
  }

  if (Array.isArray(options.reporters)) {
    for (const reporter of options.reporters) {
      await manager.addReporter(
        createReporter(reporter.name),
        reporter.options ?? {},
      );
    }
  }

  await manager.prepare();

  const workflows_ = Array.isArray(workflow) ? workflow : [workflow];

  for (const workflow of workflows_) {
    await manager.executeWorkflow(workflow, {
      variables: variables ?? {},
    });
  }

  // always cleanup the manager
  if (cleanup != "before") {
    await manager.cleanup();
  }

  const execution = Array.from(manager.executions.values()).shift()!;

  Deno.exit(execution.result === RunnerResult.Success ? 0 : 1);
}
