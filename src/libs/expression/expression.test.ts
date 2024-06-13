import { assertEquals, assertRejects } from "../../deps.ts";

import { evaluateExpression, normalizeExpressionResult } from "./expression.ts";

Deno.test("evaluateExpress()", async function () {
  assertEquals(
    await evaluateExpression("${{ hello.world }}", {
      hello: { world: "I am Elwood" },
    }),
    "I am Elwood",
  );

  assertEquals(
    await evaluateExpression("hello.world", {
      hello: { world: "I am Elwood" },
    }),
    "hello.world",
  );

  assertEquals(
    await evaluateExpression("${{ 1 + 1 }}", {
      hello: { world: "I am Elwood" },
    }),
    normalizeExpressionResult(2),
  );

  assertEquals(
    await evaluateExpression("${{ hello }}", {
      hello: { world: "I am Elwood" },
    }),
    normalizeExpressionResult({ world: "I am Elwood" }),
  );

  assertEquals(
    await evaluateExpression("${{ 42 === my_age }}", {
      my_age: 42,
    }),
    normalizeExpressionResult(true),
  );

  assertEquals(
    await evaluateExpression("${{ null }}"),
    normalizeExpressionResult(null),
  );

  assertEquals(
    await evaluateExpression("${{ d.one && d.two }}", {
      d: { one: true, two: true },
    }),
    normalizeExpressionResult(true),
  );

  assertRejects(
    () => evaluateExpression("${{ d.one && d.two }}", {}),
  );

  assertEquals(
    await evaluateExpression("${{ __elwood_internal }}", {}),
    normalizeExpressionResult(undefined),
  );

  assertEquals(
    await evaluateExpression("${{ toJson(say) }}", { say: { hello: "world" } }),
    normalizeExpressionResult({ hello: "world" }),
  );

  assertEquals(
    await evaluateExpression(["test"], {}),
    normalizeExpressionResult(["test"]),
  );

  assertEquals(
    await evaluateExpression(["$TEST_1"], { env: { TEST_1: "test" } }),
    normalizeExpressionResult(["test"]),
  );

  assertEquals(
    await evaluateExpression(["$TEST_1", true], { env: { TEST_1: "test" } }),
    normalizeExpressionResult(["test", true]),
  );

  assertEquals(
    await evaluateExpression('${{ dirname("/this/is/a/path.json") }}', {}),
    "/this/is/a",
  );
});

Deno.test("evaluateExpress() throws", async function (t) {
  await t.step("rejects require", () => {
    assertRejects(
      async () => await evaluateExpression("${{ require('worker'); }}", {}),
    );
  });

  await t.step("no deno", () => {
    assertRejects(
      async () => await evaluateExpression("${{ Deno.build.os }}", {}),
    );
  });
});
