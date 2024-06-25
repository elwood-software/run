import { fs, input } from "../_sdk/mod.ts";

if (import.meta.main) {
  main();
}

export async function main() {
  const dest = input.get<string>("dest");
  const content = input.get<string>("content");

  await fs.write(dest, content);
}
