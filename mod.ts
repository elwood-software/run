export type * from "./src/types.ts";
export * from "./src/launch.ts";
export * from "./src/launch/serve.ts";
export * from "./src/launch/execute.ts";
export * from "./src/launch/worker.ts";
export { Manager as ElwoodRunManager } from "./src/runtime/manager.ts";
export * from "./src/constants.ts";

if (import.meta.main) {
  console.error("This module should not be executed directly.");
  console.error("Only import it from another module.");
  console.error(
    "More details at: https://elwood.run/docs/errors/runtime-import-mod",
  );
  Deno.exit(1);
}
