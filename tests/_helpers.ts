import { join } from "../src/deps.ts";
import type { JsonObject } from "../src/types.ts";

export async function _executeDocker(
  args: string[],
): Promise<number> {
  const cmd = new Deno.Command("docker", {
    args,
    cwd: join(import.meta.dirname!, ".."),
    stderr: "null",
    stdout: "null",
  });

  const { code } = await cmd.output();
  return code;
}

export type StopDockerFn = () => Promise<void>;

export async function setupDocker(): Promise<StopDockerFn> {
  const tagName = `elwood-runner-test-${crypto.randomUUID()}`;
  const runName = `elwood-runner-test-${crypto.randomUUID()}`;

  await _executeDocker([
    "build",
    "-t",
    tagName,
    ".",
  ]);

  await _executeDocker([
    "run",
    "--name",
    runName,
    "-p",
    "8000:8000",
    "-d",
    "-e",
    "ELWOOD_RUNNER_STD_ACTIONS_PREFIX=file:///elwood/run/actions",
    tagName,
  ]);

  let stop = false;
  let i = 0;

  while (stop === false && i < 10) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      await dockerRequest("GET", "");
      stop = true;
    } catch (_) {
      // ignore
    }

    i++;
  }

  return async function unload() {
    await _executeDocker([
      "stop",
      runName,
    ]);
    // await _executeDocker([
    //   "rm",
    //   runName,
    // ]);
    // await _executeDocker([
    //   "rmi",
    //   tagName,
    // ]);
  };
}

export async function dockerRequest<R = JsonObject>(
  method: string,
  url: string,
  body?: JsonObject,
): Promise<R> {
  const response = await fetch(`http://0.0.0.0:8000/${url}`, {
    method,
    headers: {
      "content-type": "application/json",
    },
    body: method !== "GET" && body ? JSON.stringify(body) : undefined,
  });

  return await response.json() as R;
}
