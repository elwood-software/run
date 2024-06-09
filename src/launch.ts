import { assert, join } from "./deps.ts";

import { Manager } from "./runtime/manager.ts";
import type { RunnerDefinition } from "./types.ts";

const instructions: RunnerDefinition.Normalized = {
  name: "default",
  jobs: [
    {
      id: "job-1",
      name: "default",
      steps: [
        {
          id: "xx",
          name: "xx",
          action: "run",
          if: "true",
          with: {
            script: "echo 'hello=world' > $ELWOOD_OUTPUT",
          },
          permissions: {
            env: [],
            read: [],
            write: [],
            run: ["bash"],
            net: false,
          },
        },
        // {
        //   id: "x",
        //   name: "install-ffmpeg",
        //   action: "install/ffmpeg",
        //   with: {},
        //   permissions: {
        //     env: [],
        //     read: [],
        //     write: [],
        //     run: ["tar"],
        //     net: true,
        //   },
        // },

        // {
        //   id: "step-1",
        //   name: "copy",
        //   action: "bin://ffmpeg",
        //   with: {
        //     args: ["-version"],
        //   },
        //   permissions: {
        //     env: [],
        //     read: ["/tmp"],
        //     write: [],
        //     run: [],
        //     net: false,
        //   },
        // },
      ],
    },
  ],
};

if (import.meta.main) {
  main();
}

async function main() {
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
  const execution = await manager.executeDefinition(instructions);

  console.log(JSON.stringify(execution.getCombinedState(), null, 2));
}
