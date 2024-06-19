export * as sdk from "./_sdk/mod.ts";

// this file can't be directly executed. It's only
// meant to be a short to the _core helper modules
if (import.meta.main) {
  console.error("This module should not be executed directly.");
  console.error("Only import it from another module.");
  console.error(
    "More details at: https://elwood.run/docs/errors/actions-import-mod",
  );
  Deno.exit(1);
}
