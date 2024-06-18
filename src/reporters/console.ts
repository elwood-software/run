import { AbstractReporter } from "./abstract.ts";
import type { ReporterChangeData, Workflow } from "../types.ts";

export class ConsoleReporter extends AbstractReporter {
  async report(report: Workflow.Report) {
    console.log("REPORT", report);
  }

  async change(_type: string, _options: ReporterChangeData) {
    console.log("CHANGE", _type, _options);
  }
}
