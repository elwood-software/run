import { fs, input } from "../_core/mod.ts";

if (import.meta.main) {
  main();
}

export async function main() {
  const dest = input.get("dest");
  const content = input.get("content");

  await fs.write(dest, content);
}
