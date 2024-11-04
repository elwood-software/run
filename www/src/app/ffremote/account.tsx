'use client';

import {Button} from '@/components/ui/button';
import {createClient} from '@/lib/supabase/client';
import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';
import Link from 'next/link';
import {cn} from '@/lib/utils';

export function AccountButton() {
  const [client] = useState(createClient());

  const {data, isLoading} = useQuery({
    queryKey: ['account'],
    queryFn: async () => {
      const {data, error} = await client.auth.getUser();

      if (error) {
        return {
          email: null,
        };
      }

      return {
        email: data.user.email,
      };
    },
  });

  return (
    <div
      className={cn(
        'transition-opacity opacity-0',
        !isLoading && 'opacity-100',
      )}>
      {data?.email && (
        <Button asChild variant="outline" size="sm">
          <Link href="/account" className="text-muted-foreground">
            {data.email}
          </Link>
        </Button>
      )}
      {!data?.email && (
        <Button asChild variant="outline" size="sm">
          <Link href="/login" className="text-muted-foreground">
            Login
          </Link>
        </Button>
      )}
    </div>
  );
}
