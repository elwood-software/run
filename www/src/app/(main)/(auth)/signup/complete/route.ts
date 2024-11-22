import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const client = await createClient();
    let { data: user } = await client.auth.getUser();
    const cliSession = req.cookies.get("cli-session");
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (code) {
      const { data, error } = await client.auth.exchangeCodeForSession(
        code,
      );

      if (error) {
        return NextResponse.redirect(
          new URL("/error?code=oauth_error", req.nextUrl.href),
        );
      }

      user = data;
    }

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
      throw new Error("no_account_error");
    }

    if (!data) {
      throw new Error("no_account_data");
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
      new URL(`/error?message=${(err as Error).message}`, req.nextUrl.href),
    );
  }
}
