import Link from 'next/link';
import crypto from 'crypto';

import {api} from '@/lib/api';
import {createClient} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {BookOpen, MailQuestion} from 'lucide-react';
import {PropsWithChildren} from 'react';

export default async function Page(props: PropsWithChildren) {
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
      };
      usage: Record<string, number>;
    }>;
  }>('/account');
  const org = account.data?.orgs[0];

  if (!org) {
    return redirect('/error?error=account_not_found');
  }

  const {first_name, last_name} = data.user.user_metadata ?? {};
  const trimmedEmail = data.user.email?.trim().toLowerCase() ?? '';
  const hash = crypto.createHash('sha256').update(trimmedEmail).digest('hex');

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="bg-secondary/20 max-w-4xl w-full rounded border relative mt-12">
        <header className="absolute -left-0 -top-14 flex items-center justify-center w-full">
          <Link
            href="/account"
            className="border-4 border-primary p-3 rounded-full overflow-hidden relative size-24">
            <img
              src={`https://www.gravatar.com/avatar/${hash}?s=400x400&d=identicon`}
              alt={`profile image for ${trimmedEmail}`}
              className="absolute inset-0"
            />
          </Link>
        </header>
        <div className="px-8 pt-12 flex items-center justify-center">
          <strong className="font-bold text-3xl mt-6 text-center">
            {`Hello, ${first_name} ${last_name}`}!
          </strong>
        </div>
        <div className="w-full">{props.children}</div>
      </div>

      <footer className="pt-6 flex items-center space-x-3">
        <Button
          asChild={true}
          variant="outline"
          className="text-muted-foreground font-semibold text-xs">
          <Link href="/logout">Log out</Link>
        </Button>
        <Button asChild={true} variant="outline">
          <Link href="/docs">
            <span className="flex items-center justify-center font-semibold text-xs text-muted-foreground">
              <BookOpen className="mr-2 size-3" />
              Documentation
            </span>
          </Link>
        </Button>
        <Button asChild={true} variant="outline">
          <Link href="mailto:help@elwood.company">
            <span className="flex items-center justify-center font-semibold text-xs text-muted-foreground">
              <MailQuestion className="mr-2 size-3" />
              help@elwood.company
            </span>
          </Link>
        </Button>
      </footer>
    </div>
  );
}
