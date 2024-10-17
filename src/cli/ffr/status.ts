import type { FFrArgs } from "../../types.ts";

export default async function main(args: FFrArgs) {
  const id = args._[1] ?? args.state.lastId;

  if (!id) {
    console.error("No ID provided and not run ids in state.");
    console.error("Please provide a run id");
    Deno.exit(1);
  }
}
