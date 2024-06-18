import { Json } from "../../types.ts";

export const CHAR_FORWARD_SLASH = 47; /* / */
export const CHAR_DOT = 46; /* . */

const pathApi = _createPathApi();

// Worker API
// these functions are available in the worker's
// execution context
Object.assign(self, {
  path: pathApi,
  stageUrl(...path: string[]) {
    return `stage://${pathApi.join(...path)}`;
  },
  binUrl(...path: string[]) {
    return `bin://${pathApi.join(...path)}`;
  },
  toJson(value: Json) {
    return `json:${JSON.stringify(value)}`;
  },

  fromJson(value: string) {
    if (value.startsWith("json:")) {
      return JSON.parse(value.substring(5));
    }

    return JSON.parse(value);
  },
  join(values: string[], separator: string = ","): string {
    return values.map((str) => String(str)).join(separator);
  },
});

// instal api
// these functions are NOT available to the worker
// function and act only as a way to communicate
// with the parent
const __elwood_internal = {
  postMessage(data: unknown) {
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    self.postMessage(data);
  },
};

// listen for message events which will only
// be sent from the parent
self.addEventListener("message", (e) => {
  const event = e as MessageEvent;

  try {
    const result = (0, eval)(event.data.code);

    if (result && result.then) {
      result.then((value: unknown) => {
        __elwood_internal.postMessage({
          type: "evaluate",
          result: value,
        });
      })
        .cache((err: Error) => {
          __elwood_internal.postMessage({
            type: "error",
            error: err,
          });
        });
      return;
    }

    __elwood_internal.postMessage({
      type: result,
      result,
    });
  } catch (err) {
    __elwood_internal.postMessage({
      type: "error",
      error: err,
    });
  }
});

