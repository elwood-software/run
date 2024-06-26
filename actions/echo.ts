import { input } from "./_sdk/mod.ts";

if (import.meta.main) {
  main();
}

export async function main() {
  const content = input.get<string>("content");
  await Deno.stdout.write(new TextEncoder().encode(content));
}
