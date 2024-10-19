import type { FFrCliContext } from "../../types.ts";

export default async function main(ctx: FFrCliContext) {
  const { args, state } = ctx;
  const id = args._[1] ?? state.lastId;

  if (!id) {
    console.error("No ID provided and not run ids in state.");
    console.error("Please provide a run id");
    Deno.exit(1);
  }

  const { events, status } = await ctx.api(`/run/${id}/events`);

  if (status === "queued") {
    console.log("Run is still in the queue. Check back in a few seconds");
    Deno.exit(0);
  }

  for (const evt of events) {
    if (!evt.data.text) {
      continue;
    }
    console.log(evt.data.text);
  }
}
