import { assertEquals, assertThrows } from "../deps.ts";

import { get, getOptional } from "./input.ts";
Deno.test("get()", async function (t) {
  await t.step("throws when not defined and strict", function () {
    assertThrows(
      () => get("TEST_NOT_SET"),
      Error,
    );
  });
});
Deno.test("getOptional()", async function (t) {
  await t.step("default if provided", function () {
    assertEquals(
      getOptional("TEST_NOT_SET", "default"),
      "default",
    );
  });

  await t.step("undefined if not provided", function () {
    assertEquals(
      getOptional("TEST_NOT_SET"),
      undefined,
    );
  });

  await t.step("value if provided", function () {
    Deno.env.set("INPUT_TEST_SET", "value");

    assertEquals(
      getOptional("TEST_SET"),
      "value",
    );

    Deno.env.delete("INPUT_TEST_SET");
  });
});
