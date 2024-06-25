import { normalize } from "./path.ts";

export function envName(name: string): string {
  return `INPUT_${name.toUpperCase()}`;
}

export function get<T = unknown>(name: string): T {
  const inputEnvName = envName(name);

  if (!Deno.env.has(inputEnvName)) {
    throw new Error(`Missing required environment variable: ${inputEnvName}`);
  }

  const value = Deno.env.get(inputEnvName) as string ?? "";

  if (value.startsWith("json:")) {
    return JSON.parse(value.substring(5)) as T;
  }

  return value as T;
}

export function getOptional<T = unknown>(
  name: string,
  fallback: T | undefined = undefined,
): T | undefined {
  try {
    const name_ = envName(name);

    // if they don't have permission to read the env variable, return the fallback
    if (
      Deno.permissions.querySync({ name: "env", variable: name_ })
        .state !== "granted"
    ) {
      return fallback;
    }

    const value = get<T>(name);

    return value === undefined ? fallback : value;
  } catch {
    return fallback;
  }
}

export function getBoolean(name: string, strict = true): boolean {
  const value = strict ? get(name) : getOptional(name);

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    switch (value.toLowerCase()) {
      case "1":
      case "yes":
      case "true":
        return true;

      default:
        return false;
    }
  }

  if (typeof value !== "number") {
    return false;
  }

  return value === 1;
}

export async function getNormalizedPath(
  name: string,
): Promise<string> {
  return await normalize(
    get<string>(name),
  );
}
