import type { FFrCliContext } from "../../types.ts";

export default async function main(ctx: FFrCliContext) {
  const { args, storage } = ctx;
  const id = args._[1] ?? storage.lastId;

  if (!id) {
    console.error("No ID provided and not run ids in state.");
    console.error("Please provide a run id");
    Deno.exit(1);
  }

  await Promise.resolve();
}
