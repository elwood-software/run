import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { api } from "@/lib/api";

export async function GET(req: NextRequest) {
  const client = createClient();
  const { data: user } = await client.auth.getUser();

  if (!user.user?.id) {
    return NextResponse.redirect(
      new URL("/login?next_url=/stripe-setup", req.nextUrl),
    );
  }

  const { data, error } = await api.post<{ redirect_url: string }>(
    "/stripe",
  );

  console.log(data, error);

  if (!data) {
    throw new Error("no data");
  }

  return NextResponse.json(data);
}
