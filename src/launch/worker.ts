import { Manager } from "../runtime/manager.ts";
import { assert, parseYaml, supabase } from "../deps.ts";
import { createReporter } from "../reporters/create.ts";
import { RunnerResult, RunnerStatus } from "../constants.ts";
import type { JsonObject, LaunchOptions, Result, Workflow } from "../types.ts";
import { verifyWorkflow } from "../libs/load-workflow.ts";
import { asError } from "../libs/utils.ts";
import {
  evaluateAndNormalizeExpression,
  evaluateExpression,
  isExpressionResultTruthy,
} from "../libs/expression/expression.ts";
import { LaunchWorkerOptions } from "../types.ts";

type PossibleConfigurationFormat = {
  format: "yaml";
  content: string;
};
type PossibleConfiguration =
  | Workflow.Configuration
  | PossibleConfigurationFormat;

type SupabaseWorkerOptions = {
  url?: string;
  anon_key?: string;
  service_key?: string;
};

type RunData = {
  id: number;
  configuration: PossibleConfiguration;
  tracking_id: string;
  variables: JsonObject;
};

export async function launchWorker(
  options: LaunchOptions,
) {
  assert(
    options.worker,
    "Worker is not defined",
  );

  const manager = await Manager.fromEnv({
    env: options.env?.set ?? {},
    passthroughEnv: options.env?.passthrough ?? [],
    loadEnv: options.env?.load ?? [],
  });
  const abortController = new AbortController();
  const tickInterval = options.worker["interval-seconds"] ?? 1000;
  const exitAfterExpressions = options.worker["exit-after"] ?? "false";

  const { url, anon_key: anonKey, service_key: serviceKey } =
    await evaluateExpression<SupabaseWorkerOptions>(
      options.worker.source.options ?? {},
      {
        env: Object.fromEntries(manager.env),
      },
    );

  assert(url, "Supabase URL is required for Worker");
  assert(anonKey, "Supabase anon key is required for Worker");
  assert(serviceKey, "Supabase service key is required for Worker");

  const client = supabase.createClient(url, anonKey, {
    db: {
      schema: "public",
    },
    global: {
      headers: {
        apikey: anonKey,
        authorization: `Bearer ${serviceKey}`,
      },
    },
  });

  if (Array.isArray(options.reporters)) {
    for (const reporter of options.reporters) {
      await manager.addReporter(
        createReporter(reporter.name),
        reporter.options ?? {},
      );
    }
  }

  await manager.prepare();

  let lock = false;
  let numberOfRuns = 0;
  let lastResult: Result | null = null;

  manager.logger.info(
    `Worker started with lock at ${lock} and tick interval at ${tickInterval} seconds`,
  );

  // internal tick function run every interval
  // we define it here so we can execute it right away
  async function tick_(): Promise<void> {
    if (lock) {
      return;
    }

    manager.logger.info("Checking for runs");
    lock = true;

    try {
      const data = await selectRunForSelector(
        client,
        options.worker?.selector,
      );

      if (!data) {
        manager.logger.info("No queued runs found");
        return;
      }

      numberOfRuns++;

      lastResult = await executeRun(manager, client, data);
    } catch (err) {
      manager.logger.error(`Error ${asError(err).message} processing`);
    } finally {
      // Check if we should exit after processing all runs
      // the expression should return a boolean and if true
      // we abort
      const shouldExit = isExpressionResultTruthy(
        await evaluateAndNormalizeExpression(
          exitAfterExpressions,
          {
            runs: numberOfRuns,
            lastResult,
          },
        ),
      );

      // if we should exit
      if (shouldExit) {
        manager.logger.info("Exiting after processing all runs");
        abortController.abort("exit when is true");
      }

      lock = false;
    }
  }

  // setup the ticker to run on interval seconds
  const ticker = setInterval(tick_, tickInterval * 1000);

  // when the abort signal is received, we cleanup and destroy the manager
  abortController.signal.addEventListener("abort", async () => {
    manager.logger.info("Abort signal received, shutting down server");
    manager.logger.info(`Reason for abort: ${abortController.signal.reason}`);

    await manager.cleanup();
    await manager.destroy();

    clearInterval(ticker);
    Deno.exit(0);
  });

  Deno.addSignalListener("SIGTERM", () => {
    manager.logger.info("SIGTERM received, shutting down server");
    abortController.abort("SIGTERM received");
  });
  Deno.addSignalListener("SIGINT", () => {
    manager.logger.info("SIGINT received, shutting down server");
    abortController.abort("SIGINT received");
  });

  // first tick right away
  await tick_();
}

/**
 * Execute a run when one is found
 * @param manager
 * @param client
 * @param data
 * @returns
 */
export async function executeRun(
  manager: Manager,
  client: supabase.SupabaseClient,
  data: RunData,
): Promise<Result> {
  manager.logger.info(`Run data`, data);

  const { id, configuration, tracking_id } = data as RunData;
  let unverifiedConfiguration: JsonObject = {};

  manager.logger.info(`Processing run ${id}`);

  if ((configuration as PossibleConfigurationFormat).format === "yaml") {
    const yaml = (configuration as PossibleConfigurationFormat).content;
    unverifiedConfiguration = await parseYaml(yaml) as JsonObject;
  } else {
    unverifiedConfiguration = configuration;
  }

  manager.logger.info(`Verifying run ${id} ${tracking_id}`);

  try {
    await client.from("elwood_run").update({
      status: RunnerStatus.Running,
      started_at: new Date(),
    }).eq("id", id);

    const execution = await manager.executeWorkflow(
      await verifyWorkflow(unverifiedConfiguration),
      {
        tracking_id,
        variables: data.variables ?? {},
      },
    );

    await client.from("elwood_run").update({
      status: execution.status,
      result: execution.result,
      report: execution.getReport(),
      ended_at: new Date(),
    }).eq("id", id);

    return execution.result;
  } catch (err) {
    manager.logger.error(`Error ${asError(err).message} processing`);

    await client.from("elwood_run").update({
      status: RunnerStatus.Complete,
      result: RunnerResult.Failure,
      ended_at: new Date(),
      report: {
        reason: asError(err).message,
        result: RunnerResult.Failure,
        status: RunnerStatus.Complete,
        tracking_id,
      },
    }).eq("id", id);

    return RunnerResult.Failure;
  }
}

/**
 * Select a run from the database based on
 * the provided selector
 * @param client
 * @param selector
 * @returns
 */
async function selectRunForSelector(
  client: supabase.SupabaseClient,
  selector: LaunchWorkerOptions["selector"],
): Promise<RunData | undefined> {
  const q = client.from("elwood_run")
    .select("id,configuration,tracking_id,variables")
    .eq(
      "status",
      RunnerStatus.Pending,
    );

  if (selector?.tracking_id) {
    q.eq("tracking_id", selector.tracking_id);
  }

  const { data, error } = await q.limit(1).maybeSingle();

  if (error) {
    throw error;
  }

  return data as RunData | undefined;
}
