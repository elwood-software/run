import { CliArgs } from "../types.ts";
import { toAbsolute } from "../libs/utils.ts";

export async function ffmpeg(args: CliArgs): Promise<void> {
  // we need to clean out any of our own arguments
  // we do this by only pushing anything after ffmpeg
  const { ffmpegArgs, input } = args.raw.reduce(
    (acc, item, index) => {
      if (item === "ffmpeg") {
        return {
          hit: true,
          ffmpegArgs: [],
          input: [],
        };
      }

      if (acc.hit) {
        acc.ffmpegArgs.push(item);

        if (item === "-i") {
          acc.input.push(args.raw[index + 1]);
        }
      }

      return {
        hit: acc.hit,
        ffmpegArgs: acc.ffmpegArgs,
        input: acc.input,
      };
    },
    { hit: false, ffmpegArgs: [], input: [] } as {
      hit: boolean;
      ffmpegArgs: string[];
      input: string[];
    },
  );

  // make all the inputs absolute
  const inputs = input.map((item) => toAbsolute(item, args.cwd));

  const response = await fetch('https://api.elwood.run/ffmpeg', {
    method: 'POST',
    body: JOSN.stringify({
    args: ffmpegArgs,
    inputs: inputs,
    })
  })
  

}
