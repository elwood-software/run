import type {
  CliArgs,
  FFrArgs,
  FFrCliContext,
  JsonObject,
} from "../../types.ts";
import { dotenv, isAbsolute, join } from "../../deps.ts";

import { state } from "../state.ts";
import execute from "./execute.ts";
import get from "./get.ts";
import status from "./status.ts";
import watch from "./watch.ts";
import auth from "./auth.ts";
import { printError } from "../lib.ts";

export async function main(compiledVersion: string, args: FFrArgs) {
  if (args.version) {
    console.log(`ffremote ${compiledVersion}`);
    Deno.exit(0);
  }

  if (args.raw.length === 0) {
    [
      "",
      `ffremote (${compiledVersion}) - FFremote: The Remote FFmpeg Runner`,
      "",
      "Usage:",
      " ffr <...ffmpeg-args>",
      " ffr --size=<size> --include=<file> -- <...ffmpeg-args>",
      " ffr get <id>",
      " ffr watch <id>",
      " ffr status <id>",
      " ffr auth",
      "",
      "Read the docs at https://elwood.run/ffremote/docs",
      "Join us on discord: https://discord.gg/mkhKk5db",
      "Send us questions: hello@elwood.technology",
    ].map((ln) => console.log(ln));
    Deno.exit(0);
  }

  try {
    const context = await createContext(args);

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
      case "a":
      case "login":
      case "auth":
        return await auth(context);
      default:
        return await execute(context);
    }
  } catch (err) {
    printError(err);
  }
}

export async function createContext(
  args: FFrArgs | CliArgs,
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
