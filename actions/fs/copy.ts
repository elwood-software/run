import { input, io } from "../_core/mod.ts";

if (import.meta.main) {
  main();
}

export async function main() {
  const src = await input.getNormalizedPath("src");
  const dest = await input.getNormalizedPath("dest");

  // it might seem like you want to use "fs" instead of "io" here
  // but "fs" is only for local file system operations and
  // paths can be remote
  await io.copy(src, dest);
}
