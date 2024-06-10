import { assert, join } from "./deps.ts";

import { Manager } from "./runtime/manager.ts";

import { loadAndVerifyWorkflow } from "./libs/load-workflow.ts";
import { Workflow } from "./types.ts";

if (import.meta.main) {
  // see if there's a workflow file
  const workflowFile = Deno.env.get("ELWOOD_WORKFLOW") ??
    "/elwood/runner/workflows/hello-world.yml";

  assert(
    Deno.statSync(workflowFile)?.isFile,
    `Workflow file "${workflowFile}" does not exist`,
  );

  await launch(
    await loadAndVerifyWorkflow(workflowFile),
  );
}

export async function launch(
  workflowConfiguration: Workflow.Configuration,
) {
  const workspaceDir = Deno.env.get("ELWOOD_RUNNER_WORKSPACE_DIR");
  const executionUid = Deno.env.get("ELWOOD_RUNNER_EXECUTION_UID");
  const executionGid = Deno.env.get("ELWOOD_RUNNER_EXECUTION_GID");

  assert(workspaceDir, "ELWOOD_RUNNER_WORKSPACE_DIR not set");
  assert(
    Deno.statSync(workspaceDir)?.isDirectory,
    "Workspace dir does not exist",
  );
  assert(executionUid, "ELWOOD_RUNNER_EXECUTION_UID not set");
  assert(executionGid, "ELWOOD_RUNNER_EXECUTION_GID not set");

  const manager = new Manager({
    workspaceDir,
    stdActionsPrefix: "file:///elwood/runner/actions",
    executionGid: Number(executionGid),
    executionUid: Number(executionUid),
  });

  // we're going to cleanup any previous executions
  for await (const entry of Deno.readDir(workspaceDir)) {
    if (entry.isDirectory) {
      await Deno.remove(join(workspaceDir, entry.name), { recursive: true });
    }
  }

  await manager.prepare();
  const execution = await manager.executeDefinition(workflowConfiguration);
  console.log(JSON.stringify(execution.getCombinedState(), null, 2));
}
