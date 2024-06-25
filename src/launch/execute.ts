import { Manager } from "../runtime/manager.ts";
import { assert } from "../deps.ts";
import type {
  JsonObject,
  LaunchExecuteOptions,
  LaunchExecuteWithFileOptions,
  LaunchExecuteWithWorkflowOptions,
  LaunchOptions,
} from "../types.ts";
import { loadWorkflowFile, verifyWorkflow } from "../libs/load-workflow.ts";
import { createReporter } from "../reporters/create.ts";
import { asError } from "../libs/utils.ts";

export async function launchExecute(options: LaunchOptions) {
  try {
    let possibleWorkflow: JsonObject | null = null;

    assert(options.execute, "No execute options provided");

    // load the workflow from the bootstrap file
    // don't need to verify yet, we'll do that later
    if (isWithWorkflow(options.execute)) {
      possibleWorkflow = options.execute.workflow;
    } else if (isWithWorkflowFile(options.execute)) {
      possibleWorkflow = await loadWorkflowFile(options.execute.workflowFile);
    }

    assert(possibleWorkflow, "No workflow found in bootstrap file");

    // create our manager from the environment
    const manager = await Manager.fromEnv({
      env: options.env?.set ?? {},
      passthroughEnv: options.env?.passthrough ?? [],
      loadEnv: options.env?.load ?? [],
    });

    // verify the workflow is correct
    const workflow = await verifyWorkflow(possibleWorkflow);

    // cleanup the workspace before if they asj
    if (options.cleanup == "before") {
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
        variables: options.execute.variables ?? {},
      });
    }

    // always cleanup the manager
    if (options.cleanup !== false && options.cleanup != "before") {
      await manager.cleanup();
    }

    // destroy the manager
    await manager.destroy();

    // exit with the appropriate code from the execution
    Deno.exit(0);
  } catch (error) {
    const error_ = asError(error);

    console.error(`Error running bootstrap: ${error_.message}`);
    Deno.exit(1);
  }
}

function isWithWorkflow(
  options: LaunchExecuteOptions,
): options is LaunchExecuteWithWorkflowOptions {
  return (options as LaunchExecuteWithWorkflowOptions).workflow !== undefined;
}

function isWithWorkflowFile(
  options: LaunchExecuteOptions,
): options is LaunchExecuteWithFileOptions {
  return (options as LaunchExecuteWithFileOptions).workflowFile !== undefined;
}
