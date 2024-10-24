import {NextRequest, NextResponse} from 'next/server';

export type Context = {
  params: {
    id: string;
  };
};

export async function GET(req: NextRequest, ctx: Context) {
  const [target, version] = ctx.params.id.replace('.zip', '').split('@');
  let data: unknown = {};

  if (version === 'latest') {
     const response = await fetch(
      `https://api.github.com/repos/elwood-software/run/releases/latest`,
      {
        headers: {
          Authorization: `bearer ${process.env.GH_TOKEN}`,
        },
      },
    );
    data = await response.json();
  } else {
    const response = await fetch(
      `https://api.github.com/repos/elwood-software/run/releases/tags/${version}`,
      {
        headers: {
          Authorization: `bearer ${process.env.GH_TOKEN}`,
        },
      },
    );
    data = await response.json();
  }



  const body = data as {
    assets: Array<{
      name: string;
      browser_download_url: string;
    }>;
  };

  const asset = body.assets.find(asset => asset.name === `ffr-${target}.zip`);

  if (!asset) {
    return NextResponse.error();
  }

  return NextResponse.redirect(asset!.browser_download_url, 302);
}
