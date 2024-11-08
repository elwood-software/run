import { parseArgs } from "jsr:@std/cli/parse-args";

import { main } from "../src/cli/run/main.ts";

let VERSION = "0.0.0";

try {
  const versionFile = "./version.ts";
  const v = await import(versionFile) as {
    default: {
      version: string;
    };
  };
  VERSION = v.default.version;
} catch (_) {
  // do nothing and assume we're not in the compiled version
}

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

await main(VERSION, {
  _,
  raw: Deno.args,
  workflowFile: String(_[0]),
  cwd,
  workspaceDir,
  verbose,
  reportFile: report,
  remoteUrl,
  include: [],
});
