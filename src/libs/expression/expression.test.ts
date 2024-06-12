import { assertEquals, assertRejects } from "../../deps.ts";

import { evaluateExpress, normalizeExpressionResult } from "./expression.ts";

Deno.test("evaluateExpress()", async function () {
  assertEquals(
    await evaluateExpress("${{ hello.world }}", {
      hello: { world: "I am Elwood" },
    }),
    "I am Elwood",
  );

  assertEquals(
    await evaluateExpress("hello.world", {
      hello: { world: "I am Elwood" },
    }),
    "hello.world",
  );

  assertEquals(
    await evaluateExpress("${{ 1 + 1 }}", {
      hello: { world: "I am Elwood" },
    }),
    normalizeExpressionResult(2),
  );

  assertEquals(
    await evaluateExpress("${{ hello }}", {
      hello: { world: "I am Elwood" },
    }),
    normalizeExpressionResult({ world: "I am Elwood" }),
  );

  assertEquals(
    await evaluateExpress("${{ 42 === my_age }}", {
      my_age: 42,
    }),
    normalizeExpressionResult(true),
  );

  assertEquals(
    await evaluateExpress("${{ null }}"),
    normalizeExpressionResult(null),
  );

  assertEquals(
    await evaluateExpress("${{ d.one && d.two }}", {
      d: { one: true, two: true },
    }),
    normalizeExpressionResult(true),
  );

  assertRejects(
    () => evaluateExpress("${{ d.one && d.two }}", {}),
  );

  assertEquals(
    await evaluateExpress("${{ __elwood_internal }}", {}),
    normalizeExpressionResult(undefined),
  );

  assertEquals(
    await evaluateExpress("${{ toJson(say) }}", { say: { hello: "world" } }),
    normalizeExpressionResult({ hello: "world" }),
  );
});
