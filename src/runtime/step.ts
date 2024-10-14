import type { Job } from "./job.ts";
import type { ReporterChangeData, Workflow } from "../types.ts";
import {
  resolveActionUrlForDenoCommand,
  resolveActionUrlFromDefinition,
} from "../libs/resolve-action-url.ts";
import { State } from "./state.ts";
import type { Folder } from "./folder.ts";
import {
  evaluateAndNormalizeExpression,
  normalizeExpressionResult,
} from "../libs/expression/expression.ts";
import {
  parseVariableFile,
  replaceVariablePlaceholdersInVariables,
} from "../libs/variables.ts";
import { assert, stripAnsiCode } from "../deps.ts";
import type { ExecuteDenoRunOptions } from "../libs/deno/execute.ts";
import { stepHasRun } from "../libs/config-helpers.ts";
import { StateName } from "../constants.ts";
import { denoMergePermissions } from "../libs/deno/permissions.ts";
import { evaluateWhen } from "../libs/expression/when.ts";
import { asError, toObject } from "../libs/utils.ts";

export class Step extends State {
  readonly id: string;
  readonly name: string;

  public actionUrl: URL | null = null;

  #contextDir: Folder | null = null;

  constructor(
    public readonly job: Job,
    public readonly def: Workflow.Step,
  ) {
    super();
    this.id = this.shortId("step");
    this.name = def.name ?? this.id;
  }

