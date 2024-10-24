// ASSERT
export { assert } from "jsr:@std/assert@1.0.0";
export { assertEquals } from "jsr:@std/assert@1.0.0/equals";
export { assertRejects } from "jsr:@std/assert@1.0.0/rejects";
export { assertThrows } from "jsr:@std/assert@1.0.0/throws";

// PATH
export { basename } from "jsr:@std/path/basename";
export { dirname } from "jsr:@std/path/dirname";
export { extname } from "jsr:@std/path/extname";
export { fromFileUrl } from "jsr:@std/path/from-file-url";
export { toFileUrl } from "jsr:@std/path/to-file-url";
export { join } from "jsr:@std/path/join";
export { relative } from "jsr:@std/path/relative";

// I/O
export { toWritableStream } from "jsr:@std/io/to-writable-stream";
export { copy } from "jsr:@std/io/copy";
export { writeAll } from "jsr:@std/io/write-all";

// FS
export { expandGlob } from "jsr:@std/fs/expand-glob";
export { ensureFile } from "jsr:@std/fs/ensure-file";
export { ensureDir } from "jsr:@std/fs/ensure-dir";

// ARCHIVE
export { Untar } from "jsr:@std/archive/untar";

// decode
export * as base64 from "jsr:@std/encoding/base64";

// crypto
export { encodeHex } from "jsr:@std/encoding/hex";

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
