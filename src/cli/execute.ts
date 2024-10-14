import { Manager } from "../runtime/manager.ts";
import { RunnerResult } from "../constants.ts";
import { isAbsolute, join, logger, toFileUrl } from "../deps.ts";
import { loadWorkflowFile, verifyWorkflow } from "../libs/load-workflow.ts";
import { createReporter } from "../reporters/create.ts";
import type { CliArgs } from "../types.ts";

export async function execute(args: CliArgs) {
  if (!args.workflowFile) {
    console.error("No workflow file provided");
    Deno.exit(1);
  }

  const {
    cleanup = "after",
    workspaceDir = Deno.makeTempDirSync(),
    cwd = Deno.cwd(),
    verbose = false,
  } = args;

  if (verbose) {
    logger.setup({
      handlers: {
        console: new logger.ConsoleHandler("DEBUG"),
      },

      loggers: {
        default: {
          level: "DEBUG",
          handlers: ["console"],
        },
        "elwood-runner": {
          level: "DEBUG",
          handlers: ["file", "console"],
        },
      },
    });
  }

  let workflowFile = args.workflowFile;

  if (!isAbsolute(workflowFile)) {
    workflowFile = join(cwd, workflowFile);
  }

  const env = {};
  const passthroughEnv: string[] = [];
  const loadEnv: string[] = [];
  const variables = {};

  // create our ma  nager from the environment
  const manager = new Manager({
    workspaceDir: isAbsolute(workspaceDir)
      ? workspaceDir
      : join(cwd, workspaceDir),
    denoBinPath: Deno.execPath(),
    stdActionsPrefix: "https://x.elwood.run/a",
    executionUid: Deno.uid() ?? 0,
    executionGid: Deno.gid() ?? 0,
    env,
    passthroughEnv,
    loadEnv,
  });

  // verify the workflow is correct
  const workflow = await verifyWorkflow(
    await loadWorkflowFile(toFileUrl(workflowFile)),
  );

  // cleanup the workspace before if they asj
  if (cleanup == "before") {
    await manager.cleanup();
  }

  await manager.addReporter(
    createReporter("console"),
  );

  if (args.reportFile) {
    await manager.addReporter(
      createReporter("file"),
      {
        path: isAbsolute(args.reportFile)
          ? args.reportFile
          : join(cwd, args.reportFile),
      },
    );
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
    // await manager.cleanup();
  }

  const execution = Array.from(manager.executions.values()).shift()!;

  Deno.exit(execution.result === RunnerResult.Success ? 0 : 1);
}
