import type { FFrCliContext } from "../../types.ts";

type Response = {
  status: string;
  events: Array<{ id: string; data: { text: string } }>;
};

export default async function main(ctx: FFrCliContext) {
  const { args, storage } = ctx;
  const id = args._[1] ?? storage.lastId;

  if (!id) {
    console.error("No ID provided and not run ids in state.");
    console.error("Please provide a run id");
    Deno.exit(1);
  }

  let { events, status } = await ctx.api<Response>(`/run/${id}/events`);

  if (status === "queued") {
    console.log("Run is still in the queue. Check back in a few seconds");
    Deno.exit(0);
  }

  if (status === "running") {
    while (status === "running") {
      await new Promise((r) => setTimeout(r, 1000));
      const r = await ctx.api<Response>(`/run/${id}/events`);
      status = r.status;

      for (const evt of r.events) {
        if (!evt.data.text) {
          continue;
        }

        if (events.find((e) => e.id === evt.id)) {
          continue;
        }

        events.push(evt);
      }
    }
  }

  for (const evt of events) {
    if (!evt.data.text) {
      continue;
    }
    console.log(evt.data.text);
  }
}
