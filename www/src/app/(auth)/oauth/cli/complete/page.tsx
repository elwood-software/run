import {RocketIcon} from '@radix-ui/react-icons';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {createClient} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
import {cookies} from 'next/headers';

import {FFrLogo} from '@/components/ffr-logo';
import {Logout} from './logout';
import Link from 'next/link';

export default async function Page() {
  const client = createClient();
  const apiUrl = process.env.API_URL!;
  const store = await cookies();
  const cliSession = store.get('cli-session')?.value;

  if (!cliSession) {
    return redirect('/login?error=no_session');
  }

  const {data: user} = await client.auth.getUser();

  if (!user?.user?.id) {
    return redirect('/login?error=no_login');
  }

  const {data: session} = await client.auth.getSession();
  const response = await fetch(`${apiUrl}/auth/cli/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.session?.access_token}`,
    },
    body: JSON.stringify({
      cliSession,
      session: session.session,
    }),
  });

  if (!response.ok) {
    return redirect('/login/error?error=cli_session');
  }

  const {requireStripeSetup} = await response.json();

  if (requireStripeSetup) {
    return redirect('/plan');
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <Logout />

      <div className="mb-12">
        <Link href="/ffr">
          <FFrLogo />
        </Link>
      </div>

      <Alert className="max-w-lg p-6">
        <RocketIcon className="size-6 mt-4" />
        <AlertTitle className="font-bold text-xl">Login Complete!</AlertTitle>
        <AlertDescription>
          <p>You have been authenticated.</p>
          <p>You can close this window and return to the cli.</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
