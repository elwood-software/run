import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(
    "https://fly.storage.tigris.dev/elwood/big_buck_bunny_1080p_h264.mov",
  );
}
