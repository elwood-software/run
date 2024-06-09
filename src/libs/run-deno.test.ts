import { assertEquals } from "../deps.ts";

import { permissionObjectToFlags } from "./run-deno.ts";

Deno.test("permissionObjectToFlags()", function () {
  assertEquals(
    permissionObjectToFlags({
      env: true,
    }),
    [
      "--allow-env",
      "--deny-sys",
      "--deny-hrtime",
      "--deny-net",
      "--deny-ffi",
      "--deny-read",
      "--deny-run",
      "--deny-write",
    ],
  );

  assertEquals(
    permissionObjectToFlags({
      env: ["a", "b"],
    }),
    [
      "--allow-env=a,b",
      "--deny-sys",
      "--deny-hrtime",
      "--deny-net",
      "--deny-ffi",
      "--deny-read",
      "--deny-run",
      "--deny-write",
    ],
  );

  assertEquals(
    permissionObjectToFlags({
      env: "inherit",
    }),
    [
      "--deny-env",
      "--deny-sys",
      "--deny-hrtime",
      "--deny-net",
      "--deny-ffi",
      "--deny-read",
      "--deny-run",
      "--deny-write",
    ],
  );

  assertEquals(
    permissionObjectToFlags({
      env: false,
    }),
    [
      "--deny-env",
      "--deny-sys",
      "--deny-hrtime",
      "--deny-net",
      "--deny-ffi",
      "--deny-read",
      "--deny-run",
      "--deny-write",
    ],
  );

  assertEquals(
    permissionObjectToFlags({
      env: true,
      ffi: [new URL("https://elwood.dev")],
    }),
    [
      "--allow-env",
      "--deny-sys",
      "--deny-hrtime",
      "--deny-net",
      "--allow-ffi=https://elwood.dev/",
      "--deny-read",
      "--deny-run",
      "--deny-write",
    ],
  );
});
