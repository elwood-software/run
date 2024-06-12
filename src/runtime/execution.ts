import { assert } from "../deps.ts";

import { Manager } from "./manager.ts";
import type { Workflow } from "../types.ts";
import { Job } from "./job.ts";
import { executeDenoCommand } from "../libs/deno/execute.ts";
import { resolveActionUrlForDenoCommand } from "../libs/resolve-action-url.ts";
import { State } from "./state.ts";
import {
  executeDenoRun,
  type ExecuteDenoRunOptions,
} from "../libs/deno/execute.ts";
import { Folder } from "./folder.ts";
import { RunnerResult, StateName } from "../constants.ts";

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
    this.manager.logger.info(`Preparing execution: ${this.id}`);

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
        this.manager.logger.info(` > preloading action: ${url}`);

        return await executeDenoCommand({
          args: ["-q", "cache", url],
          env: this.getDenoEnv(),
        });
      }),
    );

    if (results.some((item) => item.code !== 0)) {
      const names = results.map((item, i) => [actionUrls[i], item.code]).filter(
        (item) => item[1] !== 0,
      ).map((item) => item[0].toString()).join(", ");

      this.manager.logger.error(` > failed to cache action files: ${names}`);
      await this.fail(`Failed to cache action files: ${names}`);
    }
  }

  async execute(): Promise<void> {
    this.manager.logger.info(`Staring executing: ${this.id}`);

    try {
      this.start();

      for (const job of this.jobs) {
        this.manager.logger.info(
          ` > executing job: ${job.name}[${job.id}] (status=${job.status})`,
        );

        if (job.status !== "pending") {
          continue;
        }

        await job.execute();
      }

      const failedJobs = this.jobs.filter((job) =>
        job.result === RunnerResult.Failure
      );

      if (failedJobs.length > 0) {
        throw new Error(
          `Jobs ${failedJobs.map((item) => `${item.name}(${item.id})`)} failed`,
        );
      }

      this.manager.logger.info(" > succeeded");
      await this.succeed();
    } catch (error) {
      this.manager.logger.error(` > execution failed: ${error.message}`);
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

  getReport(): Workflow.Report {
    return {
      status: this.status,
      result: this.result,
      reason: this.state.reason,
      timing: this.getState(StateName.Timing),
      jobs: this.jobs.reduce((acc, job) => {
        return {
          ...acc,
          [job.name]: {
            status: job.status,
            result: job.result,
            timing: job.getState(StateName.Timing),
            steps: job.steps.reduce((acc, step) => {
              return {
                ...acc,
                [step.name]: {
                  status: step.status,
                  result: step.result,
                  reason: step.state.reason,
                  timing: step.getState(StateName.Timing),
                  outputs: step.getState(StateName.Outputs, {}),
                  stdout: step.getState(StateName.Stdout, []),
                  stderr: step.getState(StateName.Stderr, []),
                },
              };
            }, {}) as Record<string, Workflow.ReportStep>,
          },
        };
      }, {}) as Record<string, Workflow.ReportJob>,
    };
  }

  getDenoEnv(): Record<string, string> {
    return {
      DENO_DIR: this.cacheDir.join("deno"),
    };
  }

  getDenoRunOptions(options: ExecuteDenoRunOptions): ExecuteDenoRunOptions {
    const { permissions = {}, env = {}, ...opts } = options;

    return {
      ...opts,
      uid: this.manager.options.executionUid,
      gid: this.manager.options.executionGid,
      env: {
        ...env,
        ...this.getDenoEnv(),
        ELWOOD_STAGE_DIR: this.stageDir.path,
        ELWOOD_BIN_DIR: this.binDir.path,
        PATH: [
          this.binDir.path,
          "/usr/local/sbin",
          "/usr/local/bin",
          "/usr/sbin",
          "/usr/bin",
          "/sbin",
          "/bin",
          "~/.local/bin",
        ].join(":"),
      },
      permissions,
    };
  }

  async executeDenoRun(
    options: ExecuteDenoRunOptions,
  ): ReturnType<typeof executeDenoRun> {
    return await executeDenoRun(this.getDenoRunOptions(options));
  }
}
