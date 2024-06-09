import { Job } from "./job.ts";
import type { RunnerDefinition } from "../types.ts";
import {
  resolveActionUrl,
  resolveActionUrlForDenoCommand,
} from "../libs/resolve-action-url.ts";
import { State } from "../libs/state.ts";
import { Folder } from "../libs/folder.ts";
import {
  evaluateExpress,
  isExpressionResultTruthy,
  makeEvaluableExpression,
} from "../libs/expression.ts";
import {
  parseVariableFile,
  replaceVariablePlaceholdersInVariables,
} from "../libs/variables.ts";

import { assert } from "../deps.ts";
import { ExecuteDenoRunOptions } from "../libs/run-deno.ts";

export class Step extends State {
  readonly id: string;
  readonly name: string;

  public actionUrl: URL | null = null;

  #contextDir: Folder | null = null;

  constructor(
    public readonly job: Job,
    public readonly def: RunnerDefinition.Step,
  ) {
    super();
    this.id = this.shortId("step");
    this.name = def.name;
  }

  get contextDir(): Folder {
    assert(this.#contextDir !== null, "Context dir not set");
    return this.#contextDir;
  }

  getCombinedState() {
    return {
      ...super.getCombinedState(),
      definition: this.def,
    };
  }

  async prepare(): Promise<void> {
    this.#contextDir = await this.job.contextDir.mkdir(this.id);

    this.actionUrl = await resolveActionUrl(this.def.action, {
      stdPrefix: this.job.execution.manager.options.stdActionsPrefix,
    });
  }

  async execute(): Promise<void> {
    assert(this.actionUrl, "Action URL not resolved");

    console.log(`Running step: ${this.name} ${this.actionUrl}`);

    try {
      this.start();

      // check to see if this step should be skipped
      const shouldSkip = !isExpressionResultTruthy(
        await evaluateExpress(makeEvaluableExpression(this.def.if)),
      );

      if (shouldSkip) {
        await this.skip('Step was skipped due to "if" condition');
        return;
      }

      const outputFilePath = await this.contextDir.writeText(
        this.shortId("set-output"),
        "",
      );
      const envFilePath = await this.contextDir.writeText(
        this.shortId("set-env"),
        "",
      );

      const result = await this.job.execution.executeDenoRun({
        ...(await this._getDenoRunOptions({
          env: {
            ELWOOD_OUTPUT: outputFilePath,
            ELWOOD_ENV: envFilePath,
          },
        })),
        file: resolveActionUrlForDenoCommand(this.actionUrl),
        cwd: this.contextDir.path,
      });

      this.setState(
        "output",
        await parseVariableFile(await this.contextDir.readText(outputFilePath)),
      );

      this.setState(
        "env",
        await parseVariableFile(await this.contextDir.readText(envFilePath)),
      );

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
      await this.fail(error.message);
    } finally {
      this.stop();
    }
  }

  async _getDenoRunOptions(
    init: Omit<ExecuteDenoRunOptions, "file" | "cwd"> = {},
  ): Promise<Omit<ExecuteDenoRunOptions, "file" | "cwd">> {
    const commandInputEnv = await this._getCommandInputEnv();
    const argsFromActionUrl: Record<string, string> = {};

    // if the action has search params
    // pass them to the action as ARG_ env variables
    if (this.actionUrl?.searchParams) {
      for (const [name, value] of this.actionUrl.searchParams.entries()) {
        argsFromActionUrl[`ARG_${name.toUpperCase()}`] = value;
      }
    }

    const env = {
      ...(init.env ?? {}),
      ...argsFromActionUrl,
      ...commandInputEnv,
    };

    // if the value is an array, merge it with the append array
    // otherwise return the value.
    function _arrayOrTrue(
      value: string[] | boolean,
      append: Array<string | undefined>,
    ): string[] | boolean {
      if (Array.isArray(value)) {
        return [
          ...value,
          ...append.filter(Boolean) as string[],
        ];
      }

      return value;
    }

    return {
      ...init,
      permissions: {
        ...this.def.permissions,
        read: _arrayOrTrue(this.def.permissions.read, [
          init.env?.ELWOOD_ENV,
          init.env?.ELWOOD_OUTPUT,
          this.contextDir.path,
          this.job.execution.stageDir.path,
          "<CWD>",
        ]),
        write: _arrayOrTrue(
          this.def.permissions.write,
          [
            init.env?.ELWOOD_ENV,
            init.env?.ELWOOD_OUTPUT,
            this.contextDir.path,
            this.job.execution.stageDir.path,
            this.job.execution.binDir.path,
          ],
        ),
        env: _arrayOrTrue(
          this.def.permissions.env,
          [...Object.keys(argsFromActionUrl), ...Object.keys(commandInputEnv)],
        ),
      },
      env: await replaceVariablePlaceholdersInVariables(env),
    };
  }

  async _getCommandInputEnv(): Promise<Record<string, string>> {
    const withDefinition = this.def.with ?? {};
    const inputEnv: Record<string, string> = {};

    for (const [key, value] of Object.entries(withDefinition)) {
      inputEnv[`INPUT_${key.toLocaleUpperCase()}`] = await evaluateExpress(
        value,
      );
    }

    return inputEnv;
  }
}
