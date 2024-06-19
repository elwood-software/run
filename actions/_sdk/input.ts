import { normalize } from "./path.ts";

export function get(name: string, strict = true): string {
  const inputEnvName = `INPUT_${name.toUpperCase()}`;

  if (strict && !Deno.env.has(inputEnvName)) {
    throw new Error(`Missing required environment variable: ${inputEnvName}`);
  }

  // if they don't strictly require the input, make sure we have permission
  // to read it before trying to read it
  if (
    Deno.permissions.querySync({ name: "env", variable: inputEnvName })
      .state !== "granted"
  ) {
    return "";
  }

  const value = Deno.env.get(inputEnvName) as string ?? "";

  if (value.startsWith("json:")) {
    return String(JSON.parse(value.substring(5)));
  }

  return value;
}

export function getOptional<T = unknown>(
  name: string,
  fallback: T | undefined = undefined,
): string | T | undefined {
  try {
    const value = get(name, false);

    return value === "" ? fallback : value;
  } catch {
    return fallback;
  }
}

export function getJson<T = unknown>(
  name: string,
  strict = true,
): Record<string, T> | T[] {
  const value = get(name, strict);

  if (value && value.startsWith("json:")) {
    return JSON.parse(value.substring(5));
  }

  throw new Error(`Input ${name} is not valid JSON: ${value}`);
}

export function getOptionalJson<T = unknown>(
  name: string,
  fallback: T | undefined = undefined,
): ReturnType<typeof getJson> | T | undefined {
  try {
    return getJson<T>(name, false);
  } catch {
    return fallback;
  }
}

export function getBoolean(name: string, strict = true): boolean {
  const value = get(name, strict);

  if (!value) {
    return false;
  }

  switch (value.toLowerCase()) {
    case "1":
    case "yes":
    case "true":
      return true;

    default:
      return false;
  }
}

export async function getNormalizedPath(
  name: string,
  strict = true,
): Promise<string> {
  return await normalize(get(name, strict));
}
