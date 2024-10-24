'use client';

import {PropsWithChildren, useEffect} from 'react';
import {useTheme} from 'next-themes';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Provider(props: PropsWithChildren) {
  const {resolvedTheme} = useTheme();

  useEffect(() => {
    document.body.classList.remove('dark');
    document.body.classList.remove('light');

    if (resolvedTheme) {
      document.body.classList.add(resolvedTheme);
    }
  }, [resolvedTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
}
