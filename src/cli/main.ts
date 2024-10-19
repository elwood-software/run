import type { CliArgs } from "../types.ts";
import { execute } from "./execute.ts";
import ffr from "./ffr/execute.ts";
import { createContext } from "./ffr/main.ts";

export async function main(args: CliArgs) {
  if (args._[0] === "ffmpeg") {
    return await ffr(await createContext(args));
  }

  await execute(args);
}
