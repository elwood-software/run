import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  let url = "/";
  const cliSession = req.cookies.get("cli-session");

  if (cliSession) {
    url = "/oauth/cli/complete";
  }

  return NextResponse.redirect(
    new URL(url, req.nextUrl.href),
  );
}
