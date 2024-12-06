import type { FFrCliContext } from "../../types.ts";
import {
  dirname,
  expandGlob,
  isAbsolute,
  join,
  parseArgs,
  relative,
  type WalkEntry,
} from "../../deps.ts";

export default async function main(ctx: FFrCliContext) {
  const { args, api, cwd } = ctx;
  const { _, context } = parseArgs(args.raw, {
    alias: {
      context: ["c"],
    },
    collect: ["context"],
    string: ["context"],
    default: {
      context: [],
    },
  });

  let promptStr = _.slice(1).join(" ");

  if (promptStr.length === 0) {
    promptStr = prompt("What should we ask our AI bot?") ?? "";
  }

  if (promptStr.length === 0) {
    console.log("No prompt provided");
    Deno.exit(1);
  }

  // flatten globs into
  const contextTree = (await Promise.all(context.map(async (ctx: string) => {
    return await Array.fromAsync<WalkEntry>(expandGlob(
      isAbsolute(dirname(ctx)) ? ctx : join(cwd, ctx),
      {
        includeDirs: false,
      },
    ));
  }))).reduce((acc, item) => {
    return [
      ...acc,
      ...item.map((file) => relative(cwd, file.path)),
    ];
  }, [] as string[]);

  const data = await api("/run/ffremote/ask", {
    method: "POST",
    body: JSON.stringify({
      prompt: promptStr,
      context: contextTree,
    }),
  });

  console.log(promptStr, data);
}
