import * as zip from "jsr:@zip-js/zip-js";

import { assert, dirname, join } from "../../deps.ts";
import type { FFrCliContext } from "../../types.ts";

export default async function main(ctx: FFrCliContext) {
  const { args, storage } = ctx;
  const id = args._[1] ?? storage.lastId;
  const cwd = args.cwd ?? Deno.cwd();

  if (!id) {
    console.error("No ID provided and not run ids in state.");
    console.error("Please provide a run id");
    Deno.exit(1);
  }

  const { downloadUrl } = await ctx.api<{ downloadUrl: string }>(
    `/run/${id}/output`,
  );

  assert(downloadUrl, "Unable to get download url");

  const stream = await fetch(downloadUrl);

  assert(stream.ok, "Unable to download from output url");

  const reader = new zip.ZipReader(
    stream.body!,
  );

  const entries = [];

  for (const entry of await reader.getEntries()) {
    if (entry.directory) {
      continue;
    }

    const dest = join(cwd, entry.filename);
    await Deno.mkdir(dirname(dest), { recursive: true });
    const out = await Deno.open(dest, {
      read: true,
      write: true,
      create: true,
    });
    await entry.getData!(out.writable);
    entries.push(entry.filename);
  }

  console.log("Outputs:");
  entries.forEach((name) => console.log(` ./${name}`));
}
