import type { FFrCliContext } from "../../types.ts";

type Result = {
  success: boolean;
  status: string;
  result: string;
  summary: string;
  short_summary: string;
  reason: string;
  started_at: string;
  ended_at: string;
};

export default async function main(ctx: FFrCliContext) {
  const { args, storage } = ctx;
  const id = args._[1] ?? storage.lastId;

  if (!id) {
    console.error("No ID provided and not run ids in state.");
    console.error("Please provide a run id");
    Deno.exit(1);
  }

  const r = await ctx.api<Result>(`/run/${id}`);

  [
    ["Status", r.status],
    ["Result", r.result],
    ["Started At", r.started_at],
    ["Ended At", r.ended_at],
    ["Summary", r.summary],
    ["Short Summary", r.short_summary],
    ["Reason", r.reason],
  ].forEach(([name, value]) => console.log(`${name}: ${value ?? "-"}`));
}
