import { assertEquals } from "../src/deps.ts";
import { dockerRequest, setupDocker } from "./_helpers.ts";
import type { Workflow } from "../src/types.ts";
import { RunnerResult, RunnerStatus } from "../src/constants.ts";

Deno.test("e2e", async function (t) {
  const stop = await setupDocker();

  await t.step("list active jobs should be empty to start", async function () {
    const resp = await dockerRequest("GET", "");

    assertEquals(
      resp,
      { "status": "ok", executions: [] },
    );
  });

  await t.step("add a job", async function () {
    const resp = await dockerRequest<{ report: Workflow.Report }>("POST", "", {
      workflow: {
        name: "test",
        jobs: {
          "default": {
            steps: [
              { action: "echo", input: { content: "hello" } },
            ],
          },
        },
      } as Workflow.Configuration,
    });

    assertEquals(
      resp.report.status,
      RunnerStatus.Complete,
    );

    assertEquals(
      resp.report.result,
      RunnerResult.Success,
    );
  });

  await t.step("output", async function () {
    const resp = await dockerRequest<{ report: Workflow.Report }>("POST", "", {
      workflow: {
        name: "test",
        jobs: {
          "default": {
            steps: [
              { name: "result", run: `echo "hello=world" > $ELWOOD_OUTPUT` },
            ],
          },
        },
      } as Workflow.Configuration,
    });

    console.log(resp.report);

    assertEquals(
      resp.report.result,
      RunnerResult.Success,
    );

    assertEquals(
      resp.report.jobs.default?.steps.result?.outputs.hello,
      "world",
    );
  });

  await t.step("command", async function () {
    const resp = await dockerRequest<{ report: Workflow.Report }>("POST", "", {
      workflow: {
        name: "test",
        jobs: {
          "default": {
            steps: [
              {
                name: "result",
                action: "run",
                input: {
                  "bin": "deno",
                  "args": [
                    "run",
                    "--allow-env",
                    "--allow-run",
                    "--allow-read",
                    "--allow-write",
                    "--unstable",
                    "-",
                  ],
                },
              },
            ],
          },
        },
      } as Workflow.Configuration,
    });

    assertEquals(
      resp.report.result,
      RunnerResult.Success,
    );

    assertEquals(
      resp.report.jobs.default?.steps.result?.outputs.hello,
      "world",
    );
  });

  await stop();
});
