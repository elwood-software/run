import { AbstractReporter } from "./abstract.ts";
import type { ReporterChangeData, Workflow } from "../types.ts";

export class ConsoleReporter extends AbstractReporter {
  async report(_report: Workflow.Report) {
    await Promise.resolve();
  }

  async change(_type: string, options: ReporterChangeData) {
    const tree = [
      options.tracking_id,
      options.job_id,
      options.step_id,
    ].filter(Boolean).join(".");

    if (options.text){
    console.log(`[${tree}] ${options.text}`);
  }

    await Promise.resolve();
  }
}
