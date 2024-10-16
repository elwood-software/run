import {RocketIcon} from '@radix-ui/react-icons';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {createClient} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
import {cookies} from 'next/headers';

import {Logout} from './logout';

export default async function Page() {
  const client = createClient();
  const apiUrl = process.env.API_URL!;
  const store = cookies();
  const cliSession = store.get('cli-session')?.value;

  if (!cliSession) {
    return redirect('/oauth/cli/login?error=no_session');
  }

  const {data: user} = await client.auth.getUser();

  if (!user?.user?.id) {
    return redirect('/oauth/cli/login?error=no_login');
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
    return redirect('/oauth/cli/login/error?error=cli_session');
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <Logout />

      <Alert className="max-w-lg p-6">
        <RocketIcon className="size-6 mt-2" />
        <AlertTitle className="font-bold">Login Complete!</AlertTitle>
        <AlertDescription>
          <p>You have been authenticated.</p>
          <p>You can close this window and return to the cli.</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
