import { Folder } from "./folder.ts";
import { assert, dotenv, isAbsolute, join, logger } from "../deps.ts";
import { Execution } from "./execution.ts";
import type { Reporter, ReporterChangeData, Workflow } from "../types.ts";

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
};

export class Manager {
  static async fromEnv(
    options: Partial<ManagerOptions> = {},
  ): Promise<Manager> {
    const workspaceDir = Deno.env.get("ELWOOD_RUNNER_WORKSPACE_DIR");
    const executionUid = Deno.env.get("ELWOOD_RUNNER_EXECUTION_UID");
    const executionGid = Deno.env.get("ELWOOD_RUNNER_EXECUTION_GID");
    const stdActionsPrefix = Deno.env.get("ELWOOD_RUNNER_STD_ACTIONS_PREFIX") ??
      "https://x.elwood.run";

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
  }

  get workspaceDir(): Folder {
    return this.#workspaceDir;
  }

  get toolCacheDir(): Folder {
    assert(this.#toolCacheDir !== null, "Tool cache not prepared");
    return this.#toolCacheDir;
  }

  addReporter(reporter: Reporter) {
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

    // set default env options
    if (this.options.env) {
      Object.entries(this.options.env).forEach(([key, value]) => {
        this.env.set(key, value);
      });
    }

    if (this.options.loadEnv) {
      for (const file of this.options.loadEnv) {
        const file_ = isAbsolute(file)
          ? file
          : join(this.options.rootDir ?? "", file);
        const env_ = dotenv.parse(await Deno.readTextFile(file_));

        for (const [key, value] of Object.entries(env_)) {
          this.env.set(key, value);
        }
      }
    }

    if (Array.isArray(this.options.passthroughEnv)) {
      for (const name of this.options.passthroughEnv) {
        if (Deno.env.has(name)) {
          this.env.set(name, Deno.env.get(name)!);
        }
      }
    }

    if (Array.isArray(this.options.requiredEnv)) {
      const missingEnv = this.options.requiredEnv.filter((key) => {
        return this.env.get(key) === undefined;
      });

      assert(
        missingEnv.length === 0,
        `Missing env variables ${missingEnv.join(", ")}`,
      );
    }
  }

  async reportUpdate(type: string, data: ReporterChangeData) {
    for (const reporter of this.reporters) {
      await reporter.change(type, { ...data, at: Date.now() });
    }
  }

  async executeWorkflow(
    def: Workflow.Configuration,
  ): Promise<Execution> {
    const execution = new Execution(this, def, {});

    // store the execution in the manager
    this.executions.set(execution.id, execution);

    // prepare the execution for running
    await execution.prepare();

    // send initial report to all reports
    for (const reporter of this.reporters) {
      await reporter.report(execution.getReport());
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
