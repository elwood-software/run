import { Manager } from "../runtime/manager.ts";
import { EnvName, RunnerResult } from "../constants.ts";
import {
  assert,
  dirname,
  dotenv,
  isAbsolute,
  join,
  parseYaml,
} from "../deps.ts";
import type {
  BootstrapOptions,
  BootstrapWithFileOptions,
  BootstrapWithWorkflowOptions,
  JsonObject,
} from "../types.ts";
import { loadWorkflowFile, verifyWorkflow } from "../libs/load-workflow.ts";
import { BootstrapSchema } from "../schema/bootstrap.ts";
import { createReporter } from "../reporters/create.ts";

export async function bootstrap(manager: Manager) {
  try {
    const bootstrapFile = Deno.env.get(EnvName.BootstrapFile);

    assert(bootstrapFile, `Bootstrap file ${EnvName.BootstrapFile} not set`);
    assert(
      Deno.statSync(bootstrapFile)?.isFile,
      `Bootstrap file at "${bootstrapFile}" does not exist`,
    );

    manager.logger.info(`Bootstrapping from: ${bootstrapFile}`);

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

    // verify the workflow is correct
    const workflow = await verifyWorkflow(possibleWorkflow);

    // cleanup the workspace before if they asj
    if (bootstrap.cleanup == "before") {
      await manager.cleanup();
    }

    const setEnv = bootstrap.env?.set ?? {};
    const passthroughEnv = bootstrap.env?.passthrough ?? [];
    const envFiles = bootstrap.env?.load ?? [];
    const requiredEnv = bootstrap.env?.required ?? [];

    Object.entries(setEnv).forEach(([key, value]) => {
      manager.env.set(key, value);
    });

    let possibleEnvValues: Record<string, string> = {};

    for (const file of envFiles) {
      const file_ = isAbsolute(file)
        ? file
        : join(dirname(bootstrapFile), file);

      possibleEnvValues = {
        ...possibleEnvValues,
        ...dotenv.parse(await Deno.readTextFile(file_)),
      };
    }

    passthroughEnv.forEach((key) => {
      if (possibleEnvValues[key] !== undefined) {
        manager.env.set(key, possibleEnvValues[key]);
      } else if (Deno.env.has(key)) {
        manager.env.set(key, Deno.env.get(key)!);
      }
    });

    const missingEnv = requiredEnv.filter((key) => {
      return manager.env.get(key) === undefined;
    });

    assert(
      missingEnv.length === 0,
      `Missing env variables ${missingEnv.join(", ")}`,
    );

    if (Array.isArray(bootstrap.reporters)) {
      for (const reporter of bootstrap.reporters) {
        manager.addReporter(
          createReporter(reporter.name, reporter.options ?? {}),
        );
      }
    }

    await manager.prepare();

    const exec = await manager.executeWorkflow(workflow);

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
  } catch (error) {
    console.error(`Error running bootstrap: ${error.message}`);
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
