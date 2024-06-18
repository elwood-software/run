import { AbstractReporter } from "./abstract.ts";
import type {
  JsonObject,
  Reporter,
  ReporterChangeData,
  Workflow,
} from "../types.ts";

export interface FileReporterOptions extends JsonObject {
  path: string;
}

export class FileReporter extends AbstractReporter<FileReporterOptions>
  implements Reporter {
  async report(report: Workflow.Report): Promise<void> {
    // write data to file
    await Deno.writeTextFile(
      this.options.path.replace("{id}", report.id),
      JSON.stringify(report, null, 2),
    );
  }

  async change(_type: string, _options: ReporterChangeData): Promise<void> {
  }
}
