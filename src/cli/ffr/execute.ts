import { S3Client, type S3ClientConfig } from "npm:@aws-sdk/client-s3@3.662.0";
import { Upload } from "npm:@aws-sdk/lib-storage@3.662.0";
import { createReadStream } from "node:fs";

import type { FFrArgs } from "../../types.ts";
import { toAbsolute } from "../../libs/utils.ts";
import { assert, confirm } from "../../deps.ts";
import { state } from "../state.ts";

export default async function main(args: FFrArgs) {
  const { cwd = Deno.cwd(), remoteUrl = "https://api.elwood.run" } = args;
  let token = await state.getToken();

  // if there's no token lets try to get one
  if (!token) {
    await state.provisionToken(remoteUrl);
    token = await state.getToken();
  }

  // we must have a token by now or we stop
  assert(token, "missing authorization token");

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

      // if we've already hit ffmpeg, push these
      // to the args
      if (acc.hit) {
        acc.ffmpegArgs.push(item);

        // if we have an input file, push it on to
        // the array stack
        if (item === "-i") {
          acc.input.push(args.raw[index + 1]!);
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

  const foundFiles: string[] = [];

  // make sure all of the files exist
  // if there are any missing files, push
  // them to the missing array so we can
  // ask the user
  for (const inputPath of input) {
    const p = toAbsolute(inputPath, cwd);
    try {
      const f = Deno.lstatSync(p);
      if (!f.isFile) {
        throw new Error();
      }

      foundFiles.push(inputPath);
    } catch (_) {
      const value = await confirm(
        `Unable to open file "${inputPath}" (${p}). Would you like to ignore this file?`,
      );

      if (value === false) {
        console.log("Ok. Exiting!");
        Deno.exit(1);
      }
      foundFiles.push(inputPath);
    }
  }

  // we need to get sts federated token
  // that is tied to this user's storage bucket
  // we'll also let them know what files are
  // going to be uploaded
  const response = await args.api<
    {
      config: S3ClientConfig;
      bucket: string;
      download: Array<[string, string]>;
      upload: Array<[string, string]>;
      tracking_id: string;
    }
  >(`/run/s3-credentials`, {
    method: "POST",
    body: JSON.stringify({
      input: foundFiles,
    }),
  });

  assert(response.config, "Missing response config");

  // create our sts client
  const client = new S3Client(response.config);

  // upload all the files to the dest key, which is different
  // from the fileName
  for (const [fileName, destKey] of response.upload) {
    const upload = new Upload({
      client,
      params: {
        Bucket: response.bucket,
        Key: destKey,
        Body: createReadStream(toAbsolute(fileName, cwd)),
      },
    });

    const _result = await upload.done();
  }

  const jobResponse = await args.api(`/run/ffr`, {
    method: "POST",
    body: JSON.stringify({
      tracking_id: response.tracking_id,
      args: ffmpegArgs,
      download: response.download,
    }),
  });

  assert(jobResponse.ok, "Run post was not ok");

  console.log("Run Queued!! Tracking ID: ${response.tracking_id}");
  console.log(`Download Output: ffr get ${response.tracking_id}`);
  console.log(`View Logs: ffr watch ${response.tracking_id}`);
}
