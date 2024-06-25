import { input } from "./_sdk/mod.ts";

if (import.meta.main) {
  main();
}

export async function main() {
  const seconds = input.get<string>("seconds");
  const seconds_ = parseInt(String(seconds), 10);

  if (isNaN(seconds_)) {
    console.error(
      `Invalid input. seconds is not a number ${seconds}/${seconds_}`,
    );
  }

  await new Promise((resolve) => setTimeout(resolve, seconds_ * 1000));

  Deno.exit(0);
}
