import {NextRequest, NextResponse} from 'next/server';
import {cookies} from 'next/headers';

import {createClient} from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const client = await createClient();
  const store = await cookies();

  store.delete('cli-session');

  await client.auth.signOut();

  return NextResponse.redirect(
    new URL('/logout/complete', req.nextUrl).toString(),
  );
}