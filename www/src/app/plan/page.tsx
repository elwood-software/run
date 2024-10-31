import Link from 'next/link';

import {RocketIcon} from '@radix-ui/react-icons';

import {createClient} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';

import {ContinueButton} from './button';

export default async function Page() {
  const client = await createClient();
  const {data} = await client.auth.getUser();

  if (!data.user?.id) {
    return redirect('/login?next_url=/setup-stripe');
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="bg-secondary/20 max-w-2xl rounded border py-12 relative mt-12">
        <header className="absolute -left-0 -top-14 flex items-center justify-center w-full">
          <div className="bg-primary p-3 rounded-full">
            <RocketIcon className="size-12" />
          </div>
        </header>
        <div className="flex flex-col items-center px-8">
          <h1 className="font-bold text-5xl mb-6 mt-3">Pay As You Go</h1>
          <p className="text-muted-foreground mb-3">
            Before you can begin running jobs, you need to setup a payment
            method with our payment provider Stripe.
          </p>
          <p className="text-muted-foreground mb-12">
            No worries, you will not be charged anything until your jobs
            complete.{' '}
            <Link className="underline" href="/ffr/docs/pricing">
              Learn more about pricing
            </Link>
          </p>

          <ContinueButton />
        </div>
      </div>
    </div>
  );
}
