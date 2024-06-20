import type { Reporter } from "../types.ts";
import { ReporterName } from "../constants.ts";

import { FileReporter } from "./file.ts";
import { SupabaseReporter } from "./supabase.ts";
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
