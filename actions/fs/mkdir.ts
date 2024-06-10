import { fs, input } from "../_core/mod.ts";

if (import.meta.main) {
  main();
}

export async function main() {
  const dir = await input.get("path");
  const recursive = input.getBoolean("recursive");

  // we can use "fs" here because path can only be local
  await fs.mkdir(dir, recursive);
}
