import { basename, join } from "node:path";
import { format, increment, parse } from "jsr:@std/semver";

const __dirname = new URL(".", import.meta.url).pathname;

async function compile(src: string, dest: string) {
  console.log(`Compiling ${src} to ${dest}`);

  const cmd = new Deno.Command(Deno.execPath(), {
    cwd: join(__dirname, "../"),
    args: [
      "compile",
      "-A",
      "--unstable-worker-options",
      "--include",
      join(__dirname, "../src/libs/expression/worker.ts"),
      "--output",
      dest,
      src,
    ],
    stderr: "inherit",
    stdout: "inherit",
  });

  const result = await cmd.output();

  console.log(` > Compile Exit Code: ${result.code}`);

  if (result.code !== 0) {
    return;
  }

  const zip = new Deno.Command(Deno.execPath(), {
    cwd: join(__dirname, "../dist"),
    args: [
      "zip",
      `${basename(dest)}.zip`,
      basename(dest),
    ],
    stderr: "inherit",
    stdout: "inherit",
  });

  const zipResult = await cmd.output();

  console.log(` > Zip Exit Code: ${zipResult.code}`);

  if (zipResult.code !== 0) {
    return;
  }

  // // output
  // const output = await Deno.open(`${dest}.zip`, {
  //   create: true,
  //   write: true,
  //   read: true,
  // });

  // const source = await Deno.open(dest, { read: true });

  // const zipWriter = new zip.ZipWriter(output.writable);
  // await zipWriter.add(basename(dest), source.readable);
  // await zipWriter.close();

  await Deno.remove(dest);
}

const dest = join(__dirname, "../dist");

await Deno.mkdir(
  dest,
  { recursive: true },
);

await Promise.all([
  compile(
    join(__dirname, "../bin/cli.ts"),
    join(dest, "elwood-run"),
  ),
  compile(
    join(__dirname, "../bin/ffr.ts"),
    join(dest, "ffr"),
  ),
]);

const currentVersion =
  await (await fetch("https://elwood.run/ffremote/release/latest.txt")).text();
const nextVersion = format(increment(parse(currentVersion), "patch"));

console.log(`new_version=${nextVersion}`);
