import { assert } from "../../deps.ts";
import type { Json, JsonObject } from "../../types.ts";
import { replaceVariablesInValue } from "../variables.ts";

export const ExpressionWorkerPath = import.meta.resolve(
  "./worker.ts",
);

export enum ExpressionTokens {
  Prefix = "${{",
  Postfix = "}}",
}

export async function evaluateExpression(
  expression: Json,
  state: JsonObject = {},
): Promise<string> {
  assert(typeof state === "object", "State must be an object");

  // if it's not a string, just return it normalized
  if (typeof expression !== "string") {
    return normalizeExpressionResult(expression, state.env);
  }

  const trimmedExpression = expression.trim();

  // if the expression doesn't start with ${{
  // then we can assume it's a simple string
  if (
    !isEvaluableExpression(trimmedExpression)
  ) {
    return normalizeExpressionResult(expression, state.env);
  }

  const worker = new Worker(ExpressionWorkerPath, {
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
    Deno = self.Deno = undefined;
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

      return resolve(normalizeExpressionResult(event.data.result, state.env));
    };
  });
}

export function normalizeExpressionResult(
  value: Json,
  variables: JsonObject = {},
): string {
  const value_ = replaceVariablesInValue(value, variables);

  if (typeof value_ === "string") {
    return value_;
  }

  return `json:${JSON.stringify(value_)}`;
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
