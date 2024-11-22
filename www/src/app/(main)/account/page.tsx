import Link from 'next/link';
import {redirect} from 'next/navigation';
import {Info} from 'lucide-react';

import {api} from '@/lib/api';
import {createClient} from '@/lib/supabase/server';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const client = await createClient();
  const {data} = await client.auth.getUser();

  if (!data.user?.id) {
    return redirect('/login?next_url=/account');
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
        max_lifetime_runs: number;
      };
      usage: Record<string, number>;
    }>;
  }>('/account');
  const org = account.data?.orgs[0];
  const trimmedEmail = data.user.email?.trim().toLowerCase() ?? '';

  if (!org) {
    return <></>;
  }

  function num(num: number | undefined | null): string {
    if (typeof num !== 'number') {
      return '0';
    }
    return isFinite(num) ? String(num) : '~';
  }

  return (
    <div className="border-t mx-8 pb-8 mt-6">
      <dl className="divide-y divide-border">
        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt className="text-sm/6 font-bold">Email</dt>
          <dd className="mt-1 text-sm/6 sm:col-span-2 sm:mt-0">
            {trimmedEmail}
          </dd>
        </div>

        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt className="text-sm/6 font-bold">Organization</dt>
          <dd className="mt-1 text-sm/6 sm:col-span-2 sm:mt-0">
            {org.display_name}

            <small className="ml-2 text-muted-foreground">({org.name})</small>
          </dd>
        </div>

        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt className="text-sm/6 font-bold">Subscription</dt>
          <dd className="mt-1 text-sm/6 sm:col-span-2 sm:mt-0">
            {org.has_stripe_subscription ? (
              'Pay As You Go'
            ) : (
              <Link
                className="text-primary hover:underline"
                href="/account/subscription">
                Select a Subscription
              </Link>
            )}
          </dd>
        </div>

        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt className="text-sm/6 font-bold">Usage Limits</dt>
          <dd className="mt-1 text-sm/6 sm:col-span-2 sm:mt-0">
            {!org?.has_stripe_subscription && (
              <Alert variant="default">
                <Info className="size-7" />
                <AlertTitle className="flex items-center font-bold ml-3">
                  Please select a subscription
                </AlertTitle>
                <AlertDescription className="ml-3">
                  <p>
                    Before you can begin executing jobs, please setup a
                    subscription. Do not worry, you only pay for resources you
                    use.
                  </p>
                  <Button asChild className="mt-3" variant="secondary">
                    <Link href="/account/subscription">
                      Select a Subscription
                    </Link>
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {org?.has_stripe_subscription && (
              <ul
                role="list"
                className="divide-y divide-background bg-secondary rounded-md border">
                <li className="flex items-center justify-between py-2 pl-4 pr-5 text-sm/6">
                  <div className="flex w-0 flex-1 items-center">
                    <div className="flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">
                        Executions Per Day
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {org.usage['max_runs_per_day'] ?? 0} of{' '}
                    {num(org.entitlements.max_runs_per_day)}
                  </div>
                </li>
                <li className="flex items-center justify-between py-2 pl-4 pr-5 text-sm/6">
                  <div className="flex w-0 flex-1 items-center">
                    <div className="flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">
                        Execution Minutes Per Day
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {org.usage['run_mins_per_day'] ?? 0} of{' '}
                    {num(org.entitlements.run_mins_per_day)}
                  </div>
                </li>
                <li className="flex items-center justify-between py-2 pl-4 pr-5 text-sm/6">
                  <div className="flex w-0 flex-1 items-center">
                    <div className="flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">
                        Queued Executions
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {org.usage['max_queued_per_day'] ?? 0} of{' '}
                    {num(org.entitlements.max_queued_per_day)}
                  </div>
                </li>
                <li className="flex items-center justify-between py-2 pl-4 pr-5 text-sm/6">
                  <div className="flex w-0 flex-1 items-center">
                    <div className="flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">
                        Lifetime Executions
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {org.usage['max_lifetime_runs'] ?? 0} of{' '}
                    {num(org.entitlements.max_lifetime_runs)}
                  </div>
                </li>
                <li className="flex items-center justify-between py-2 pl-4 pr-5 text-sm/6">
                  <a
                    className="text-muted-foreground hover:text-foreground"
                    href="mailto:support@elwood.company">
                    Request an increase
                  </a>
                </li>
              </ul>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
