import { open as openUrl } from "https://deno.land/x/open@v0.0.6/index.ts";
import type {
  CliArgs,
  FFrArgs,
  FFrCliContext,
  JsonObject,
} from "../../types.ts";
import { dotenv, isAbsolute, join } from "../../deps.ts";

import { state } from "../libs/state.ts";
import { printError } from "../libs/error.ts";

import execute from "./execute.ts";
import get from "./get.ts";
import status from "./status.ts";
import watch from "./watch.ts";
import auth from "./auth.ts";
import list from "./list.ts";
import upgrade from "./upgrade.ts";

export async function main(compiledVersion: string, args: FFrArgs) {
  if (args.version || args.raw[0] === "-v") {
    console.log(`ffremote ${compiledVersion}`);
    Deno.exit(0);
  }

  if (
    args.raw.length === 0 || args.help || args.raw[0] === "help" ||
    args.raw[0] === "-h"
  ) {
    [
      "",
      `ffremote (${compiledVersion}) - FFremote: The Remote FFmpeg Runner`,
      "",
      "Usage:",
      " ffremote <...ffmpeg-args>",
      " ffremote --size=<size> --include=<file>... -- <...ffmpeg-args>",
      " ffremote get <id>",
      " ffremote watch <id>",
      " ffremote status <id>",
      " ffremote list",
      " ffremote auth",
      " ffremote bug <message>",
      " ffremote chat",
      " ffremote docs",
      " ffremote upgrade",
      "",
      "Read the docs at https://elwood.run/ffremote/docs",
      "Join us on discord: https://elwood.run/ffremote/discord",
      "Send us questions: hello@elwood.company",
    ].map((ln) => console.log(ln));
    Deno.exit(0);
  }

  try {
    const context = await createContext(args, compiledVersion);

    switch (args._[0]) {
      case "get":
      case "g":
        return await get(context);
      case "watch":
      case "w":
        return await watch(context);
      case "status":
      case "s":
        return await status(context);
      case "l":
      case "list":
        return await list(context);
      case "a":
      case "login":
      case "auth":
        return await auth(context);

      case "bug":
      case "issue":
        return openBugReport(context);

      case "discord":
      case "chat":
        return openUrl("https://elwood.run/ffremote/discord");

      case "docs":
        return openUrl("https://elwood.run/docs/ffremote/start");

      case "upgrade":
      case "up":
        return await upgrade(context);

      case "execute":
      default:
        return await execute(context);
    }
  } catch (err) {
    printError(err);
  }
}

export async function createContext(
  args: FFrArgs | CliArgs,
  version: string,
): Promise<FFrCliContext> {
  const cwd_ = args.cwd ?? Deno.env.get("ELWOOD_CWD") ?? Deno.cwd();
  const cwd__ = isAbsolute(cwd_) ? cwd_ : join(Deno.cwd(), cwd_);
  let dotenvValues: JsonObject = {};

  try {
    dotenvValues = dotenv.parse(Deno.readTextFileSync(join(cwd__, ".env")));
  } catch (_) {
    // do nothing
  }

  const remoteUrl = args.remoteUrl ?? dotenvValues.ELWOOD_REMOTE_URL ??
    Deno.env.get("ELWOOD_REMOTE_URL") ??
    "https://api.elwood.run";

  const cwd = dotenvValues.ELWOOD_CWD ?? cwd__;

  return {
    version,
    args: {
      ...args,
      cwd,
    },
    remoteUrl,
    cwd,
    storage: await state.getFfrStorage(),
    api: state.apiProvider(remoteUrl),
  };
}

export function openBugReport(context: FFrCliContext) {
  openUrl(
    `https://github.com/elwood-software/run/issues/new?${new URLSearchParams({
      labels: "FFremote",
      title: "[FFremote] ",
      body: (context.args._ ?? []).slice(1).join(" "),
    })}`,
  );
}
