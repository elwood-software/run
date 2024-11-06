import * as zip from "jsr:@zip-js/zip-js";
import { Spinner } from "jsr:@std/cli@1.0.6/unstable-spinner";

import { join } from "../../deps.ts";
import { state } from "../libs/state.ts";
import type { FFrCliContext } from "../../types.ts";

export default async function main(ctx: FFrCliContext) {
  const binFile = join(state.binDir, "ffremote");

  try {
    await Deno.stat(binFile);
  } catch (_) {
    console.log("");
    console.log("%cError Upgrading", "color: red");
    console.log(`Binary "ffremote" not found in "${state.binDir}".`);
    console.log("Please use the method used to install the binary to upgrade.");
    console.log("");
    Deno.exit(1);
  }

  let target = Deno.build.arch === "x86_64"
    ? "x86_64-unknown-linux-gnu"
    : "aarch64-unknown-linux-gnu";

  switch (Deno.build.os) {
    case "darwin":
      target = Deno.build.arch === "x86_64"
        ? "x86_64-apple-darwin"
        : "aarch64-apple-darwin";
      break;
    case "windows":
      target = "x86_64-pc-windows-msvc";
      break;
  }

  const latestVersionResponse = await fetch(
    "https://elwood.run/ffremote/release/latest.txt",
  );
  const latestVersion = await latestVersionResponse.text();

  if (latestVersion === ctx.version) {
    console.log("");
    console.log("%Latest Version", "color: green");
    console.log(`You are already using the latest version: ${latestVersion}`);
    console.log("");
    Deno.exit(0);
  }

  const spin = new Spinner({
    message: `Downloading latest version ${latestVersion} for ${target}...`,
  });
  spin.start();

  const downloadResponse = await fetch(
    `https://elwood.run/ffremote/release/${target}@${latestVersion}.zip`,
  );

  spin.message = "Extracting...";

  const reader = new zip.ZipReader(downloadResponse.body!);

  for await (const entry of await reader.getEntries()) {
    const out = await Deno.open(join(state.binDir, entry.filename), {
      read: true,
      write: true,
      create: true,
    });
    await entry.getData!(out.writable);
  }

  spin.stop();

  console.log("");
  console.log("%cUpgrade Complete", "color: green");
  console.log(`New version ${latestVersion}`);
  console.log(
    `%cView the changelog at: https://elwood.run/docs/ffremote/changelog#${latestVersion}`,
    "color:gray",
  );
  console.log("");

  Deno.exit(0);
}
