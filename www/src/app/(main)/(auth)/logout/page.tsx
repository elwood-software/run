'use client';

import {createClient} from '@/lib/supabase/client';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';

export default function Page() {
  const [client] = useState(createClient());
  const router = useRouter();

  useEffect(() => {
    client.auth.signOut().finally(async () => {
      await fetch('/logout/complete');
      router.replace('/');
    });
  }, [client, router]);

  return <></>;
}
