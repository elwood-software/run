import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { api } from "@/lib/api";

export async function POST(req: NextRequest) {
  const {session_id} = await req.json();
  const client = createClient();
  const { data: user } = await client.auth.getUser();

  if (!user.user?.id) {
    return NextResponse.json({
      error: true
    })
  }

  const { data, error } = await api.post<{ redirect_url: string }>(
    `/stripe/session/${session_id}/verify`,
  );

  console.log(data, error);

  if (!data) {
    throw new Error("no data");
  }

  return NextResponse.json({
    redirect_url: ''
  });
}
