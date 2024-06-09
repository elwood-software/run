import { assert } from "./deps.ts";
import { args, command, input } from "./_core/mod.ts";

if (import.meta.main) {
  main();
}

export async function main() {
  const cmd = input.getOptional("bin", args.get("bin", false)) ?? "deno";
  const script = input.get("script", false);
  const cmdArgs = input.getOptionalJson("args", []);

  if (script) {
    const cmd = await command.create("bash", {
      stdin: "piped",
    });

    const child = cmd.spawn();

    // write the script to the childprocess as stdin
    child.stdin.getWriter().write(new TextEncoder().encode(script));
    child.stdin.close();

    Deno.exit((await child.status).code);
  }

  assert(cmd, "bin must be provided");
  assert(Array.isArray(cmdArgs), "args must be an array");

  const result = await command.execute(cmd, {
    args: cmdArgs as string[],
  });

  Deno.exit(result.code);
}
