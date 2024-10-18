import type { CliArgs, FFrArgs } from "../../types.ts";
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
      " ffr <...ffmpeg-args>",
      "",
      "Read the docs at https://elwood.run/ffr/docs",
      "Join us on discord: https://discord.gg/mkhKk5db",
      "Send us questions: hello@elwood.technology",
    ].map((ln) => console.log(ln));
    Deno.exit(0);
  }

  const args_ = await createArgs(args);

  switch (args._[0]) {
    case "get":
    case "g":
      return await get(args_);
    case "watch":
    case "w":
      return await watch(args_);
    case "status":
    case "s":
      return await status(args_);
    default:
      return await execute(args_);
  }
}

export async function createArgs(args: CliArgs | FFrArgs): Promise<FFrArgs> {
  const cwd_ = args.cwd ?? Deno.cwd();
  const cwd = isAbsolute(cwd_) ? cwd_ : join(Deno.cwd(), cwd_);

  return {
    ...args,
    cwd,
    state: await state.getFfr(),
    api: state.apiProvider(args.remoteUrl ?? "https://api.elwood.run"),
  };
}
