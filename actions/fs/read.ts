import { fs, input } from "../_core/mod.ts";

if (import.meta.main) {
  main();
}

export async function main() {
  const dest = input.get("src");
  const output = input.getOptional("output");

  const data = await fs.read(dest);

  // write to output if provided
  if (output) {
    await fs.write("output://", `${output}=${data}`);
  }

  await Deno.stdout.write(new TextEncoder().encode(data));
}
