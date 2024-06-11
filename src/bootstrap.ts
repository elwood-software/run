import { Manager } from "./runtime/manager.ts";
import { EnvName, RunnerResult } from "./constants.ts";
import { assert, parseYaml } from "./deps.ts";
import { BootstrapOptions, JsonObject } from "./types.ts";
import { loadWorkflowFile, verifyWorkflow } from "./libs/load-workflow.ts";

export async function bootstrap(manager: Manager) {
  const bootstrapFile = Deno.env.get(EnvName.BootstrapFile);

  assert(bootstrapFile, `Bootstrap file ${EnvName.BootstrapFile} not set`);
  assert(
    Deno.statSync(bootstrapFile)?.isFile,
    `Bootstrap file at "${bootstrapFile}" does not exist`,
  );

  manager.logger.info(`Bootstrapping from: ${bootstrapFile}`);

  const bootstrap = parseYaml(
    await Deno.readTextFile(bootstrapFile),
  ) as BootstrapOptions;

  let possibleWorkflow: JsonObject | null = null;

  // load the workflow from the bootstrap file
  // don't need to verify yet, we'll do that later
  if (bootstrap.workflow) {
    possibleWorkflow = bootstrap.workflow;
  } else if (bootstrap.workflowUrl) {
    possibleWorkflow = await loadWorkflowFile(bootstrap.workflowUrl);
  }

  assert(possibleWorkflow, "No workflow found in bootstrap file");

  if (bootstrap.cleanup == "before") {
    console.log("CLEANUP");

    await manager.cleanup();
  }

  await manager.prepare();

  const workflow = await verifyWorkflow(possibleWorkflow);
  const exec = await manager.executeDefinition(workflow);

  // print the report to stdout
  Deno.stdout.write(
    new TextEncoder().encode(`report:=${JSON.stringify(exec.getReport())}`),
  );

  // always cleanup the manager
  if (bootstrap.cleanup !== false && bootstrap.cleanup != "before") {
    await manager.cleanup();
  }

  // exit with the appropriate code from the execution
  Deno.exit(exec.result === RunnerResult.Success ? 0 : 1);
}
