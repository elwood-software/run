import { basename, join } from "node:path";
import { format, increment, parse } from "jsr:@std/semver";

const __dirname = new URL(".", import.meta.url).pathname;

const appleDeveloperId = Deno.env.get("APPLE_DEVELOPER_ID");
const currentVersion =
  await (await fetch("https://elwood.run/ffremote/release/latest.txt")).text();
const nextVersion = format(increment(parse(currentVersion), "patch"));

const dist = join(__dirname, "../dist");
const versionFile = join(__dirname, "../bin/version.ts");

try {
  // clean out our dist folder
  // we don't want to leave any old files around
  // that will get pushed with the release
  await Deno.remove(dist, { recursive: true });
  await Deno.mkdir(
    dist,
    { recursive: true },
  );

  // write out our new version file
  // this will be included in the compiled binaries
  await Deno.writeTextFile(
    versionFile,
    `export default { version: "${nextVersion}" };\n`,
  );

  // generate builds for `elwood-run` and `ffr`
  await Promise.all([
    compile(
      join(__dirname, "../bin/cli.ts"),
      join(dist, "elwood-run"),
    ),
    compile(
      join(__dirname, "../bin/ffr.ts"),
      join(dist, "ffr"),
    ),
  ]);
} catch (err) {
  console.log(`%c${(err as Error).message}`, "color:red");
  Deno.exit(1);
} finally {
  // remove the version file
  await Deno.remove(versionFile);
}

async function compile(src: string, dest: string) {
  console.log(`Compiling ${src} to ${dest}`);

  const targets = [
    "aarch64-apple-darwin",
    "x86_64-apple-darwin",
    "x86_64-unknown-linux-gnu",
    "aarch64-unknown-linux-gnu",
  ];

  for (const target of targets) {
    const cmd = new Deno.Command(Deno.execPath(), {
      cwd: join(__dirname, "../"),
      args: [
        "compile",
        "-A",
        "--unstable-worker-options",
        "--include",
        join(__dirname, "../src/libs/expression/worker.ts"),
        "--include",
        versionFile,
        "--target",
        target,
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

    if (target.includes("darwin") && appleDeveloperId) {
      const sign = new Deno.Command("codesign", {
        cwd: dist,
        args: [
          "-s",
          appleDeveloperId,
          basename(dest),
        ],
        stderr: "inherit",
        stdout: "inherit",
      });

      const result = await sign.output();

      console.log(` > Sign Exit Code: ${result.code}`);

      if (result.code !== 0) {
        return;
      }
    }

    const zip = new Deno.Command("zip", {
      cwd: join(__dirname, "../dist"),
      args: [
        `${basename(dest)}-${target}.zip`,
        basename(dest),
      ],
      stderr: "inherit",
      stdout: "inherit",
    });

    const zipResult = await zip.output();

    console.log(` > Zip Exit Code: ${zipResult.code}`);

    if (zipResult.code !== 0) {
      return;
    }

    await Deno.remove(dest);
  }
}
