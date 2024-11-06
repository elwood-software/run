import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const client = await createClient();
    const { data: user } = await client.auth.getUser();
    const cliSession = req.cookies.get("cli-session");

    if (!user.user?.id) {
      throw new Error("no_user");
    }

    const { data, error } = await api.post<
      { has_stripe_subscription: boolean }
    >(
      "/account",
      {
        method: "POST",
      },
    );

    if (error) {
      console.log(error);
      throw new Error("bad_error");
    }

    if (!data) {
      throw new Error("bad_data");
    }

    if (!data.has_stripe_subscription) {
      return NextResponse.redirect(new URL("/plan", req.nextUrl.href));
    }

    if (cliSession) {
      return NextResponse.redirect(
        new URL("/oauth/cli/complete", req.nextUrl.href),
      );
    }

    return NextResponse.redirect(new URL("/account", req.nextUrl.href));
  } catch (err) {
    console.log(err);
    return NextResponse.redirect(
      new URL(`/signup?error=${(err as Error).message}`, req.nextUrl.href),
    );
  }
}
