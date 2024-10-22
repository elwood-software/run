import type { CliArgs, FFrArgs, FFrCliContext } from "../../types.ts";
import { isAbsolute, join } from "../../deps.ts";

import { state } from "../state.ts";
import execute from "./execute.ts";
import get from "./get.ts";
import status from "./status.ts";
import watch from "./watch.ts";

export async function main(args: FFrArgs) {
  if (args.raw.length === 0) {
    [
      "",
      "./ffr - Remote FFmpeg Runner",
      "",
      "Usage:",
      " ffr get <id>",
      " ffr watch <id>",
      " ffr status <id>",
      " ffr --size=<size> <...ffmpeg-args>",
      "",
      "Read the docs at https://elwood.run/ffr/docs",
      "Join us on discord: https://discord.gg/mkhKk5db",
      "Send us questions: hello@elwood.technology",
    ].map((ln) => console.log(ln));
    Deno.exit(0);
  }

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
    default:
      return await execute(context);
  }
}

export async function createContext(
  args: FFrArgs | CliArgs,
): Promise<FFrCliContext> {
  const cwd_ = args.cwd ?? Deno.cwd();
  const cwd = isAbsolute(cwd_) ? cwd_ : join(Deno.cwd(), cwd_);

  return {
    args: {
      ...args,
      cwd,
    },
    state: await state.getFfr(),
    api: state.apiProvider(args.remoteUrl ?? "https://api.elwood.run"),
  };
}
