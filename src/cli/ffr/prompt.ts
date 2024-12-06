import * as tbl from "jsr:@sauber/table";

import type { FFrCliContext } from "../../types.ts";
import {
  confirm,
  dirname,
  expandGlob,
  isAbsolute,
  join,
  parseArgs,
  relative,
  type WalkEntry,
} from "../../deps.ts";

import { execute } from "./execute.ts";

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

  const data = await api<
    { success: boolean; args: string[]; explanations: Record<string, string> }
  >("/run/ffremote/ask", {
    method: "POST",
    body: JSON.stringify({
      prompt: promptStr,
      context: contextTree,
    }),
  });

  if (!data.success) {
    console.error("Error generating response!");
    Deno.exit(1);
  }

  console.log("");
  console.log(
    "%cSuccess!%c Here is what our robot came up with:",
    "font-weight:bold; color: green",
    "color:initial",
  );
  console.log("");
  console.log(
    `%cffmpeg ${data.args.join(" ")}`,
    "font-weight:bold;",
  );
  console.log("");

  const t = new tbl.Table();
  t.theme = tbl.Table.roundTheme;
  t.headers = ["Argument", "Explanation"];
  t.rows = Object.entries(data.explanations).map(([key, value]) => [
    key,
    value,
  ]);

  console.log(t.toString());

  if (
    !(await confirm({
      message: "Would you like to run this command?",
      default: true,
    }))
  ) {
    Deno.exit(0);
  }

  await execute(ctx, data.args, undefined, []);
}
