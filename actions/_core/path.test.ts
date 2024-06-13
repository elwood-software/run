import { assertEquals, assertRejects } from "../deps.ts";

import { normalize } from "./path.ts";

Deno.test("normalize()", async function () {
  assertRejects(() => normalize("stage:///a"));

  Deno.env.set("ELWOOD_STAGE", "/stage-path");

  assertEquals(
    await normalize("/path"),
    "/path",
  );

  assertEquals(
    await normalize("stage:///this/is/a/path"),
    "/stage-path/this/is/a/path",
  );
});
