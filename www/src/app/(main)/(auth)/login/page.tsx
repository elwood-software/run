import {redirect} from 'next/navigation';

import {createClient} from '@/lib/supabase/server';

import {LoginForm} from './form';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Login',
};

type Props = {
  searchParams: Promise<{
    error?: string | undefined;
  }>;
};

export default async function Page(props: Props) {
  const client = await createClient();
  const {data} = await client.auth.getSession();

  if (data.session?.user && !(await props.searchParams).error) {
    redirect('/login/complete');
  }

  return <LoginForm />;
}
