import {NextResponse, NextRequest} from 'next/server';
import {cookies} from 'next/headers';

export async function GET(request: NextRequest) {
  const session = request.nextUrl.searchParams.get('session');
  const store = await cookies();

  if (!session) {
    return NextResponse.redirect(
      new URL('/login?error=no_session', request.nextUrl.href),
    );
  }

  store.set('cli-session', session, {httpOnly: true, path: '/'});

  return NextResponse.redirect(new URL('/login', request.nextUrl.href));
}
