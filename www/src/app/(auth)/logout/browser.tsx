'use client';

import {createClient} from '@/lib/supabase/client';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';

export function BrowserLogout() {
  const [client] = useState(createClient());
  const router = useRouter();

  useEffect(() => {
    client.auth.signOut().finally(() => {
      router.replace('/');
    });
  }, [client, router]);

  return <></>;
}
