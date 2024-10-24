import { parseArgs } from "jsr:@std/cli/parse-args";
import { main } from "../src/cli/ffr/main.ts";

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
  ["remote-url"]: remoteUrl,
  verbose,
  version,
} = parseArgs(
  Deno.args,
  {
    string: ["cwd", "remote-url"],
    alias: {
      r: "report",
      c: "cwd",
    },
    boolean: ["verbose", "version"],
  },
);

await main(VERSION, {
  _,
  raw: Deno.args,
  cwd,
  verbose,
  version,
  remoteUrl,
});
