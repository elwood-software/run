import { Manager } from "../runtime/manager.ts";
import type { JsonObject, LaunchOptions } from "../types.ts";
import { verifyWorkflow } from "../libs/load-workflow.ts";

export async function launchServe(options: LaunchOptions = {}) {
  // create our manager from the environment
  const manager = await Manager.fromEnv({
    env: options.env?.set,
    passthroughEnv: options.env?.passthrough,
    loadEnv: options.env?.load,
    requiredEnv: options.env?.required,
  });

  // prepare the manager
  await manager.prepare();

  // we need to abort the controller when
  // there is a SIGTERM or SIGINT from the OS or docker
  const abortController = new AbortController();

  // get the port and hostname from the environment
  // if not set, default to 8000 and all interfaces
  const port = Deno.env.get("ELWOOD_RUNNER_PORT") ?? Deno.env.get("PORT") ??
    "8000";
  const hostname = Deno.env.get("ELWOOD_RUNNER_HOST") ?? Deno.env.get("HOST") ??
    "0.0.0.0";

  // when the server is aborted, we want to let the manager clean up
  abortController.signal.addEventListener("abort", async () => {
    // await manager.cleanup();
  });

  // start the server
  Deno.serve(
    { port: Number(port), hostname, signal: abortController.signal },
    async (request) => {
      const url = new URL(request.url);
      const params = new URLSearchParams(url.search);

      if (request.method === "GET") {
        if (params.has("id")) {
          return _response({
            report: manager.executions.get(params.get("id")!)?.getReport(),
          });
        }

        return _response({
          status: "ok",
          executions: Array.from(manager.executions.values()).map((
            execution,
          ) => ({
            id: execution.id,
            status: execution.status,
            result: execution.result,
            reason: execution.state?.reason,
          })),
        });
      }

      if (request.method === "POST") {
        const { workflow, tracking_id } = await request.json();

        const x = await manager.executeWorkflow(
          await verifyWorkflow(workflow),
          {
            tracking_id,
          },
        );

        return _response({
          id: x.id,
          tracking_id: x.tracking_id,
          report: x.getReport(),
        });
      }

      return _response({ error: "Method not allowed" }, 405);
    },
  );

  Deno.addSignalListener("SIGTERM", () => {
    console.log("SIGTERM received, shutting down server");
    abortController.abort();
  });
  Deno.addSignalListener("SIGINT", () => {
    console.log("SIGINT received, shutting down server");
    abortController.abort();
  });
}

// simple function to encapsulate the response
function _response(data: JsonObject, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}
