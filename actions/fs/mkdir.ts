import { fs, input, output } from "../_sdk/mod.ts";
import { basename } from "../_deps.ts";

if (import.meta.main) {
  main();
}

export async function main() {
  const dir = await input.get("path");
  const recursive = input.getBoolean("recursive");

  // we can use "fs" here because path can only be local
  await fs.mkdir(dir, recursive);

  // write the output path back to the output
  await output.set("dest", {
    path: dir,
    name: basename(dir),
  });
}
