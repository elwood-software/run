import { Spinner } from "jsr:@std/cli@1.0.6/unstable-spinner";

import type { FFrCliContext } from "../../types.ts";

type Response = {
  status: string;
  result: string;
  events: Array<{ id: string; data: { text: string } }>;
};

export default async function main(ctx: FFrCliContext) {
  const { args, storage } = ctx;
  const id = args._[1] ?? storage.lastId;

  if (!id) {
    console.error("No ID provided and no execution ids in state.");
    console.error("Please provide an execution tracking id");
    Deno.exit(1);
  }

  let { events, status, result } = await ctx.api<Response>(`/run/${id}/events`);

  if (status === "queued") {
    console.log("Execution is still in the queue. Check back in a few seconds");
    Deno.exit(0);
  }

  const shouldWatch = status === "running" || status === "pending";

  if (!shouldWatch) {
    if (result === "failed") {
      console.error("%Execution failed", "color: red");
    }

    for (const evt of events) {
      if (!evt.data.text) {
        continue;
      }
      console.log(evt.data.text);
    }

    console.log(
      `%c${result === "success" ? "Execution succeeded" : "Execution failed"}`,
      `color: ${result === "success" ? "green" : "red"}`,
    );

    return;
  }

  const spin = new Spinner({
    message: "Waiting for execution worker initialization...",
  });

  if (status === "pending") {
    spin.start();
  }

  let lastStatus = status;

  while (status === "running" || status === "pending") {
    await new Promise((r) => setTimeout(r, 1000 * 10));

    const r = await ctx.api<Response>(`/run/${id}/events`);

    lastStatus = status;
    status = r.status;
    result = r.result;

    if (lastStatus === "pending" && status === "running") {
      spin.stop();
      console.log("Execution is now running...");
    }

    for (const evt of r.events) {
      if (!evt.data.text) {
        continue;
      }

      if (events.find((e) => e.id === evt.id) !== undefined) {
        continue;
      }

      console.log(evt.data.text);
    }
  }

  if (spin) {
    spin.stop();
  }

  if (status === "complete") {
    console.log("Execution Complete");
    console.log(
      `%c${result === "success" ? "Execution succeeded" : "Execution failed"}`,
      `color: ${result === "success" ? "green" : "red"}`,
    );
  }
}
