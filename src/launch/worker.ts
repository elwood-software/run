import { Manager } from "../runtime/manager.ts";
import { assert, parseYaml, supabase } from "../deps.ts";
import { createReporter } from "../reporters/create.ts";
import { SupabaseReporterOptions } from "../reporters/supabase.ts";
import { RunnerResult, RunnerStatus } from "../constants.ts";
import type { JsonObject, LaunchOptions, Workflow } from "../types.ts";
import { verifyWorkflow } from "../libs/load-workflow.ts";
import { asError } from "../libs/utils.ts";
import { evaluateExpression } from "../libs/expression/expression.ts";

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
  const tickInterval = options.worker.intervalSeconds ?? 1000;

  const { url, anon_key: anonKey, service_key: serviceKey } =
    await evaluateExpression<SupabaseWorkerOptions>(
      options.worker.source.options ?? {},
      {
        env: Object.fromEntries(manager.env),
      },
    );

  assert(url, "Supabase URL is required");
  assert(anonKey, "Supabase anon key is required");
  assert(serviceKey, "Supabase service key is required");

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

  await manager.addReporter<SupabaseReporterOptions>(
    createReporter("supabase"),
    {
      url,
      anon_key: anonKey,
      service_key: serviceKey,
    },
  );

  await manager.prepare();

  let lock = false;

  manager.logger.info("Worker started");

  const ticker = setInterval(async () => {
    if (lock) {
      return;
    }

    lock = true;

    try {
      const result = await client.from("run")
        .select("id,configuration,tracking_id")
        .eq(
          "status",
          RunnerStatus.Queued,
        )
        .limit(1).maybeSingle();

      if (!result.data) {
        manager.logger.info("No queued runs found");
        return;
      }

      const { id, configuration, tracking_id } = result.data as {
        id: number;
        tracking_id: string;
        configuration: PossibleConfiguration;
      };
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
        await client.from("run").update({
          status: RunnerStatus.Running,
          started_at: new Date(),
        }).eq("id", id);

        const execution = await manager.executeWorkflow(
          await verifyWorkflow(unverifiedConfiguration),
          {
            tracking_id,
          },
        );

        await client.from("run").update({
          status: execution.status,
          result: execution.result,
          ended_at: new Date(),
        }).eq("id", id);
      } catch (err) {
        manager.logger.error(`Error ${asError(err).message} processing`);

        await client.from("run").update({
          status: RunnerStatus.Complete,
          result: RunnerResult.Failure,
          ended_at: new Date(),
          report: {
            reason: err.message,
            result: RunnerResult.Failure,
            status: RunnerStatus.Complete,
            tracking_id,
          },
        }).eq("id", id);
      }
    } catch (err) {
      manager.logger.error(`Error ${asError(err).message} processing`);
    } finally {
      lock = false;
    }
  }, tickInterval * 1000);

  abortController.signal.addEventListener("abort", async () => {
    manager.logger.info("Abort signal received, shutting down server");

    await manager.cleanup();
    await manager.destroy();

    clearInterval(ticker);
    Deno.exit(0);
  });

  Deno.addSignalListener("SIGTERM", () => {
    manager.logger.info("SIGTERM received, shutting down server");
    abortController.abort();
  });
  Deno.addSignalListener("SIGINT", () => {
    manager.logger.info("SIGINT received, shutting down server");
    abortController.abort();
  });
}
