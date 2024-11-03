// ASSERT
export { assert } from "jsr:@std/assert@1.0.0";
export { assertEquals } from "jsr:@std/assert@1.0.0/equals";
export { assertRejects } from "jsr:@std/assert@1.0.0/rejects";
export { assertThrows } from "jsr:@std/assert@1.0.0/throws";

// PATH
export { basename } from "jsr:@std/path@1.0.8/basename";
export { dirname } from "jsr:@std/path@1.0.8/dirname";
export { extname } from "jsr:@std/path@1.0.8/extname";
export { fromFileUrl } from "jsr:@std/path@1.0.8/from-file-url";
export { toFileUrl } from "jsr:@std/path@1.0.8/to-file-url";
export { join } from "jsr:@std/path@1.0.8/join";
export { relative } from "jsr:@std/path@1.0.8/relative";

// I/O
export { toWritableStream } from "jsr:@std/io@0.225.0/to-writable-stream";
export { copy } from "jsr:@std/io@0.225.0/copy";
export { writeAll } from "jsr:@std/io@0.225.0/write-all";

// FS
export { expandGlob } from "jsr:@std/fs@1.0.5/expand-glob";
export { ensureFile } from "jsr:@std/fs@1.0.5/ensure-file";
export { ensureDir } from "jsr:@std/fs@1.0.5/ensure-dir";

// ARCHIVE
export { Untar } from "jsr:@std/archive@0.225.4/untar";

// decode
export * as base64 from "jsr:@std/encoding@1.0.5/base64";

// crypto
export { encodeHex } from "jsr:@std/encoding@1.0.5/hex";

// this file can't be directly executed. It's only
// meant to be a short to the _core helper modules
if (import.meta.main) {
  console.error("This module should not be executed directly.");
  console.error("Only import it from another module.");
  console.error(
    "More details at: https://elwood.run/docs/errors/actions-import-mod",
  );
  Deno.exit(1);
}
