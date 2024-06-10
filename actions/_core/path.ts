import { assert, join } from "../deps.ts";

export type FilePathOrUrl = string | URL;

export type NormalizePathOptions = {
  allowRemote?: boolean;
};

// deno-lint-ignore require-await
export async function normalize(
  pathOrUrl: FilePathOrUrl,
  options: NormalizePathOptions = {},
): Promise<string> {
  // if the path is absolute, relative or doesn't include
  // a protocol, we can assume it's a local path
  if (
    typeof pathOrUrl === "string" && (
      pathOrUrl.startsWith("/") || pathOrUrl.startsWith(".") ||
      !pathOrUrl.includes("://")
    )
  ) {
    return pathOrUrl;
  }

  if (options.allowRemote === false && isRemote(pathOrUrl)) {
    throw new Error("Remote paths are not allowed");
  }

  const url = new URL(pathOrUrl);

  // we have a few non-standard protocols we can handle
  // stage:// or file+stage:// maps to the stage directory
  // bin:// or file+bin:// maps to the bin directory
  switch (url.protocol) {
    case "stage:":
    case "file+stage:": {
      const stageDir = Deno.env.get("ELWOOD_STAGE_DIR");
      assert(stageDir, "ELWOOD_STAGE_DIR is required");

      return join(
        stageDir,
        url.hostname,
        url.pathname,
      );
    }

    case "bin:":
    case "file+bin": {
      const binDir = Deno.env.get("ELWOOD_BIN_DIR");
      assert(binDir, "ELWOOD_BIN_DIR is required");

      return join(
        binDir,
        url.hostname,
        url.pathname,
      );
    }

    default: {
      throw new Error(`Unsupported protocol: ${url.protocol}`);
    }
  }
}

export function isRemote(pathOrUrl: FilePathOrUrl): boolean {
  const url = typeof pathOrUrl === "string" ? new URL(pathOrUrl) : pathOrUrl;
  return ["https:", "http"].includes(url.protocol);
}
