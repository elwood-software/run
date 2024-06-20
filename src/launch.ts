import { assert, logger, parseYaml } from "./deps.ts";
import { EnvName, LaunchMode, LaunchModeNames } from "./constants.ts";
import { LaunchSchema } from "./schema/launch.ts";
import type { LaunchOptions } from "./types.ts";

// launch modes
import { launchServe } from "./launch/serve.ts";
import { launchExecute } from "./launch/execute.ts";
import { launchWorker } from "./launch/worker.ts";

// entrypoint if the file is run directly
// it will read from the env to figure out mode
// and then launch the runtime
if (import.meta.main) {
  const [mode] = Deno.args;
  const modeOverride = Deno.env.get(EnvName.LaunchOverrideMode);
  const mode_ = modeOverride ?? mode;

  // make sure it's a valid mode
  if (!LaunchModeNames.includes(mode_ as LaunchMode)) {
    console.error("LAUNCH ERROR: Invalid mode");
    console.error(
      `Mode is "${mode_}", but should be one of: ${LaunchModeNames.join(", ")}`,
    );
    Deno.exit(1);
  }

  const launchFile = Deno.env.get(EnvName.LaunchFile);

  assert(launchFile, `Launch file ${EnvName.LaunchFile} not set`);
  assert(
    Deno.statSync(launchFile)?.isFile,
    `Bootstrap file at "${launchFile}" does not exist`,
  );

  const launchOptions = await LaunchSchema.parseAsync(parseYaml(
    await Deno.readTextFile(launchFile),
  )) as LaunchOptions;

  await launch(mode_ as LaunchMode, launchOptions);
}

/**
 * Launch the runner in the specified mode
 * @param mode Launch Mode
 * @param options Options passed to launch handler
 */
export async function launch(mode: LaunchMode, options: LaunchOptions) {
  logger.setup({
    handlers: {
      console: new logger.ConsoleHandler("DEBUG"),
    },

    loggers: {
      default: {
        level: "DEBUG",
        handlers: ["console"],
      },
      "elwood-runner": {
        level: "DEBUG",
        handlers: ["file", "console"],
      },
    },
  });

  try {
    switch (mode) {
      case LaunchMode.Serve: {
        assert(
          options.server,
          "Server config not found",
        );

        await launchServe(options);
        break;
      }
      case LaunchMode.Execute: {
        assert(
          options.execute,
          "Execute config not found",
        );

        await launchExecute(options);
        break;
      }
      case LaunchMode.Worker: {
        assert(
          options.worker,
          "Worker config not found",
        );

        await launchWorker(options);
        break;
      }
    }
  } catch (err) {
    console.error("LAUNCH ERROR:", err);
    Deno.exit(1);
  }
}
