import { parseArgs } from "jsr:@std/cli/parse-args";
import { main } from "../src/cli/ffr/main.ts";
import type { CliArgs } from "../src/types.ts";

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
  ["remote-url"]: remoteUrl,
  ...args
} = parseArgs(
  Deno.args,
  {
    string: ["cwd", "remote-url", "size"],
    alias: {
      h: "help",
    },
    boolean: ["verbose", "version", "help"],
    collect: ["include"],
  },
);

await main(VERSION, {
  ...(args as CliArgs),
  remoteUrl,
  raw: Deno.args,
});
