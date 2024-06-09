export type ExecuteDenoRunOptions = Omit<ExecuteDenoCommand, "args"> & {
  file: string;
  permissions?: Deno.PermissionOptionsObject;
  args?: string[];
};

export async function executeDenoRun(
  options: ExecuteDenoRunOptions,
): Promise<Deno.CommandOutput> {
  const { file, permissions, args = [], ...cmdOptions } = options;

  return await executeDenoCommand({
    args: ["run", ...permissionObjectToFlags(permissions ?? {}), ...args, file],
    ...cmdOptions,
  });
}

export type ExecuteDenoCommand = Deno.CommandOptions;

export async function executeDenoCommand(
  options: ExecuteDenoCommand,
): Promise<Deno.CommandOutput> {
  console.log("executeDenoCommand", JSON.stringify(options, null, 2));

  const cmd = new Deno.Command(Deno.execPath(), {
    stdout: "inherit",
    stderr: "inherit",
    ...options,
  });

  return await cmd.output();
}

export function permissionObjectToFlags(
  options: Deno.PermissionOptionsObject,
): string[] {
  const defaults = {
    env: false,
    sys: false,
    hrtime: false,
    net: false,
    ffi: false,
    read: false,
    run: false,
    write: false,
  };

  console.log(options);

  return Object.entries({ ...defaults, ...options }).reduce(
    (acc, [name, value]) => {
      if (value === false || value === "inherit") {
        return [...acc, `--deny-${name}`];
      }

      if (value === true || (Array.isArray(value) && value.length === 0)) {
        return [...acc, `--allow-${name}`];
      }

      if (Array.isArray(value)) {
        return [...acc, `--allow-${name}=${value.join(",")}`];
      }

      return acc;
    },
    [] as string[],
  );
}
