import { Json, type JsonObject } from "../types.ts";

export function toObject(value: Map<string, Json>): JsonObject {
  return Object.fromEntries(value);
}
