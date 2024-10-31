import { S3Client, type S3ClientConfig } from "npm:@aws-sdk/client-s3@3.662.0";
import { Upload } from "npm:@aws-sdk/lib-storage@3.662.0";
import { createReadStream } from "node:fs";
import { parseArgs } from "jsr:@std/cli/parse-args";
import { Spinner } from "jsr:@std/cli@1.0.6/unstable-spinner";

import type { FFrCliContext } from "../../types.ts";
import { toAbsolute } from "../../libs/utils.ts";
import { assert, confirm } from "../../deps.ts";
import { state } from "../libs/state.ts";
import { printError } from "../libs/error.ts";

export default async function main(ctx: FFrCliContext) {
  const { args, remoteUrl, cwd } = ctx;
  const { size, include = [] } = parseArgs(args.raw, {
    string: ["size"],
    collect: ["include"],
  });
  let ffmpegArgs = args.raw;

  if (args.raw.includes("--")) {
    ffmpegArgs = args.raw.reduce((acc, item) => {
      if (item === "--") {
        return {
          found: true,
          args: [],
        };
      }

      if (acc.found) {
        acc.args.push(item);
      }

      return acc;
    }, {
      found: false,
      args: [] as string[],
    }).args;
  }

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
  const { input } = ffmpegArgs.reduce(
    (acc, item, index) => {
      // if we have an input file, push it on to
      // the array stack
      if (item === "-i") {
        acc.input.push(ffmpegArgs[index + 1]!);
      }

      return {
        input: acc.input,
      };
    },
    { input: include } as {
      input: string[];
    },
  );

  const foundFiles: Array<{ name: string; size: number }> = [];

  const spin = new Spinner({
    message: "Building execution manifest...",
  });

  spin.start();

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

      foundFiles.push({
        name: inputPath,
        size: f.size,
      });
    } catch (_) {
      spin.stop();
      const value = await confirm(
        `Unable to open file "${inputPath}" (${p}). Would you like to ignore this file?`,
        {
          default: true,
        },
      );

      if (value === false) {
        console.log("Ok. Exiting!");
        Deno.exit(1);
      }
      foundFiles.push({ name: inputPath, size: 0 });
    } finally {
      spin.start();
    }
  }

  spin.message = "Sending build manifest for compilation...";

  // we need to get sts federated token
  // that is tied to this user's storage bucket
  // we'll also let them know what files are
  // going to be uploaded
  const response = await ctx.api<
    {
      config: S3ClientConfig;
      bucket: string;
      upload: Array<[string, string]>;
      tracking_id: string;
      continue_token: string;
    }
  >(`/run/ffr`, {
    method: "POST",
    body: JSON.stringify({
      size,
      args: ffmpegArgs,
      input: foundFiles,
    }),
  });

  assert(response.config, "Missing response config");

  spin.message = "Preparing to upload files...";

  try {
    // create our sts client
    const client = new S3Client(response.config);

    // upload all the files to the dest key, which is different
    // from the fileName
    for (const [fileName, destKey] of response.upload) {
      spin.message = `Uploading ${fileName} (1%)...`;

      const upload = new Upload({
        client,
        params: {
          Bucket: response.bucket,
          Key: destKey,
          Body: createReadStream(toAbsolute(fileName, cwd)),
        },
      });

      upload.on("httpUploadProgress", (progress) => {
        const p = Math.round(
          ((progress.loaded ?? 1) / (progress.total ?? 1)) * 100,
        );
        spin.message = `Uploading ${fileName} (${p}%)...`;
      });

      const _result = await upload.done();
    }

    spin.message = "Files uploaded!";
    spin.message = "Submitting job...";
    spin.stop();

    const jobResponse = await ctx.api(`/run/ffr`, {
      method: "POST",
      body: JSON.stringify({
        continue_token: response.continue_token,
        tracking_id: response.tracking_id,
      }),
    });

    assert(jobResponse.ok, "Execution post was not ok");

    console.log("");
    console.log(`Execution Queued!! Tracking ID: ${response.tracking_id}`);
    console.log("");
    console.log(`Download Output: ffremote get ${response.tracking_id}`);
    console.log(`View Logs: ffremote watch ${response.tracking_id}`);
    console.log("");
  } catch (err) {
    printError(err);
  } finally {
    spin.stop();
  }
}
