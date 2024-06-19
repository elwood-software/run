import { Manager } from "../runtime/manager.ts";
import { EnvName } from "../constants.ts";
import { assert, parseYaml } from "../deps.ts";
import type {
  BootstrapOptions,
  BootstrapWithFileOptions,
  BootstrapWithWorkflowOptions,
  JsonObject,
} from "../types.ts";
import { loadWorkflowFile, verifyWorkflow } from "../libs/load-workflow.ts";
import { BootstrapSchema } from "../schema/bootstrap.ts";
import { createReporter } from "../reporters/create.ts";
import { asError } from "../libs/utils.ts";

export async function launchBootstrap() {
  try {
    const bootstrapFile = Deno.env.get(EnvName.BootstrapFile);

    assert(bootstrapFile, `Bootstrap file ${EnvName.BootstrapFile} not set`);
    assert(
      Deno.statSync(bootstrapFile)?.isFile,
      `Bootstrap file at "${bootstrapFile}" does not exist`,
    );

    const bootstrap = await BootstrapSchema.parseAsync(parseYaml(
      await Deno.readTextFile(bootstrapFile),
    ));

    let possibleWorkflow: JsonObject | null = null;

    // load the workflow from the bootstrap file
    // don't need to verify yet, we'll do that later
    if (isBootstrapWithWorkflow(bootstrap)) {
      possibleWorkflow = bootstrap.workflow;
    } else if (isBootstrapWithWorkflowFile(bootstrap)) {
      possibleWorkflow = await loadWorkflowFile(bootstrap.workflowFile);
    }

    assert(possibleWorkflow, "No workflow found in bootstrap file");

    // create our manager from the environment
    const manager = await Manager.fromEnv({
      env: bootstrap.env?.set ?? {},
      passthroughEnv: bootstrap.env?.passthrough ?? [],
      loadEnv: bootstrap.env?.load ?? [],
    });

    manager.logger.info(`Bootstrapping from: ${bootstrapFile}`);

    // verify the workflow is correct
    const workflow = await verifyWorkflow(possibleWorkflow);

    // cleanup the workspace before if they asj
    if (bootstrap.cleanup == "before") {
      await manager.cleanup();
    }

    if (Array.isArray(bootstrap.reporters)) {
      for (const reporter of bootstrap.reporters) {
        await manager.addReporter(
          createReporter(reporter.name),
          reporter.options ?? {},
        );
      }
    }

    await manager.prepare();

    const workflows_ = Array.isArray(workflow) ? workflow : [workflow];

    for (const workflow of workflows_) {
      await manager.executeWorkflow(workflow);
    }

    // always cleanup the manager
    if (bootstrap.cleanup !== false && bootstrap.cleanup != "before") {
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

function isBootstrapWithWorkflow(
  options: BootstrapOptions,
): options is BootstrapWithWorkflowOptions {
  return (options as BootstrapWithWorkflowOptions).workflow !== undefined;
}

function isBootstrapWithWorkflowFile(
  options: BootstrapOptions,
): options is BootstrapWithFileOptions {
  return (options as BootstrapWithFileOptions).workflowFile !== undefined;
}
