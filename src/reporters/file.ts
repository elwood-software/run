import { Execution } from "../runtime/execution.ts";
import { Reporter } from "./abstract.ts";
import { type JsonObject } from "../types.ts";

export interface FileReporterOptions extends JsonObject {
  path: string;
}

export class FileReporter extends Reporter {
  constructor(private readonly options: FileReporterOptions) {
    super();
  }

  async report(execution: Execution): Promise<void> {
    // write data to file
    await Deno.writeTextFile(
      this.options.path,
      JSON.stringify(execution.getReport(), null, 2),
    );
  }
}
