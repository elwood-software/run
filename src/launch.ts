import { Manager } from "./runtime/manager.ts";
import { logger } from "./deps.ts";
import { serve } from "./serve.ts";
import { bootstrap } from "./bootstrap.ts";

enum LaunchMode {
  Bootstrap = "bootstrap",
  Worker = "worker",
  Serve = "serve",
}

const LaunchModeNames = Object.values(LaunchMode);

if (import.meta.main) {
  const [mode] = Deno.args;
  const modeOverride = Deno.env.get("ELWOOD_RUNNER_MODE_OVERRIDE");
  const mode_ = modeOverride ?? mode;

  // make sure it's a valid mode
  if (!LaunchModeNames.includes(mode_ as any)) {
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
    // create our manager from the environment
    const manager = await Manager.fromEnv();

    logger.setup({
      handlers: {
        console: new logger.ConsoleHandler("DEBUG"),
        file: new logger.FileHandler("DEBUG", {
          filename: manager.workspaceDir.join("runner.log"),
        }),
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

    manager.logger.info(`Launching in mode: ${mode}`);

    switch (mode) {
      case LaunchMode.Serve: {
        await serve(manager);
        break;
      }
      case LaunchMode.Bootstrap: {
        await bootstrap(manager);
        break;
      }
      case LaunchMode.Worker: {
        // todo: worker
        break;
      }
    }
  } catch (err) {
    console.error("LAUNCH ERROR:", err);
    Deno.exit(1);
  }
}
