export type * from "./src/types.ts";
export * from "./src/schema/job.ts";
export * from "./src/schema/launch.ts";
export * from "./src/launch.ts";
export * from "./src/launch/serve.ts";
export * from "./src/launch/execute.ts";

if (import.meta.main) {
  console.error("This module should not be executed directly.");
  console.error("Only import it from another module.");
  console.error(
    "More details at: https://elwood.run/docs/errors/runtime-import-mod",
  );
  Deno.exit(1);
}
