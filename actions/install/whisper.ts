import { command } from "../_sdk/mod.ts";
import { main as installFFmpeg } from "./ffmpeg.ts";

if (import.meta.main) {
  main();
}

async function main() {
  await installFFmpeg();

  const result = await command.execute("pip", {
    args: [
      "--quiet",
      "install",
      "git+https://github.com/openai/whisper.git",
    ],
  });

  Deno.exit(result.code);
}
