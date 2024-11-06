export const dynamic = "force-dynamic";

export async function GET() {
  const response = await fetch(
    "https://api.github.com/repos/elwood-software/run/releases/latest",
    {
      cache: "no-cache",
      headers: {
        "Authorization": `bearer ${process.env.GH_TOKEN}`,
      },
    },
  );
  const data = await response.json();
  const latest = data as {
    tag_name: string;
  };

  return new Response(latest.tag_name, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
