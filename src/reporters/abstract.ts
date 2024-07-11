import { Execution } from "../runtime/execution.ts";
import type {
  JsonObject,
  Reporter,
  ReporterChangeData,
  Workflow,
} from "../types.ts";

export abstract class AbstractReporter<
  Options extends JsonObject = JsonObject,
> implements Reporter {
  options: Options = {} as Options;

  async destroy(): Promise<void> {
  }

  setOptions(options: Options): void {
    this.options = options;
  }

  async reportFromExecution(execution: Execution): Promise<void> {
    return await this.report(execution.getReport(), execution.def);
  }

  abstract report(
    report: Workflow.Report,
    configuration: Workflow.Configuration,
  ): Promise<void>;
  abstract change(type: string, options: ReporterChangeData): Promise<void>;
}
