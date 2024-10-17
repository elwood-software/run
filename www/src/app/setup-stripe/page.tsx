import Link from 'next/link';

import {FFrLogo} from '@/components/ffr-logo';
import {StripeLogo} from '@/components/svg';
import {Button} from '@/components/ui/button';
import {createClient} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';

export default async function Page() {
  const client = createClient();
  const {data} = await client.auth.getUser();

  if (!data.user?.id) {
    return redirect('/login?next_url=/setup-stripe');
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="mb-12">
        <Link href="/ffr">
          <FFrLogo />
        </Link>
      </div>
      <div className="bg-secondary/20 max-w-2xl rounded border px-8 py-12">
        <header className="flex items-start">
          <div className="bg-[#6772e5] p-3 rounded-xl mr-8">
            <StripeLogo className="fill-foreground size-12" />
          </div>
          <div>
            <h1 className="font-bold text-3xl mb-3">Connect to Stripe</h1>
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

            <Button asChild size="lg" className="font-bold w-full">
              <Link href="/setup-stripe/continue">Continue</Link>
            </Button>
          </div>
        </header>
      </div>
    </div>
  );
}
