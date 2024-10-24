import { parseArgs } from "jsr:@std/cli/parse-args";

import { main } from "../src/cli/main.ts";

const {
  _,
  cwd,
  ["workspace-dir"]: workspaceDir,
  ["remote-url"]: remoteUrl,
  verbose,
  report,
} = parseArgs(
  Deno.args,
  {
    string: ["workspace-dir", "cwd", "report", "remote-url"],
    alias: {
      d: "workspace-dir",
      r: "report",
      c: "cwd",
    },
    boolean: ["verbose"],
  },
);

await main({
  _,
  raw: Deno.args,
  workflowFile: String(_[0]),
  cwd,
  workspaceDir,
  verbose,
  reportFile: report,
  remoteUrl,
});
