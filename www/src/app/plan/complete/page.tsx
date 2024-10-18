'use client';

import {useQuery} from '@tanstack/react-query';
import {useEffect} from 'react';
import {SymbolIcon} from '@radix-ui/react-icons';

export type Props = {
  searchParams: {
    session_id: string;
  };
};

export default function CompletePage(props: Props) {
  const {isLoading, data} = useQuery({
    queryKey: ['setup-stripe', props.searchParams.session_id],
    enabled: Boolean(props.searchParams.session_id),
    refetchInterval: 1000 * 15,
    async queryFn() {
      const response = await fetch('/plan/complete/api');
      return await response.json();
    },
  });

  useEffect(() => {
    if (data?.redirect_url) {
      window.location.href = data.redirect_url;
    }
  }, [data?.redirect_url]);

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <SymbolIcon className="size-12 animate-spin" />
      <p className="text-sm text-muted-foreground mt-3">
        Verifying Subscription
      </p>
    </div>
  );
}
