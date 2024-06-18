import type { JsonObject, Reporter } from "../types.ts";
import { ReporterName } from "../constants.ts";

import { FileReporter, type FileReporterOptions } from "./file.ts";
import { SupabaseReporter, type SupabaseReporterOptions } from "./supabase.ts";
import { ConsoleReporter } from "./console.ts";

export function createReporter(
  name: string,
  options: JsonObject,
): Reporter {
  switch (name) {
    case ReporterName.File:
      return new FileReporter(options as FileReporterOptions);

    case ReporterName.Supabase:
      return new SupabaseReporter(options as SupabaseReporterOptions);

    case ReporterName.Console:
      return new ConsoleReporter(options);

    default: {
      throw new Error(`Unknown reporter: ${name}`);
    }
  }
}
