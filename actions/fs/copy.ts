import { fs, input } from "../_core/mod.ts";

if (import.meta.main) {
  main();
}

export async function main() {
  const src = await input.getNormalizedPath("src");
  const dest = await input.getNormalizedPath("dest");

  await fs.copy(src, dest);
}
