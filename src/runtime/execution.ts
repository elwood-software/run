import { assert, dirname } from "../deps.ts";

import type { Manager } from "./manager.ts";
import type { JsonObject, ReporterChangeData, Workflow } from "../types.ts";
import { Job } from "./job.ts";
import { executeDenoCommand } from "../libs/deno/execute.ts";
import { resolveActionUrlForDenoCommand } from "../libs/resolve-action-url.ts";
import { State } from "./state.ts";
import {
  executeDenoRun,
  type ExecuteDenoRunOptions,
} from "../libs/deno/execute.ts";
import type { Folder } from "./folder.ts";
import { RunnerResult, StateName } from "../constants.ts";
import { evaluateWhen } from "../libs/expression/when.ts";
import { asError } from "../libs/utils.ts";

export type ExecutionOptions = {
  tracking_id?: string;
  variables?: JsonObject;
  secrets?: Record<string, string>;
};

export class Execution extends State {
  readonly id: string;
  readonly name: string;
  readonly #jobs = new Map<string, Job>();

  #tracking_id: string = crypto.randomUUID();
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
    this.#tracking_id = options.tracking_id ?? this.#tracking_id;
    this.name = this.def.name ?? this.id;
  }

  get jobs(): Job[] {
    return Array.from(this.#jobs.values());
  }

  get tracking_id(): string {
    return this.#tracking_id;
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
    this.onChange(async (type: string, data: ReporterChangeData) => {
      await this.manager.reportUpdate(`execution:${type}`, {
        ...data,
        tracking_id: this.tracking_id,
        execution_id: this.id,
      });
    });

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

    this.setState(StateName.Variables, this.options.variables ?? {});

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

    await this.cacheDir.mkdir("deno");

    // cache each action file
    const results = await Promise.all(
      uniqueActionUrls.map(async (url) => {
        this.manager.logger.info(` > preloading action: ${url}`);

        return await executeDenoCommand({
          args: [
            "cache",
            "-q",
            "--no-check",
            "--no-config",
            "--lock",
            this.cacheDir.join("deno.lock"),
            url,
          ],
          env: this.getDenoEnv(),
          retry: true,
          denoBinPath: this.manager.options.denoBinPath,
        });
      }),
    );

    if (results.some((item) => item.code !== 0)) {
      const names = results.map((item, i) => [actionUrls[i], item.code]).filter(
        (item) => item[1] !== 0,
      ).map((item) => item[0]!.toString()).join(", ");

      this.manager.logger.error(` > failed to cache action files: ${names}`);
      await this.fail(`Failed to cache action files: ${names}`);
    }
  }

  async execute(): Promise<void> {
    this.manager.logger.info(`Staring executing: ${this.id}`);

    try {
      this.start();

      if ((await evaluateWhen(this.def.when, this.getContext())) === false) {
        await this.skip("when condition is false");
        return;
      }

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
      const error_ = asError(error);

      this.manager.logger.error(` > execution failed: ${error_.message}`);
      await this.fail(error_.message);
    } finally {
      await this.workingDir.writeText(
        "report.json",
        JSON.stringify(this.getReport(), null, 2),
      );

      this.stop();
    }
  }

  override getCombinedState() {
    return {
      ...super.getCombinedState(),
      jobs: this.jobs.map((job) => job.getCombinedState()),
    };
  }

  getContext() {
    return {
      status: this.state.status,
      result: this.state.result,
      env: Object.fromEntries(this.manager.env.entries()),
      vars: this.getState(StateName.Variables) ?? {},
    };
  }

  getReport(): Workflow.Report {
    return {
      id: this.id,
      name: this.name,
      tracking_id: this.tracking_id,
      status: this.status,
      result: this.result,
      reason: this.state.reason,
      timing: this.getState(StateName.Timing),
      jobs: this.jobs.reduce((acc, job) => {
        return {
          ...acc,
          [job.name]: {
            id: job.id,
            name: job.name,
            status: job.status,
            result: job.result,
            timing: job.getState(StateName.Timing),
            steps: job.steps.map((step) => {
              return {
                id: step.id,
                name: step.name,
                status: step.status,
                result: step.result,
                reason: step.state.reason,
                timing: step.getState(StateName.Timing),
                outputs: step.getState(StateName.Outputs, {}),
                stdout: step.getState(StateName.Stdout, []),
                stderr: step.getState(StateName.Stderr, []),
              };
            }),
          },
        };
      }, {}) as Record<string, Workflow.ReportJob>,
    };
  }

  getDenoEnv(): Record<string, string> {
    return {
      HOME: this.workingDir.path,
      DENO_DIR: this.cacheDir.join("deno"),
    };
  }

  getDenoRunOptions(options: ExecuteDenoRunOptions): ExecuteDenoRunOptions {
    const { permissions = {}, env = {}, ...opts } = options;

    return {
      ...opts,
      env: {
        ...env,
        ...this.getDenoEnv(),
        ...Array.from(this.manager.env.entries()).reduce(
          (acc, [key, value]) => {
            return {
              ...acc,
              [key]: value,
            };
          },
          {},
        ),
        ELWOOD_STAGE: this.stageDir.path,
        ELWOOD_BIN: this.binDir.path,
        ELWOOD_TOOL_CACHE: this.manager.toolCacheDir.path,
        PATH: [
          this.manager.options.denoBinPath &&
          dirname(this.manager.options.denoBinPath),
          "/elwood/run/runner/bin",
          this.binDir.path,
          "/usr/local/sbin",
          "/usr/local/bin",
          "/usr/sbin",
          "/usr/bin",
          "/sbin",
          "/bin",
          this.workingDir.join(".local", "bin"),
        ].filter(Boolean).join(":"),
      },
      permissions,
      denoBinPath: this.manager.options.denoBinPath,
    };
  }

  async executeDenoRun(
    options: ExecuteDenoRunOptions,
  ): ReturnType<typeof executeDenoRun> {
    return await executeDenoRun(this.getDenoRunOptions(options));
  }
}
