import { denoPermissionObjectToFlags } from "./permissions.ts";

export type ExecuteDenoRunOptions = Omit<ExecuteDenoCommand, "args"> & {
  file: string;
  permissions?: Deno.PermissionOptionsObject;
  args?: string[];
};

export async function executeDenoRun(
  options: ExecuteDenoRunOptions,
): Promise<Deno.CommandStatus> {
  const { file, permissions, args = [], ...cmdOptions } = options;

  return await executeDenoCommand({
    args: [
      "run",
      ...denoPermissionObjectToFlags(permissions ?? {}),
      ...args,
      file,
    ],
    ...cmdOptions,
  });
}

export type ExecuteDenoCommand = Deno.CommandOptions & {
  stdoutStream?: WritableStream<Uint8Array>;
  stderrStream?: WritableStream<Uint8Array>;
  retry?: boolean;
};

export async function executeDenoCommand(
  options: ExecuteDenoCommand,
): Promise<Deno.CommandStatus> {
  const {
    stderrStream,
    stdoutStream,
    stdout = "inherit",
    stderr = "inherit",
    retry = false,
    ...opts
  } = options;

  const cmd = new Deno.Command("/elwood/run/runner/bin/deno", {
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

  if (opts.stdin === "piped") {
    await child.stdin.close();
  }

  const status = await child.status;

  // if the command failed and we haven't retried yet, try again
  if (status.code !== 0 && retry) {
    return await executeDenoCommand({ ...options, retry: false });
  }

  return status;
}
