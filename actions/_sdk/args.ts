export function get(name: string): string | undefined {
  const envName = `ARG_${name.toUpperCase()}`;

  if (
    Deno.permissions.querySync({ name: "env", variable: envName })
      .state !== "granted"
  ) {
    return undefined;
  }

  return Deno.env.get(envName) as string;
}
