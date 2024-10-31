'use client';

import {useQuery} from '@tanstack/react-query';
import { useEffect, useState, use } from 'react';
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
      const response = await fetch('/plan/complete/api', {
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
    if (data?.redirect_url) {
      window.location.href = data.redirect_url;
    }
  }, [data?.redirect_url]);

  useEffect(() => {
    if (data?.complete === true) {
      setEnabled(false);
    }
  }, [data?.complete]);

  if (data?.complete === true) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <div className="bg-secondary/20 max-w-2xl rounded border py-12 relative mt-12">
          <header className="absolute -left-0 -top-14 flex items-center justify-center w-full">
            <div className="bg-primary p-3 rounded-full">
              <RocketIcon className="size-12" />
            </div>
          </header>
          <div className="flex flex-col items-center px-8">
            <h1 className="font-bold text-5xl mb-6 mt-3">Setup Complete</h1>
            <p className="text-muted-foreground mb-3">
              You are all set up and ready to go! You can now start running
              jobs.
            </p>

            <Button asChild variant="secondary" size="lg" className="mt-6">
              <Link href="/docs/ffremote/start">Getting Started</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <SymbolIcon className="size-12 animate-spin" />
      <p className="text-sm text-muted-foreground mt-3">
        Verifying Subscription
      </p>
    </div>
  );
}
