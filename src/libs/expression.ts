import { assert } from "../deps.ts";
import type { Json, JsonObject } from "../types.ts";

export enum ExpressionTokens {
  Prefix = "${{",
  Postfix = "}}",
}

export async function evaluateExpress(
  expression: Json,
  state: JsonObject = {},
): Promise<string> {
  assert(typeof state === "object", "State must be an object");

  // if it's not a string, just return it normalized
  if (typeof expression !== "string") {
    return normalizeExpressionResult(expression);
  }

  const trimmedExpression = expression.trim();

  // if the expression doesn't start with ${{
  // then we can assume it's a simple string
  if (
    !isEvaluableExpression(trimmedExpression)
  ) {
    return normalizeExpressionResult(expression);
  }

  const worker = new Worker(import.meta.resolve("./expression-worker.ts"), {
    type: "module",
    deno: {
      permissions: "none",
    },
  });

  const expressionCode = trimmedExpression
    .replace(ExpressionTokens.Prefix, "")
    .replace(
      ExpressionTokens.Postfix,
      "",
    );

  const code = `
    __elwood_internal = undefined;
    Object.assign(self, ${JSON.stringify(state)});
    ${expressionCode}
  `;

  worker.postMessage({
    type: "eval",
    code,
  });

  return await new Promise((resolve, reject) => {
    worker.onmessage = (event) => {
      if (event.data.type === "error") {
        reject(event.data.error);
      }

      // stop
      worker.terminate();

      return resolve(normalizeExpressionResult(event.data.result));
    };
  });
}

export function normalizeExpressionResult(value: Json): string {
  if (typeof value === "string") {
    return value;
  }

  return `json:${JSON.stringify(value)}`;
}

export function isExpressionResultTruthy(value: string): boolean {
  if (value.startsWith("json:")) {
    const jsonValue = JSON.parse(value.replace("json:", ""));

    if (typeof jsonValue === "string") {
      return isExpressionResultTruthy(jsonValue);
    }

    if (
      jsonValue === false || jsonValue === null || jsonValue === undefined ||
      jsonValue === 0
    ) {
      return false;
    }

    return true;
  }

  return value === "true" || value === "1";
}

export function isEvaluableExpression(value: string): boolean {
  return (
    value.trimStart().startsWith(ExpressionTokens.Prefix) &&
    value.trimEnd().endsWith(ExpressionTokens.Postfix)
  );
}

export function makeEvaluableExpression(value: string): string {
  return isEvaluableExpression(value)
    ? value
    : `${ExpressionTokens.Prefix}${value}${ExpressionTokens.Postfix}`;
}
