import { isAbsolute, join } from "../deps.ts";
import type { Json, JsonObject } from "../types.ts";

export function toObject(value: Map<string, Json>): JsonObject {
  return Object.fromEntries(value);
}

export function asError(value: unknown): Error {
  return value as Error;
}

export function toAbsolute(path: string, wd = Deno.cwd()): string {
  return isAbsolute(path) ? path : join(wd, path);
}

export function toAbsoluteUrl(path: string, wd?: string | undefined): URL {
  return new URL(toAbsolute(path, wd), "file://");
}

// (c) https://github.com/denoland/deployctl/blob/main/src/utils/hashing_encoding.ts
export function base64url(binary: Uint8Array): string {
  const binaryString = Array.from(binary).map((b) => String.fromCharCode(b))
    .join("");
  const output = btoa(binaryString);
  const urlSafeOutput = output
    .replaceAll("=", "")
    .replaceAll("+", "-")
    .replaceAll("/", "_");
  return urlSafeOutput;
}

export async function sha256(randomString: string): Promise<Uint8Array> {
  return new Uint8Array(
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(randomString),
    ),
  );
}
