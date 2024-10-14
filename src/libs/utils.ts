import { isAbsolute, join } from "../deps.ts";
import { Json, type JsonObject } from "../types.ts";

export function toObject(value: Map<string, Json>): JsonObject {
  return Object.fromEntries(value);
}

export function asError(value: unknown): Error {
  return value as Error;
}

export function toAbsolute(path: string, wd = Deno.cwd()): string {
  return isAbsolute(path) ? path : join(wd, path);
}

export function toAbsoluteUrl(path:string, wd?:string|undefined): URL {
return new URL(toAbsolute(path, wd), "file://");

}
