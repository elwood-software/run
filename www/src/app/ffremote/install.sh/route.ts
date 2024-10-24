export async function GET() {
  const response = await fetch(
    'https://raw.githubusercontent.com/elwood-software/run/refs/heads/main/install-ffr.sh',
  );

  return new Response(await response.text(), {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
