import {redirect} from 'next/navigation';

import {createClient} from '@/lib/supabase/server';
import {SignUpForm} from './form';

export const metadata = {
  title: 'Sign Up',
};

export default async function Page() {
  const client = await createClient();
  const {data} = await client.auth.getSession();

  if (data.session?.user) {
    redirect('/account');
  }

  return <SignUpForm />;
}
