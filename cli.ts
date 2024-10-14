import { parseArgs } from "jsr:@std/cli/parse-args";

import { main } from "./src/cli/main.ts";

const { _, cwd } = parseArgs(Deno.args, {
  alias: {
    d: "workspace-dir",
  },
});

await main({
  workflowFile: String(_[0]),
  cwd,
  workspaceDir: Deno.cwd(),
});
