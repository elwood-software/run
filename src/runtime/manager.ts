import { Folder } from "./folder.ts";
import { assert, logger } from "../deps.ts";
import { Execution } from "./execution.ts";
import { Workflow } from "../types.ts";
import { Reporter } from "../reporters/abstract.ts";

export type ManagerOptions = {
  workspaceDir: string;
  stdActionsPrefix: string;
  executionUid: number;
  executionGid: number;
};

export class Manager {
  static async fromEnv(): Promise<Manager> {
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
  }

  async executeWorkflow(
    def: Workflow.Configuration,
  ): Promise<Execution> {
    const execution = new Execution(this, def, {});

    this.executions.set(execution.id, execution);

    await execution.prepare();

    // continue with execution if the state is pending
    // if something failed in prepare, status will be complete
    if (execution.status === "pending") {
      await execution.execute();
    }

    // report
    for (const reporter of this.reporters) {
      await reporter.report(execution);
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
