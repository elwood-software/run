'use client';

import {useQuery} from '@tanstack/react-query';
import {useEffect, useState, use} from 'react';
import {SymbolIcon} from '@radix-ui/react-icons';
import {RocketIcon} from '@radix-ui/react-icons';
import Link from 'next/link';
import {Button} from '@/components/ui/button';

export type Props = {
  searchParams: Promise<{
    session_id: string;
  }>;
};

export default function CompletePage(props: Props) {
  const searchParams = use(props.searchParams);
  const [enabled, setEnabled] = useState(!!searchParams.session_id);

  const {data} = useQuery({
    queryKey: ['setup-stripe', searchParams.session_id],
    enabled,
    refetchInterval: 1000 * 15,
    async queryFn() {
      const response = await fetch('/account/subscription/complete/api', {
        method: 'POST',
        body: JSON.stringify({session_id: searchParams.session_id}),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    },
  });

  useEffect(() => {
    if (data?.complete === true) {
      setEnabled(false);
    }
  }, [data?.complete]);

  if (data?.complete === true) {
    return (
      <div className="flex flex-col items-center px-8 m-6 py-12 mt-6 rounded">
        <h1 className="font-bold text-5xl mb-3 text-primary flex items-center">
          <RocketIcon className="size-10 mr-3" />
          <span>Subscription Complete</span>
        </h1>
        <p className="text-muted-foreground mb-3">
          You are all set up and ready to go! You can now start running jobs.
        </p>

        {data?.redirect_url && (
          <Button asChild size="lg" className="mt-6">
            <Link href={data?.redirect_url}>Continue</Link>
          </Button>
        )}

        {!data?.redirect_url && (
          <div className="flex items-center space-x-2">
            <Button asChild size="lg" className="mt-6 font-bold">
              <Link href="/account">Your Account</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="mt-6 font-bold">
              <Link href="/docs/ffremote/start">Getting Started</Link>
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center mt-6 pb-12">
      <SymbolIcon className="size-12 animate-spin" />
      <p className="text-sm text-muted-foreground mt-3">
        Verifying Subscription
      </p>
    </div>
  );
}
