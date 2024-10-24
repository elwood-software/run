import { parseArgs } from "jsr:@std/cli/parse-args";

import { main } from "../src/cli/ffr/main.ts";

const {
  _,
  cwd,
  ["remote-url"]: remoteUrl,
  verbose,
} = parseArgs(
  Deno.args,
  {
    string: ["cwd", "remote-url"],
    alias: {
      r: "report",
      c: "cwd",
    },
    boolean: ["verbose"],
  },
);

await main({
  _,
  raw: Deno.args,
  cwd,
  verbose,
  remoteUrl,
});
