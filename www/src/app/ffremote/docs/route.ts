import {NextResponse, NextRequest} from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/docs/ffr', request.nextUrl.href));
}
