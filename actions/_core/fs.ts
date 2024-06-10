import { type FilePathOrUrl, normalize } from "./path.ts";

export async function copy(src: FilePathOrUrl, dest: FilePathOrUrl) {
  await Deno.copyFile(
    await normalize(src, { allowRemote: false }),
    await normalize(dest, { allowRemote: false }),
  );
}

export async function mkdir(path: FilePathOrUrl, recursive = true) {
  await Deno.mkdir(
    await normalize(path),
    { recursive },
  );
}

export async function rename(from: FilePathOrUrl, to: FilePathOrUrl) {
  return await Deno.rename(
    await normalize(from),
    await normalize(to),
  );
}

export async function remove(path: FilePathOrUrl, recursive = false) {
  return await Deno.remove(
    await normalize(path),
    { recursive },
  );
}
