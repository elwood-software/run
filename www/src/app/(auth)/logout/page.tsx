import {createClient} from '@/lib/supabase/server';

import {BrowserLogout} from './browser';

export default async function Page() {
  const client = await createClient();

  await client.auth.signOut();

  return <BrowserLogout />;
}
