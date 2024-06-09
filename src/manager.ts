import { Folder } from "./libs/folder.ts";
import { Execution } from "./runtime/execution.ts";
import { RunnerDefinition } from "./types.ts";

export type ManagerOptions = {
  workspaceDir: string;
  stdActionsPrefix: string;
  executionUid: number;
  executionGid: number;
};

export class Manager {
  public readonly executions = new Map<string, Execution>();

  #workspaceDir: Folder;

  constructor(public readonly options: ManagerOptions) {
    this.#workspaceDir = new Folder(options.workspaceDir);
  }

  get workspaceDir(): Folder {
    return this.#workspaceDir;
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
    await this.mkdir("workspace");
  }

  async executeDefinition(
    def: RunnerDefinition.Normalized,
  ): Promise<Execution> {
    const execution = new Execution(this, def, {});

    this.executions.set(execution.id, execution);

    await execution.prepare();

    // continue with execution if the state is pending
    // if something failed in prepare, status will be complete
    if (execution.status === "pending") {
      await execution.execute();
    }

    return execution;
  }

  async cleanup(): Promise<void> {
    for await (const [_, execution] of this.executions) {
      await execution.workingDir.remove();
    }
  }
}
