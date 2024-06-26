export async function execute(
  bin: string,
  options: Deno.CommandOptions = {},
): Promise<Deno.CommandOutput> {
  const cmd = await create(bin, {
    stdout: "inherit",
    stderr: "inherit",

    ...options,
  });

  return await cmd.output();
}

export async function create(
  bin: string,
  options: Deno.CommandOptions = {},
): Promise<Deno.Command> {
  return await Promise.resolve(
    new Deno.Command(bin, {
      stdout: "inherit",
      stderr: "inherit",
      ...options,
      env: {
        PATH: Deno.env.get("PATH") ?? "",
      },
    }),
  );
}
