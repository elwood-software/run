import { assert, join } from "../_deps.ts";

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
      const stageDir = Deno.env.get("ELWOOD_STAGE");
      assert(stageDir, "ELWOOD_STAGE is required");

      return join(
        stageDir,
        url.hostname,
        url.pathname,
      );
    }

    case "output:":
    case "file+output:": {
      const outputFilename = Deno.env.get("ELWOOD_OUTPUT");
      assert(outputFilename, "ELWOOD_OUTPUT is required");
      return outputFilename;
    }

    case "bin:":
    case "file+bin": {
      const binDir = Deno.env.get("ELWOOD_BIN");
      assert(binDir, "ELWOOD_BIN is required");

      return join(
        binDir,
        url.hostname,
        url.pathname,
      );
    }

    case "http:":
    case "https:": {
      return url.href;
    }

    default: {
      throw new Error(`Unsupported protocol: ${url.protocol}`);
    }
  }
}

export function isRemote(pathOrUrl: FilePathOrUrl): boolean {
  let url: URL | null;

  if (typeof pathOrUrl === "string") {
    if (!pathOrUrl.includes("://")) {
      return false;
    }

    url = new URL(pathOrUrl);
  } else {
    url = pathOrUrl as URL;
  }

  assert(url, "path.isRemote(): Invalid URL");

  return ["https:", "http"].includes(url.protocol);
}
