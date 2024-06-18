import { assertEquals, assertRejects } from "../../deps.ts";

import {
  evaluateAndNormalizeExpression,
  normalizeExpressionResult,
} from "./expression.ts";

Deno.test("evaluateExpress()", async function () {
  assertEquals(
    await evaluateAndNormalizeExpression("${{ hello.world }}", {
      hello: { world: "I am Elwood" },
    }),
    "I am Elwood",
  );

  assertEquals(
    await evaluateAndNormalizeExpression("hello.world", {
      hello: { world: "I am Elwood" },
    }),
    "hello.world",
  );

  assertEquals(
    await evaluateAndNormalizeExpression("${{ 1 + 1 }}", {
      hello: { world: "I am Elwood" },
    }),
    normalizeExpressionResult(2),
  );

  assertEquals(
    await evaluateAndNormalizeExpression("${{ hello }}", {
      hello: { world: "I am Elwood" },
    }),
    normalizeExpressionResult({ world: "I am Elwood" }),
  );

  assertEquals(
    await evaluateAndNormalizeExpression("${{ 42 === my_age }}", {
      my_age: 42,
    }),
    normalizeExpressionResult(true),
  );

  assertEquals(
    await evaluateAndNormalizeExpression("${{ null }}"),
    normalizeExpressionResult(null),
  );

  assertEquals(
    await evaluateAndNormalizeExpression("${{ d.one && d.two }}", {
      d: { one: true, two: true },
    }),
    normalizeExpressionResult(true),
  );

  assertRejects(
    () => evaluateAndNormalizeExpression("${{ d.one && d.two }}", {}),
  );

  assertEquals(
    await evaluateAndNormalizeExpression("${{ __elwood_internal }}", {}),
    normalizeExpressionResult(undefined),
  );

  assertEquals(
    await evaluateAndNormalizeExpression("${{ toJson(say) }}", {
      say: { hello: "world" },
    }),
    normalizeExpressionResult({ hello: "world" }),
  );

  assertEquals(
    await evaluateAndNormalizeExpression(["test"], {}),
    normalizeExpressionResult(["test"]),
  );

  assertEquals(
    await evaluateAndNormalizeExpression(["$TEST_1"], {
      env: { TEST_1: "test" },
    }),
    normalizeExpressionResult(["test"]),
  );

  assertEquals(
    await evaluateAndNormalizeExpression(["$TEST_1", true], {
      env: { TEST_1: "test" },
    }),
    normalizeExpressionResult(["test", true]),
  );

  assertEquals(
    await evaluateAndNormalizeExpression(
      '${{ dirname("/this/is/a/path.json") }}',
      {},
    ),
    "/this/is/a",
  );
});

Deno.test("evaluateExpress() throws", async function (t) {
  await t.step("rejects require", () => {
    assertRejects(
      async () =>
        await evaluateAndNormalizeExpression("${{ require('worker'); }}", {}),
    );
  });

  await t.step("no deno", () => {
    assertRejects(
      async () =>
        await evaluateAndNormalizeExpression("${{ Deno.build.os }}", {}),
    );
  });
});
