'use client';

import {createClient} from '@/lib/supabase/client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {ExitIcon} from '@radix-ui/react-icons';

export function Logout() {
  const [client] = useState(createClient());
  const router = useRouter();

  async function logout() {
    await client.auth.signOut();
    router.replace('/');
  }

  return (
    <a
      onClick={logout}
      className="fixed top-3 right-6 text-xs flex items-center space-x-2 border rounded px-3 py-1.5 cursor-pointer">
      <ExitIcon className="size-3" />
      <span className="font-bold">Logout</span>
    </a>
  );
}
