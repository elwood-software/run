import {cookies} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';

import {createClient} from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const client = await createClient();
  const apiUrl = process.env.API_URL!;
  const store = await cookies();
  const cliSession = store.get('cli-session')?.value;

  const {data: user} = await client.auth.getUser();

  if (!user?.user?.id) {
    return NextResponse.redirect(
      new URL('/login?error=login_required', req.nextUrl),
    );
  }

  if (!cliSession) {
    return NextResponse.redirect(new URL('/account', req.nextUrl));
  }

  const {data: session} = await client.auth.getSession();
  const response = await fetch(`${apiUrl}/auth/cli/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.session?.access_token}`,
    },
    body: JSON.stringify({
      cliSession,
      session: session.session,
    }),
  });

  if (!response.ok) {
    return NextResponse.rewrite(new URL('/error', req.nextUrl));
  }

  store.delete('cli-session');

  return NextResponse.redirect(new URL('/oauth/cli/done', req.nextUrl), 302);
}
