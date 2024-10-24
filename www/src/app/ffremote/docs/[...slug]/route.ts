import {NextResponse, NextRequest} from 'next/server';

type Context = {
  params: {
    slug: string | string[];
  }
}

export async function GET(request: NextRequest, ctx:Context) {
  const _slug = Array.isArray(ctx.params.slug) ? ctx.params.slug.join('/') : ctx.params.slug;
  return NextResponse.redirect(new URL(`/docs/ffr/${_slug}`, request.nextUrl.href));
}
