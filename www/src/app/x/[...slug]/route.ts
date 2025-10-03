export type Params = {
  params: Promise<{ slug: string[] }>;
};

export async function GET(
  request: Request,
  { params }: Params,
) {
  const { slug: slug_ } = await params;
  const slug = slug_.join("/");

  if (slug.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  if (["schema@latest.json", "schema.json", "workflow.json"].includes(slug)) {
    const resp = await fetch(
      "https://raw.githubusercontent.com/elwood-software/run/refs/heads/main/schema/workflow.json",
    );

    return new Response(resp.body!, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  if (slug.startsWith("a/")) {
    const name = slug.slice(2);

    const resp = await fetch(
      `https://raw.githubusercontent.com/elwood-software/run/refs/heads/main/actions/${name}`,
    );

    return new Response(resp.body!, {
      headers: {
        "Content-Type": "application/javascript",
      },
    });
  }

  return new Response("Not found", { status: 404 });
}

async function fetchFromGithub() {
}
