export async function GET() {
  return new Response('1', {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
