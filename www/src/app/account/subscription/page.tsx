import Link from 'next/link';
import {type Metadata} from 'next';
import {redirect} from 'next/navigation';

import {api} from '@/lib/api';
import {createClient} from '@/lib/supabase/server';
import {Button} from '@/components/ui/button';

import {ContinueButton} from './button';

export const metadata: Metadata = {
  title: 'Subscription | powered by Elwood Run',
};

export default async function Page() {
  const client = await createClient();
  const {data} = await client.auth.getUser();

  if (!data.user?.id) {
    return redirect('/login?next_url=/setup-stripe');
  }

  const account = await api.get<{
    orgs: Array<{
      id: string;
      has_stripe_subscription: boolean;
      name: string;
      display_name: string;
      entitlements: {
        preset: string;
        label: string;
        max_minutes_per_run: number;
        run_mins_per_day: number;
        max_runs_per_day: number;
        max_queued_per_day: number;
        max_file_upload_size: number;
        max_run_upload_size: number;
        max_upload_size_per_day: number;
      };
      usage: Record<string, number>;
    }>;
  }>('/account');
  const org = account.data?.orgs[0];

  return (
    <div>
      <header className="mb-12 flex items-center flex-col">
        <h1 className="text-5xl font-bold pb-1 text-center">Subscriptions</h1>
        <p className="font-thin text-xl text-muted-foreground">
          Nothing complicated... we charge based on usage.
        </p>
        <Link
          className="underline text-muted-foreground"
          href="/ffr/docs/pricing">
          Learn more
        </Link>
      </header>
      <div className="grid grid-cols-3 gap-x-3 mx-6 mb-6">
        <div className="p-6 bg-secondary rounded-t">
          <h2 className="font-bold text-xl mb-3 mt-3">Pay As You Go</h2>
          <p className="text-muted-foreground mb-6">
            Only pay for the infrastructure you use. No upfront costs or
            termination fees.
          </p>
        </div>
        <div className="p-6 bg-secondary rounded">
          <h2 className="font-bold text-xl mb-3 mt-3">Reserved</h2>
          <p className="text-muted-foreground mb-6">
            Reserve workers for a fixed monthly price. Ideal for predictable
            workloads.
          </p>
        </div>

        <div className="p-6 bg-secondary rounded">
          <h2 className="font-bold text-xl mb-3 mt-3">Enterprise</h2>
          <p className="text-muted-foreground mb-6">
            For large-scale applications with dedicated support.
          </p>
        </div>
        <div className="bg-secondary pb-6 px-6 rounded-b">
          <ContinueButton has={org?.has_stripe_subscription ?? false} />
        </div>
        <div className="bg-secondary pb-6 px-6 rounded-b">
          <Button
            size="lg"
            className="font-bold w-full"
            variant="outline"
            disabled>
            Coming Soon
          </Button>
        </div>
        <div className="bg-secondary pb-6 px-6 rounded-b">
          <Button
            size="lg"
            className="font-bold w-full"
            variant="outline"
            disabled>
            Coming Soon
          </Button>
        </div>
      </div>
    </div>
  );
}
