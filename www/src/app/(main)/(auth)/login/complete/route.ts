import { NextRequest, NextResponse } from "next/server";

import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  let url = "/account";
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const cliSession = req.cookies.get("cli-session");

  if (cliSession) {
    url = "/oauth/cli/complete";
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL("/error?code=oauth_error", req.nextUrl.href),
      );
    }

    // try to get their account
    try {
      const account = await api.get("/account");

      if (account.error) {
        throw account.error;
      }
    } catch (_) {
      return NextResponse.redirect(
        new URL("/signup/complete", req.nextUrl.href),
      );
    }
  }

  return NextResponse.redirect(
    new URL(url, req.nextUrl.href),
  );
}
