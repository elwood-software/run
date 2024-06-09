import { install } from "../_core/mod.ts";

enum Urls {
  DarwinFFmpeg = "https://evermeet.cx/ffmpeg/ffmpeg-5.1.2.zip",
  DarwinFFprobe = "https://evermeet.cx/ffmpeg/ffprobe-5.1.2.zip",
  LinuxAMD =
    "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz",
  LinuxARM =
    "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-arm64-static.tar.xz",
}

const platforms = ["darwin", "linux"];

if (import.meta.main) {
  main();
}

export async function main() {
  if (!platforms.includes(Deno.build.os)) {
    throw new Error(
      `Unsupported platform: ${Deno.build.os}. Must be ${
        Object.keys(
          platforms,
        ).join(", ")
      }`,
    );
  }

  // urls to download and install
  const urls: string[] = [];

  switch ([Deno.build.os, Deno.build.arch].join("-")) {
    case "darwin-aarch64":
    case "darwin-x86_64":
      urls.push(Urls.DarwinFFmpeg, Urls.DarwinFFprobe);
      break;
    case "linux-x86_64":
      urls.push(Urls.LinuxAMD);
      break;
    case "linux-aarch64":
      urls.push(Urls.LinuxARM);
      break;
    default:
      throw new Error(`Unsupported platform: ${Deno.build.os}`);
  }

  const i = new install.Install();

  for (const url of urls) {
    await i.extract(await i.fetch(url));
  }

  await i.findAndMove(`**/ffmpeg`, `bin://ffmpeg`);
  await i.findAndMove(`**/ffprobe`, `bin://ffprobe`);
  await i.cleanup();
}
