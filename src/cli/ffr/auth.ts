import * as tbl from "jsr:@sauber/table";

import { confirm } from "../../deps.ts";
import type { FFrCliContext } from "../../types.ts";
import { state } from "../libs/state.ts";

export default async function main(ctx: FFrCliContext) {
  const { args, remoteUrl } = ctx;

  if (args._[1] === "logout") {
    await state.removeToken();
    console.log("You have been logged out.");
    Deno.exit(0);
  }

  if (args._[1] === "refresh") {
    const worked = await state.tryToRefreshToken(remoteUrl);

    if (worked) {
      console.log("Token refreshed successfully.");
      Deno.exit(0);
    } else {
      console.error("Unable to refresh token.");
      console.error("Please check your credentials and try again.");
      Deno.exit(1);
    }
  }

  try {
    const token = await state.getToken();

    if (token) {
      await printAccount(ctx);
      return;
    }
  } catch (_) {
    // ignore errors
  }

  if (
    !(await confirm({
      message: "You are not currently logged in, would you like login now?",
      default: true,
    }))
  ) {
    Deno.exit(0);
  }

  try {
    await state.provisionToken(remoteUrl);
    await printAccount(ctx);
  } catch (err) {
    console.log(err);

    console.error(
      "Unable to authenticate. Please check your credentials and try again.",
    );
  }
}

type Result = {
  display_name: string;
  orgs: Array<{
    id: string;
    has_stripe_subscription: boolean;
    name: string;
    display_name: string;
    entitlements: {
      preset: string;
      label: string;
      max_minutes_per_run: number;
      run_mins_per_day: number;
      max_runs_per_day: number;
      max_queued_per_day: number;
      max_file_upload_size: number;
      max_run_upload_size: number;
      max_upload_size_per_day: number;
      max_lifetime_runs: number;
    };
    usage: Record<string, number>;
  }>;
};

export async function printAccount(ctx: FFrCliContext): Promise<void> {
  const r = await ctx.api<Result>(`/account`);
  const org = r.orgs.shift()!;

  console.log("");
  console.log(`Hello %c${r.display_name}!`, "font-weight:bold;");
  console.log(`Organization: ${org.display_name} (${org.name})`);
  console.log("Usage Limits:");

  const t = new tbl.Table();
  t.theme = tbl.Table.roundTheme;
  t.headers = ["Limit", "Used of Available"];
  t.rows = [
    [
      "Executions Per Day",
      `${
        org.usage["max_runs_per_day"] ?? 0
      } of ${org.entitlements.max_runs_per_day}`,
    ],
    [
      "Execution Minutes Per Day",
      `${
        org.usage.run_mins_per_day ?? 0
      } of ${org.entitlements.run_mins_per_day}`,
    ],
    [
      "Queued Executions",
      `${
        org.usage["max_queued_per_day"] ?? 0
      } of ${org.entitlements.max_queued_per_day}`,
    ],
    [
      "Lifetime Executions",
      `${
        org.usage["max_lifetime_runs"] ?? 0
      } of ${org.entitlements.max_lifetime_runs}`,
    ],
  ];

  console.log(t.toString());
}
