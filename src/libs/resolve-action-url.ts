import { basename, dirname, fromFileUrl, join } from "../deps.ts";

import type { RunnerDefinition } from "../types.ts";

export type ResolveActionUrlOptions = {
  stdPrefix: string;
};

export async function resolveActionUrl(
  action: RunnerDefinition.Step["action"],
  options: ResolveActionUrlOptions,
): Promise<URL> {
  if (action.includes("://")) {
    const url = new URL(action);

    switch (url.protocol) {
      case "bin:":
        return new URL(
          `?bin=${url.hostname}`,
          await resolveActionUrl("run", options),
        );

      default:
        return url;
    }
  }

  const base = basename(action);
  const ext = action.endsWith(".ts") ? "" : ".ts";

  return new URL(
    `${options.stdPrefix}/${join(dirname(action), `${base}${ext}`)}`,
  );
}

export function resolveActionUrlForDenoCommand(url: URL): string {
  switch (url.protocol) {
    case "file:":
      return fromFileUrl(url);
    case "http:":
    case "https:":
      return url.href;
    default:
      throw new Error(`Unsupported protocol: ${url.protocol}`);
  }
}
