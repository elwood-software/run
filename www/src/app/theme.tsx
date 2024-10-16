'use client';

import {useEffect} from 'react';

import {useTheme} from 'next-themes';

export function Theme() {
  const {resolvedTheme} = useTheme();

  useEffect(() => {
    document.body.classList.remove('dark');
    document.body.classList.remove('light');

    if (resolvedTheme) {
      document.body.classList.add(resolvedTheme);
    }
  }, [resolvedTheme]);

  return <></>;
}
