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
  constructor(public readonly options: Options) {}

  async reportFromExecution(execution: Execution): Promise<void> {
    return await this.report(execution.getReport());
  }

  abstract report(report: Workflow.Report): Promise<void>;
  abstract change(type: string, options: ReporterChangeData): Promise<void>;
}
