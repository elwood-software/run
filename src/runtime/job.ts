import { assert } from "../deps.ts";
import { Execution } from "./execution.ts";
import type { ReporterChangeData, Workflow } from "../types.ts";
import { State } from "./state.ts";
import { Folder } from "./folder.ts";
import { Step } from "./step.ts";
import { RunnerResult } from "../constants.ts";
import { evaluateWhen } from "../libs/expression/when.ts";

export class Job extends State {
  readonly id: string;

  readonly #steps = new Map<string, Step>();

  #contextDir: Folder | null = null;

  constructor(
    public readonly execution: Execution,
    public readonly name: string,
    public readonly def: Workflow.Job,
  ) {
    super();
    this.id = this.shortId("job");
  }

  get steps(): Step[] {
    return Array.from(this.#steps.values());
  }

  get contextDir(): Folder {
    assert(this.#contextDir !== null, "Working dir not set");
    return this.#contextDir;
  }

  get logger() {
    return this.execution.manager.logger;
  }

  async prepare(): Promise<void> {
    this.onChange(async (type: string, data: ReporterChangeData) => {
      await this.execution.manager.reportUpdate(`job:${type}`, {
        ...data,
        execution_id: this.execution.id,
        job_id: this.id,
      });
    });

    this.#contextDir = await this.execution.contextDir.mkdir(this.id);

    for (const def of this.def.steps) {
      const step = new Step(this, def);
      this.#steps.set(step.id, step);
      await step.prepare();
    }
  }

  async execute(): Promise<void> {
    this.logger.info(` > starting job ${this.name}[${this.id}]`);

    try {
      this.start();

      if ((await evaluateWhen(this.def.when, this.getContext()) === false)) {
        await this.skip("when condition is false");
        return;
      }

      for (const step of this.steps) {
        if (this.status !== "pending") {
          continue;
        }

        await step.execute();
      }

      const failedSteps = this.steps.filter((job) =>
        job.result === RunnerResult.Failure
      );

      if (failedSteps.length > 0) {
        throw new Error(
          `Job steps ${
            failedSteps.map((step) => `${step.name}[${step.id}]`).join(", ")
          } failed`,
        );
      }

      await this.succeed();
    } catch (error) {
      this.logger.error(` > job failed: ${error.message}`);
      await this.fail(error.message);
    } finally {
      this.stop();
    }
  }

  getCombinedState() {
    return {
      ...super.getCombinedState(),
      definition: this.def,
      steps: this.steps.map((step) => step.state),
    };
  }

  getContext(): Record<string, unknown> {
    return {
      status: this.state.status,
      result: this.state.result,
      steps: this.steps.reduce((acc, step) => {
        return {
          ...acc,
          [step.name]: step.getContext(),
        };
      }, {}),
    };
  }
}
