
import type { CliArgs } from "../types.ts";
import { execute } from "./execute.ts";
import { ffmpeg } from "./ffmpeg.ts";

export async function main(args: CliArgs) {
  if (args._[0] === "ffmpeg") {
    return await ffmpeg(args);
  }

  await execute(args);
}
