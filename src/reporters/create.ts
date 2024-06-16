import { JsonObject } from "../types.ts";

import { type Reporter } from "./abstract.ts";
import { FileReporter, type FileReporterOptions } from "./file.ts";

export function createReporter(
  name: string,
  options: JsonObject,
): Reporter {
  switch (name) {
    case "file":
      return new FileReporter(options as FileReporterOptions);
    default: {
      throw new Error(`Unknown reporter: ${name}`);
    }
  }
}