export function _createPathApi() {
  function assertPath(path?: string) {
    if (typeof path !== "string") {
      throw new TypeError(
        `Path must be a string. Received ${JSON.stringify(path)}`,
      );
    }
  }

  function assertArg(path: string) {
    assertPath(path);
    if (path.length === 0) return ".";
  }

  function isPosixPathSeparator(code: number): boolean {
    return code === CHAR_FORWARD_SLASH;
  }

  function stripSuffix(name: string, suffix: string): string {
    if (suffix.length >= name.length) {
      return name;
    }

    const lenDiff = name.length - suffix.length;

    for (let i = suffix.length - 1; i >= 0; --i) {
      if (name.charCodeAt(lenDiff + i) !== suffix.charCodeAt(i)) {
        return name;
      }
    }

    return name.slice(0, -suffix.length);
  }

  function lastPathSegment(
    path: string,
    isSep: (char: number) => boolean,
    start = 0,
  ): string {
    let matchedNonSeparator = false;
    let end = path.length;

    for (let i = path.length - 1; i >= start; --i) {
      if (isSep(path.charCodeAt(i))) {
        if (matchedNonSeparator) {
          start = i + 1;
          break;
        }
      } else if (!matchedNonSeparator) {
        matchedNonSeparator = true;
        end = i + 1;
      }
    }

    return path.slice(start, end);
  }

  function assertArgs(path: string, suffix: string) {
    if (path.length === 0) return path;
    if (typeof suffix !== "string") {
      throw new TypeError(
        `Suffix must be a string. Received ${JSON.stringify(suffix)}`,
      );
    }
  }

  function stripTrailingSeparators(
    segment: string,
    isSep: (char: number) => boolean,
  ): string {
    if (segment.length <= 1) {
      return segment;
    }

    let end = segment.length;

    for (let i = segment.length - 1; i > 0; i--) {
      if (isSep(segment.charCodeAt(i))) {
        end = i;
      } else {
        break;
      }
    }

    return segment.slice(0, end);
  }

  function normalizeString(
    path: string,
    allowAboveRoot: boolean,
    separator: string,
    isPathSeparator: (code: number) => boolean,
  ): string {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code: number | undefined;
    for (let i = 0; i <= path.length; ++i) {
      if (i < path.length) code = path.charCodeAt(i);
      else if (isPathSeparator(code!)) break;
      else code = CHAR_FORWARD_SLASH;

      if (isPathSeparator(code!)) {
        if (lastSlash === i - 1 || dots === 1) {
          // NOOP
        } else if (lastSlash !== i - 1 && dots === 2) {
          if (
            res.length < 2 ||
            lastSegmentLength !== 2 ||
            res.charCodeAt(res.length - 1) !== CHAR_DOT ||
            res.charCodeAt(res.length - 2) !== CHAR_DOT
          ) {
            if (res.length > 2) {
              const lastSlashIndex = res.lastIndexOf(separator);
              if (lastSlashIndex === -1) {
                res = "";
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
              }
              lastSlash = i;
              dots = 0;
              continue;
            } else if (res.length === 2 || res.length === 1) {
              res = "";
              lastSegmentLength = 0;
              lastSlash = i;
              dots = 0;
              continue;
            }
          }
          if (allowAboveRoot) {
            if (res.length > 0) res += `${separator}..`;
            else res = "..";
            lastSegmentLength = 2;
          }
        } else {
          if (res.length > 0) res += separator + path.slice(lastSlash + 1, i);
          else res = path.slice(lastSlash + 1, i);
          lastSegmentLength = i - lastSlash - 1;
        }
        lastSlash = i;
        dots = 0;
      } else if (code === CHAR_DOT && dots !== -1) {
        ++dots;
      } else {
        dots = -1;
      }
    }
    return res;
  }

  function normalize(path: string): string {
    assertArg(path);

    const isAbsolute = isPosixPathSeparator(path.charCodeAt(0));
    const trailingSeparator = isPosixPathSeparator(
      path.charCodeAt(path.length - 1),
    );

    // Normalize the path
    path = normalizeString(path, !isAbsolute, "/", isPosixPathSeparator);

    if (path.length === 0 && !isAbsolute) path = ".";
    if (path.length > 0 && trailingSeparator) path += "/";

    if (isAbsolute) return `/${path}`;
    return path;
  }

  return {
    basename(path: string, suffix = ""): string {
      assertArgs(path, suffix);

      const lastSegment = lastPathSegment(path, isPosixPathSeparator);
      const strippedSegment = stripTrailingSeparators(
        lastSegment,
        isPosixPathSeparator,
      );
      return suffix ? stripSuffix(strippedSegment, suffix) : strippedSegment;
    },
    extname(path: string): string {
      let startDot = -1;
      let startPart = 0;
      let end = -1;
      let matchedSlash = true;
      // Track the state of characters (if any) we see before our first dot and
      // after any path separator we find
      let preDotState = 0;
      for (let i = path.length - 1; i >= 0; --i) {
        const code = path.charCodeAt(i);
        if (isPosixPathSeparator(code)) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
        if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // extension
          matchedSlash = false;
          end = i + 1;
        }
        if (code === CHAR_DOT) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;
          else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
          // We saw a non-dot and non-path separator before our dot, so we should
          // have a good chance at having a non-empty extension
          preDotState = -1;
        }
      }

      if (
        startDot === -1 ||
        end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        (preDotState === 1 && startDot === end - 1 &&
          startDot === startPart + 1)
      ) {
        return "";
      }
      return path.slice(startDot, end);
    },
    dirname(path: string): string {
      assertArg(path);

      let end = -1;
      let matchedNonSeparator = false;

      for (let i = path.length - 1; i >= 1; --i) {
        if (isPosixPathSeparator(path.charCodeAt(i))) {
          if (matchedNonSeparator) {
            end = i;
            break;
          }
        } else {
          matchedNonSeparator = true;
        }
      }

      // No matches. Fallback based on provided path:
      //
      // - leading slashes paths
      //     "/foo" => "/"
      //     "///foo" => "/"
      // - no slash path
      //     "foo" => "."
      if (end === -1) {
        return isPosixPathSeparator(path.charCodeAt(0)) ? "/" : ".";
      }

      return stripTrailingSeparators(
        path.slice(0, end),
        isPosixPathSeparator,
      );
    },
    normalize,
    join(...paths: string[]): string {
      if (paths.length === 0) return ".";

      let joined: string | undefined;
      for (let i = 0; i < paths.length; ++i) {
        const path = paths[i]!;
        assertPath(path);
        if (path.length > 0) {
          if (!joined) joined = path;
          else joined += `/${path}`;
        }
      }
      if (!joined) return ".";
      return normalize(joined);
    },
  };
}
