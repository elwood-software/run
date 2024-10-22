import { NextRequest, NextResponse } from "next/server";

export type Context = {
  params: {
    id: string;
  };
};
  
export async function GET(req:NextRequest, ctx:Context) {
  const id = ctx.params.id.replace('.zip', '');


  const response = await fetch(`https://api.github.com/repos/elwood-software/run/releases/tags/${id}`);
  const data = await response.json();
  const body = data as {
    assets: Array<{
      name:string;
      browser_download_url:string;
    }>
  };

  const asset = body.assets.find((asset) => asset.name === `ffr.zip`);

  if (!asset) {
    return NextResponse.error();
  }


  return NextResponse.redirect(asset!.browser_download_url, 302);
}
