import { Folder } from "./folder.ts";
import { assert, dotenv, isAbsolute, join, logger } from "../deps.ts";
import { Execution, ExecutionOptions } from "./execution.ts";
import { evaluateExpression } from "../libs/expression/expression.ts";
import { EnvName } from "../constants.ts";
import type {
  JsonObject,
  Reporter,
  ReporterChangeData,
  Workflow,
} from "../types.ts";

export type ManagerOptions = {
  rootDir?: string;
  workspaceDir: string;
  stdActionsPrefix: string;
  executionUid: number;
  executionGid: number;
  passthroughEnv?: string[];
  loadEnv?: string[];
  env?: Record<string, string>;
  requiredEnv?: string[];
  denoBinPath?: string;
};

export class Manager {
  static async fromEnv(
    options: Partial<ManagerOptions> = {},
  ): Promise<Manager> {
    const workspaceDir = Deno.env.get("ELWOOD_RUNNER_WORKSPACE_DIR");
    const executionUid = Deno.env.get("ELWOOD_RUNNER_EXECUTION_UID");
    const executionGid = Deno.env.get("ELWOOD_RUNNER_EXECUTION_GID");
    const denoBinPath = Deno.env.get("ELWOOD_RUNNER_DENO_BIN_PATH");
    const stdActionsPrefix = Deno.env.get(EnvName.StdActionPrefix) ??
      "https://x.elwood.run/a";

    assert(workspaceDir, "ELWOOD_RUNNER_WORKSPACE_DIR not set");
    assert(
      Deno.statSync(workspaceDir)?.isDirectory,
      "Workspace dir does not exist",
    );
    assert(executionUid, "ELWOOD_RUNNER_EXECUTION_UID not set");
    assert(executionGid, "ELWOOD_RUNNER_EXECUTION_GID not set");

    return await Promise.resolve(
      new Manager({
        ...options,
        workspaceDir,
        stdActionsPrefix,
        denoBinPath,
        executionGid: Number(executionGid),
        executionUid: Number(executionUid),
      }),
    );
  }

  public readonly executions = new Map<string, Execution>();
  public readonly env = new Map<string, string>();
  public readonly reporters: Reporter[] = [];

  public get logger() {
    return logger.getLogger("elwood-runner");
  }

  #workspaceDir: Folder;
  #toolCacheDir: Folder | null = null;

  constructor(public readonly options: ManagerOptions) {
    this.#workspaceDir = new Folder(options.workspaceDir);

    // set default env options
    if (options.env) {
      Object.entries(options.env).forEach(([key, value]) => {
        this.env.set(key, value);
      });
    }

    if (options.loadEnv) {
      for (const file of options.loadEnv) {
        const file_ = isAbsolute(file)
          ? file
          : join(this.options.rootDir ?? "", file);
        const env_ = dotenv.parse(Deno.readTextFileSync(file_));

        for (const [key, value] of Object.entries(env_)) {
          this.env.set(key, value);
        }
      }
    }

    if (Array.isArray(options.passthroughEnv)) {
      for (const name of options.passthroughEnv) {
        if (Deno.env.has(name)) {
          this.env.set(name, Deno.env.get(name)!);
        }
      }
    }

    if (Array.isArray(options.requiredEnv)) {
      const missingEnv = options.requiredEnv.filter((key) => {
        return this.env.get(key) === undefined;
      });

      assert(
        missingEnv.length === 0,
        `Missing env variables ${missingEnv.join(", ")}`,
      );
    }
  }

  async destroy() {
    await Promise.all(this.reporters.map((r) => r.destroy()));
  }

  get workspaceDir(): Folder {
    return this.#workspaceDir;
  }

  get toolCacheDir(): Folder {
    assert(this.#toolCacheDir !== null, "Tool cache not prepared");
    return this.#toolCacheDir;
  }

  async addReporter<Options extends JsonObject = JsonObject>(
    reporter: Reporter,
    options: Options = {} as Options,
  ) {
    const options_ = await evaluateExpression(options, {
      env: Object.fromEntries(this.env),
    });

    reporter.setOptions(
      options_,
    );

    this.reporters.push(reporter);
  }

  async mkdir(inFolder: "workspace", ...parts: string[]): Promise<Folder> {
    switch (inFolder) {
      case "workspace":
        return await this.#workspaceDir.mkdir(...parts);
      default:
        throw new Error(`Unknown folder: ${inFolder}`);
    }
  }

  async prepare(): Promise<void> {
    this.logger.info("Preparing workspace");
    await this.mkdir("workspace");

    this.#toolCacheDir = await this.workspaceDir.mkdir("tool-cache");
  }

  async reportUpdate(type: string, data: ReporterChangeData) {
    for (const reporter of this.reporters) {
      await reporter.change(type, { ...data, at: Date.now() });
    }
  }

  async executeWorkflow(
    def: Workflow.Configuration,
    options: ExecutionOptions = {},
  ): Promise<Execution> {
    const execution = new Execution(this, def, options);

    // store the execution in the manager
    this.executions.set(execution.id, execution);

    // prepare the execution for running
    await execution.prepare();

    // send initial report to all reports
    for (const reporter of this.reporters) {
      await reporter.report(execution.getReport(), execution.def);
    }

    // continue with execution if the state is pending
    // if something failed in prepare, status will be complete
    if (execution.status === "pending") {
      await execution.execute();
    }

    // save the output
    for (const reporter of this.reporters) {
      await reporter.report(execution.getReport());
    }

    return execution;
  }

  async cleanup(): Promise<void> {
    this.logger.info("Cleaning up workspace");

    for await (const entry of Deno.readDir(this.workspaceDir.path)) {
      await Deno.remove(this.workspaceDir.join(entry.name), {
        recursive: true,
      });
    }
  }
}
