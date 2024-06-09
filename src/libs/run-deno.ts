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

export type ExecuteDenoCommand = Deno.CommandOptions & {
  stdoutStream?: WritableStream<Uint8Array>;
  stderrStream?: WritableStream<Uint8Array>;
};

export async function executeDenoCommand(
  options: ExecuteDenoCommand,
): Promise<Deno.CommandOutput> {
  const {
    stderrStream,
    stdoutStream,
    stdout = "inherit",
    stderr = "inherit",
    ...opts
  } = options;

  const cmd = new Deno.Command(Deno.execPath(), {
    stdout: stdoutStream ? "piped" : stdout,
    stderr: stderrStream ? "piped" : stderr,
    ...opts,
  });

  const child = cmd.spawn();

  if (stdoutStream) {
    child.stdout.pipeTo(stdoutStream);
  }
  if (stderrStream) {
    child.stderr.pipeTo(stderrStream);
  }

  child.stdin.close();

  return await child.output();
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
