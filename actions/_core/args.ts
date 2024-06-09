export function get(name: string, strict = true): string | undefined {
  const envName = `ARG_${name.toUpperCase()}`;

  if (strict && !Deno.env.get(envName)) {
    throw new Error(`Missing required environment variable: ${envName}`);
  }

  if (
    Deno.permissions.querySync({ name: "env", variable: envName })
      .state !== "granted"
  ) {
    return "";
  }

  return Deno.env.get(envName) as string;
}
