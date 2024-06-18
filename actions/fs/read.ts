import { fs, input, output } from "../_sdk/mod.ts";

if (import.meta.main) {
  main();
}

export async function main() {
  const dest = input.get("src");
  const outputTo = input.getOptional<string>("output");

  const data = await fs.read(dest);

  // write to output if provided
  if (outputTo) {
    await output.set(outputTo, data);
  } else {
    await Deno.stdout.write(new TextEncoder().encode(data));
  }
}
