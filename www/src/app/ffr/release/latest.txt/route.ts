export async function GET() {
  const response = await fetch('https://api.github.com/repos/elwood-software/run/releases/latest');
  const data = await response.json();
  const latest = data as {
    tag_name: string;
  };

  return new Response(latest.tag_name, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}