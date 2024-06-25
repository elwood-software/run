import { assertEquals, assertThrows } from "../_deps.ts";
import { get, getOptional } from "./input.ts";

Deno.test("get()", async function (t) {
  await t.step("throws when not defined and strict", function () {
    assertThrows(
      () => get("TEST_NOT_SET"),
      Error,
    );
  });

  await t.step("json empty array", function () {
    Deno.env.set("INPUT_TEST_SET", "json:[]");
    assertEquals(
      get("TEST_SET"),
      [],
    );
    Deno.env.delete("INPUT_TEST_SET");
  });

  await t.step("json object", function () {
    const o = { "key": "value" };
    Deno.env.set("INPUT_TEST_SET", `json:${JSON.stringify(o)}`);
    assertEquals(
      get("TEST_SET"),
      o,
    );
    Deno.env.delete("INPUT_TEST_SET");
  });
  await t.step("json boolean", function () {
    Deno.env.set("INPUT_TEST_SET", "json:false");
    assertEquals(
      get("TEST_SET"),
      false,
    );
    Deno.env.delete("INPUT_TEST_SET");
  });
  await t.step("json number", function () {
    Deno.env.set("INPUT_TEST_SET", "json:2");
    assertEquals(
      get("TEST_SET"),
      2,
    );
    Deno.env.delete("INPUT_TEST_SET");
  });
  await t.step("json null", function () {
    Deno.env.set("INPUT_TEST_SET", "json:null");
    assertEquals(
      get("TEST_SET"),
      null,
    );
    Deno.env.delete("INPUT_TEST_SET");
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
