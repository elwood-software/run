import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { api } from "@/lib/api";

export async function POST(req: NextRequest) {
  const { session_id } = await req.json();
  const client = await createClient();
  const { data: user } = await client.auth.getUser();
  const cliSession = req.cookies.get("cli-session");

  if (!user.user?.id) {
    return NextResponse.json({
      error: true,
    });
  }

  const { data } = await api.post<{ complete: boolean }>(
    `/stripe/session/${session_id}/verify`,
  );

  if (!data || data?.complete === false) {
    return NextResponse.json({
      complete: false,
    });
  }

  if (cliSession) {
    return NextResponse.json({
      complete: true,
      redirect_url: new URL("/oauth/cli/complete", req.nextUrl.href),
    });
  }

  return NextResponse.json({
    complete: true,
  });
}
