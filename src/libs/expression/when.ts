import type { JsonObject, Workflow } from "../../types.ts";
import {
  evaluateAndNormalizeExpression,
  isExpressionResultTruthy,
} from "./expression.ts";

export async function evaluateWhen(
  when: Workflow.When | undefined,
  state: JsonObject,
): Promise<boolean> {
  // always or true
  if (
    when === undefined || when === "*" || when === "always" || when === true
  ) {
    return true;
  }

  // never or false
  if (when === "never" || when === false) {
    return false;
  }

  // any other string is evaluated as an expression
  if (typeof when === "string") {
    return isExpressionResultTruthy(
      await evaluateAndNormalizeExpression(when, state),
    );
  }

  // if it's an object, push it to an array just to make sure it's iterable
  if (!Array.isArray(when)) {
    return await evaluateWhen([when], state);
  }

  const results: boolean[] = [];

  for (const item of when) {
    if (typeof item === "string") {
      results.push(
        await evaluateWhen(item, state),
      );
    } else if (typeof item === "object") {
      if (item.event) {
        const ifValue = item.if ? await evaluateWhen(item.if, state) : true;
        results.push(
          item.event === state.event && ifValue,
        );
      } else if (item.if) {
        results.push(await evaluateWhen(item.if, state));
      }
    }
  }

  return results.some((result) => result);
}
