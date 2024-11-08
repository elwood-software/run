import * as zip from "jsr:@zip-js/zip-js";
import { Spinner } from "jsr:@std/cli@1.0.6/unstable-spinner";

import { assert, dirname, join } from "../../deps.ts";
import type { FFrCliContext } from "../../types.ts";
import { printError } from "../libs/error.ts";

zip.configure({
  useWebWorkers: false,
});

export default async function main(ctx: FFrCliContext) {
  const { args, storage } = ctx;
  const id = args._[1] ?? storage.lastId;
  const cwd = args.cwd ?? Deno.cwd();

  if (!id) {
    console.error("No ID provided and not run ids in state.");
    console.error("Please provide a run id");
    Deno.exit(1);
  }
  const spin = new Spinner({
    message: "Downloading outputs...",
  });

  try {
    const { downloadUrl } = await ctx.api<{ downloadUrl: string }>(
      `/run/${id}/output`,
    );

    assert(downloadUrl, "Unable to get download url");

    spin.start();
    const stream = await fetch(downloadUrl);

    assert(
      stream.ok,
      `Unable to start download from output url. Received ${stream.status} (${stream.statusText}) from the storage server`,
    );

    spin.message = "Download complete! Unpacking...";

    const reader = new zip.ZipReader(
      stream.body!,
    );

    const entries = [];

    for await (const entry of await reader.getEntries()) {
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

      spin.message = `writing ${entry.filename}...`;
    }

    spin.stop();

    console.log("Execution Outputs:");
    entries.forEach((name) => console.log(` ./${name}`));
  } catch (err) {
    spin.stop();
    printError(err);
    Deno.exit(1);
  }
}
