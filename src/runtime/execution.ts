import { assert } from "../deps.ts";

import { Manager } from "./manager.ts";
import type { Workflow } from "../types.ts";
import { Job } from "./job.ts";
import { executeDenoCommand } from "../libs/run-deno.ts";
import { resolveActionUrlForDenoCommand } from "../libs/resolve-action-url.ts";
import { State } from "../libs/state.ts";
import {
  executeDenoRun,
  type ExecuteDenoRunOptions,
} from "../libs/run-deno.ts";
import { Folder } from "../libs/folder.ts";

export type ExecutionOptions = unknown;

export class Execution extends State {
  readonly id: string;
  readonly name = "execution";
  readonly #jobs = new Map<string, Job>();

  #workingDir: Folder | null = null;
  #contextDir: Folder | null = null;
  #stageDir: Folder | null = null;
  #cacheDir: Folder | null = null;
  #binDir: Folder | null = null;

  constructor(
    public readonly manager: Manager,
    public readonly def: Workflow.Configuration,
    public readonly options: ExecutionOptions,
  ) {
    super();
    this.id = this.shortId("execution");
  }

  get jobs(): Job[] {
    return Array.from(this.#jobs.values());
  }

  get workingDir(): Folder {
    assert(this.#workingDir !== null, "Execution not prepared");
    return this.#workingDir;
  }

  get stageDir(): Folder {
    assert(this.#stageDir !== null, "Execution not prepared");
    return this.#stageDir;
  }
  get cacheDir(): Folder {
    assert(this.#cacheDir !== null, "Execution not prepared");
    return this.#cacheDir;
  }

  get contextDir(): Folder {
    assert(this.#contextDir !== null, "Execution not prepared");
    return this.#contextDir;
  }

  get binDir(): Folder {
    assert(this.#binDir !== null, "Execution not prepared");
    return this.#binDir;
  }

  async prepare(): Promise<void> {
    this.#workingDir = await this.manager.mkdir("workspace", this.id);
    this.#contextDir = await this.workingDir.mkdir("context");
    this.#stageDir = await this.workingDir.mkdir("stage");
    this.#cacheDir = await this.workingDir.mkdir("cache");
    this.#binDir = await this.workingDir.mkdir("bin");

    await this.workingDir.writeText(
      "definition.json",
      JSON.stringify(this.def, null, 2),
    );

    const actionUrls: URL[] = [];

    for (const [name, def] of Object.entries(this.def.jobs)) {
      const job = new Job(this, name, def);
      this.#jobs.set(job.id, job);
      await job.prepare();

      // loop through each job step and compile a list of action URLs
      for (const step of job.steps) {
        actionUrls.push(step.actionUrl!);
      }
    }

    const uniqueActionUrls = [
      ...new Set(actionUrls.map(resolveActionUrlForDenoCommand)),
    ];

    // cache each action file
    const results = await Promise.all(
      uniqueActionUrls.map(async (url) => {
        console.log(`Preloading action: ${url}`);

        return await executeDenoCommand({
          args: ["cache", url],
          env: this.getDenoEnv(),
        });
      }),
    );

    if (results.some((item) => item.code !== 0)) {
      const names = results.map((item, i) => [actionUrls[i], item.code]).filter(
        (item) => item[1] !== 0,
      ).map((item) => item[0].toString()).join(", ");

      await this.fail(`Failed to cache action files: ${names}`);
    }
  }

  async execute(): Promise<void> {
    console.log(`Executing: ${this.id}`);

    try {
      this.start();

      for (const job of this.jobs) {
        if (job.status !== "pending") {
          continue;
        }

        await job.execute();
      }

      console.log("done jobs");

      const hasFailure = this.jobs.some((job) => job.result === "failure");

      if (hasFailure) {
        await this.fail("Execution failed");
        return;
      }

      await this.succeed();
    } catch (error) {
      await this.fail(error.message);
    } finally {
      this.stop();
    }
  }

  getCombinedState() {
    return {
      ...super.getCombinedState(),
      jobs: this.jobs.map((job) => job.getCombinedState()),
    };
  }

  getContext() {
    return {
      status: this.state.status,
      result: this.state.result,
    };
  }

  getDenoEnv(): Record<string, string> {
    return {
      DENO_DIR: this.cacheDir.join("deno"),
    };
  }

  async executeDenoRun(
    options: ExecuteDenoRunOptions,
  ): ReturnType<typeof executeDenoRun> {
    const { permissions = {}, env = {}, ...opts } = options;

    return await executeDenoRun({
      ...opts,
      uid: this.manager.options.executionUid,
      gid: this.manager.options.executionGid,
      env: {
        ...env,
        ...this.getDenoEnv(),
        ELWOOD_STAGE_DIR: this.stageDir.path,
        ELWOOD_BIN_DIR: this.binDir.path,
        PATH: [
          "/usr/local/sbin",
          "/usr/local/bin",
          "/usr/sbin",
          "/usr/bin",
          "/sbin",
          "/bin",
          this.binDir.path,
        ].join(":"),
      },
      permissions,
    });
  }
}
