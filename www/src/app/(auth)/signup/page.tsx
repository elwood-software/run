import {redirect} from 'next/navigation';

import {createClient} from '@/lib/supabase/server';
import {SignUpForm} from './form';

export const metadata = {
  title: 'Sign Up',
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
    redirect('/account');
  }

  return <SignUpForm />;
}
