import * as tbl from "jsr:@sauber/table";

import type { FFrCliContext } from "../../types.ts";

type Result = {
  id: string;
  status: string;
  result: string;
  started_at: string;
  ended_at: string;
};

export default async function main(ctx: FFrCliContext) {
  const r = await ctx.api<{ items: Result[] }>(`/run`);

  const t = new tbl.Table();
  t.theme = tbl.Table.roundTheme;
  t.headers = ["ID", "Status", "Result", "Started", "Ended"];
  t.rows = [
    ...r.items.map((r) => [
      r.id,
      r.status,
      r.result,
      r.started_at ?? "",
      r.ended_at ?? "",
    ]),
  ];

  console.log(t.toString());
}