  get contextDir(): Folder {
    assert(this.#contextDir !== null, "Context dir not set");
    return this.#contextDir;
  }

  get logger() {
    return this.job.logger;
  }

  override getCombinedState() {
    return {
      ...super.getCombinedState(),
      definition: this.def,
    };
  }

  getContext(): Record<string, unknown> {
    return {
      vars: this.job.execution.getState(StateName.Variables, {}),
      name: this.name,
      outputs: this.getState(StateName.Outputs, {}),
      status: this.state.status,
      result: this.state.result,
    };
  }

  async evaluateExpression(expression: string): Promise<string> {
    const ctx = {
      vars: this.job.execution.getState(StateName.Variables, {}),
      env: {
        ...toObject(this.job.execution.manager.env),
        ELWOOD_BIN: this.job.execution.binDir.path,
        ELWOOD_STAGE: this.job.execution.stageDir.path,
      },
      step: this.getContext(),
      job: this.job.getContext(),
      steps: this.job.steps.reduce((acc, step) => {
        if (step.id === this.id) {
          return acc;
        }
        return {
          ...acc,
          [step.name]: step.getContext(),
        };
      }, {}),
    };

    return await evaluateAndNormalizeExpression(expression, ctx);
  }

  async prepare(): Promise<void> {
    this.onChange(async (type: string, data: ReporterChangeData) => {
      await this.job.execution.manager.reportUpdate(`step:${type}`, {
        ...data,
        execution_id: this.job.execution.id,
        tracking_id: this.job.execution.tracking_id,
        job_id: this.job.id,
        step_id: this.id,
      });
    });

    this.#contextDir = await this.job.contextDir.mkdir(this.id);
    this.actionUrl = await resolveActionUrlFromDefinition(this.def, {
      stdPrefix: this.job.execution.manager.options.stdActionsPrefix,
    });
  }

  async execute(): Promise<void> {
    assert(this.actionUrl, "Action URL not resolved");

    try {
      this.start();

      // check to see if this step should be skipped
      if ((await evaluateWhen(this.def.when, this.getContext())) === false) {
        await this.skip('Step was skipped due to "if" condition');
        return;
      }

      const outputFilePath = await this.contextDir.writeText(
        this.longId("set-output"),
        "",
      );
      const envFilePath = await this.contextDir.writeText(
        this.longId("set-env"),
        "",
      );

      const stdout_: Workflow.ReportStdOut[] = [];
      const stderr_: Workflow.ReportStdOut[] = [];

      const stdout = new WritableStream({
        write: (chunk) => {
          const text = stripAnsiCode(new TextDecoder().decode(chunk)).trim();
          this.logger.info(`  > [stdout] ${text}`);
          stdout_.push({
            timestamp: new Date().toISOString(),
            text,
          });

          this.job.execution.manager.reportUpdate("stdout", {
            at: Date.now(),
            status: this.status,
            result: this.result,
            execution_id: this.job.execution.id,
            tracking_id: this.job.execution.tracking_id,
            job_id: this.job.id,
            step_id: this.id,
            text,
          }).then();
        },
      });

      const stderr = new WritableStream({
        write: (chunk) => {
          const text = stripAnsiCode(new TextDecoder().decode(chunk)).trim();
          this.logger.error(`  > [stderr] ${text}`);
          stderr_.push({ text, timestamp: new Date().toISOString() });

          this.job.execution.manager.reportUpdate("stderr", {
            at: Date.now(),
            status: this.status,
            result: this.result,
            execution_id: this.job.execution.id,
            tracking_id: this.job.execution.tracking_id,
            job_id: this.job.id,
            step_id: this.id,
            text,
          }).then();
        },
      });

      const runFile = resolveActionUrlForDenoCommand(this.actionUrl);
      const runOptions = this.job.execution.getDenoRunOptions({
        file: runFile,
        cwd: this.contextDir.path,
        ...(await this._getDenoRunOptions({
          env: {
            ELWOOD_OUTPUT: outputFilePath,
            ELWOOD_ENV: envFilePath,
          },
        })),
      });

      this.job.execution.manager.logger.info(
        ` > running step: ${this.name}[${this.id}]`,
      );
      this.job.execution.manager.logger.info(`  > file: ${runFile}`);
      this.job.execution.manager.logger.info(
        `  > options: ${JSON.stringify(runOptions, null, 2)}`,
      );

      const result = await this.job.execution.executeDenoRun({
        ...runOptions,
        clearEnv: true,
        args: [
          "--no-check=remote",
          "-q",
          "--no-config",
          "--no-prompt",
          "--lock",
          this.job.execution.cacheDir.join("deno.lock"),
        ],
        stdout: "piped",
        stderr: "piped",
        stderrStream: stderr,
        stdoutStream: stdout,
      });

      this.setState(
        StateName.Outputs,
        await parseVariableFile(await this.contextDir.readText(outputFilePath)),
      );

      this.setState(
        StateName.Env,
        await parseVariableFile(await this.contextDir.readText(envFilePath)),
      );

      this.setState(StateName.Stdout, stdout_);
      this.setState(StateName.Stderr, stderr_);

      switch (result.code) {
        case 0: {
          await this.succeed();
          break;
        }
        default: {
          await this.fail(`Action failed with code ${result.code}`);
          await this.job.fail(`Step ${this.name} failed`);
        }
      }
    } catch (error) {
      const error_ = asError(error);
      this.logger.error(` > step failed: ${error_.message}`);
      this.logger.error(" > stack:", error_.stack);
      await this.fail(error_.message);
    } finally {
      this.stop();
    }
  }

  async _getDenoRunOptions(
    init: Omit<ExecuteDenoRunOptions, "file" | "cwd"> = {},
  ): Promise<Omit<ExecuteDenoRunOptions, "file" | "cwd">> {
    const commandInputEnv = await this._getCommandInputEnv();
    const argsFromActionUrl: Record<string, string> = {};
    const defPermissions = this.def.permissions;

    // if the action has search params
    // pass them to the action as ARG_ env variables
    if (this.actionUrl?.searchParams) {
      for (const [name, value] of this.actionUrl.searchParams.entries()) {
        argsFromActionUrl[`ARG_${name.toUpperCase()}`] = value;
      }
    }

    const env: Record<string, string> = {
      ...(init.env ?? {}),
      ...argsFromActionUrl,
      ...commandInputEnv,
      "ELWOOD_TOOL_CACHE": this.job.execution.manager.toolCacheDir.path,
      "NO_COLOR": "1",
      "HOME": this.job.execution.workingDir.path,
    };

    const runtimePermissions: Record<string, Array<string | undefined>> = {
      read: [
        init.env?.ELWOOD_ENV,
        init.env?.ELWOOD_OUTPUT,
        this.contextDir.path,
        this.job.execution.stageDir.path,
        "<CWD>",
      ],
      write: [
        init.env?.ELWOOD_ENV,
        init.env?.ELWOOD_OUTPUT,
        this.contextDir.path,
        this.job.execution.stageDir.path,
        this.job.execution.binDir.path,
      ],
      env: [
        "PATH",
        "ELWOOD_BIN",
        "ELWOOD_STAGE",
        ...Object.keys(env),
      ],
      run: [],
    };

    if (stepHasRun(this.def)) {
      env.INPUT_BIN = this.def.input?.bin ?? "deno";
      env.INPUT_SCRIPT = this.def.run;

      runtimePermissions.env.push("INPUT_BIN", "INPUT_SCRIPT");

      if (env.INPUT_BIN == "deno") {
        env.INPUT_ARGS = normalizeExpressionResult(["-q", "run", "-"]);
        runtimePermissions.env.push("INPUT_ARGS");
      }

      runtimePermissions.run!.push(env.INPUT_BIN);
    }

    return {
      ...init,
      permissions: denoMergePermissions([
        this.job.execution.def.defaults?.permissions,
        defPermissions,
      ], runtimePermissions),
      env: await replaceVariablePlaceholdersInVariables(env),
    };
  }

  async _getCommandInputEnv(): Promise<Record<string, string>> {
    const withDefinition = this.def.input ?? {};
    const inputEnv: Record<string, string> = {};

    for (const [key, value] of Object.entries(withDefinition)) {
      inputEnv[`INPUT_${key.toLocaleUpperCase()}`] = await this
        .evaluateExpression(
          value,
        );
    }

    return inputEnv;
  }
}
