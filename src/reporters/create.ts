import type { JsonObject, Reporter, ReporterConstructor } from "../types.ts";
import { ReporterName } from "../constants.ts";

import { FileReporter, type FileReporterOptions } from "./file.ts";
import { SupabaseReporter, type SupabaseReporterOptions } from "./supabase.ts";
import { ConsoleReporter } from "./console.ts";

export function createReporter(
  name: string,
): Reporter {
  switch (name) {
    case ReporterName.File:
      return new FileReporter();

    case ReporterName.Supabase:
      return new SupabaseReporter();

    case ReporterName.Console:
      return new ConsoleReporter();

    default: {
      throw new Error(`Unknown reporter: ${name}`);
    }
  }
}
