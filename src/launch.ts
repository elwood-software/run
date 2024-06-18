import { logger } from "./deps.ts";
import { LaunchMode, LaunchModeNames } from "./constants.ts";
import { launchServe } from "./launch/serve.ts";
import { launchBootstrap } from "./launch/bootstrap.ts";
import { launchWorker } from "./launch/worker.ts";

if (import.meta.main) {
  const [mode] = Deno.args;
  const modeOverride = Deno.env.get("ELWOOD_RUNNER_MODE_OVERRIDE");
  const mode_ = modeOverride ?? mode;

  // make sure it's a valid mode
  if (!LaunchModeNames.includes(mode_ as LaunchMode)) {
    console.error("LAUNCH ERROR: Invalid mode");
    console.error(
      `Mode is "${mode_}", but should be one of: ${LaunchModeNames.join(", ")}`,
    );
    Deno.exit(1);
  }

  await launch(mode_ as LaunchMode);
}

export async function launch(mode: LaunchMode) {
  try {
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

    switch (mode) {
      case LaunchMode.Serve: {
        await launchServe();
        break;
      }
      case LaunchMode.Bootstrap: {
        await launchBootstrap();
        break;
      }
      case LaunchMode.Worker: {
        await launchWorker();
        break;
      }
    }
  } catch (err) {
    console.error("LAUNCH ERROR:", err);
    Deno.exit(1);
  }
}
