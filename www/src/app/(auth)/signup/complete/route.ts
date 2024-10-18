

import {api} from '@/lib/api';
import {createClient} from '@/lib/supabase/server';
import {NextRequest, NextResponse} from 'next/server';

export async function GET(req: NextRequest) {
  const client = createClient();
  const {data: user} = await client.auth.getUser();
  const cliSession = req.cookies.get('cli-session');

  if (!user.user?.id) {
    return NextResponse.redirect(
      new URL('/signup?error=no_user', req.nextUrl.href),
    );
  }

  const {data, error} = await api.post<{has_stripe_subscription: boolean}>(
    '/account',
    {
      method: 'POST',
    },
  );

  if (error) {
    console.log(error);
  }

  if (!data) {
    return NextResponse.redirect(
      new URL('/signup?error=bad', req.nextUrl.href),
    );
  }

  if (!data.has_stripe_subscription) {
    return NextResponse.redirect(new URL('/setup-stripe', req.nextUrl.href));
  }

  if (cliSession) {
    return NextResponse.redirect(
      new URL('/oauth/cli/complete', req.nextUrl.href),
    );
  }

  return NextResponse.redirect(new URL('/', req.nextUrl.href));
}
