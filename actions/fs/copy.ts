import { input, io, output } from "../_sdk/mod.ts";
import { basename, dirname, extname } from "../_deps.ts";

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

  // write the output path back to the output
  await output.set("dest", {
    path: dest,
    filename: basename(dest),
    dirname: dirname(dest),
    extname: extname(dest),
  });
}
