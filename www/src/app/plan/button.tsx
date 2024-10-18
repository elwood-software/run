'use client';

import {useMutation} from '@tanstack/react-query';

import {SymbolIcon} from '@radix-ui/react-icons';
import {Button} from '@/components/ui/button';

export function ContinueButton() {
  const {isPending, mutate} = useMutation({
    async mutationFn() {
      const response = await fetch('/setup-stripe/api');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      window.location.href = data.redirect_url;
    },
  });

  return (
    <Button onClick={() => mutate()} size="lg" className="font-bold w-full">
      {isPending ? <SymbolIcon className="size-4 animate-spin" /> : 'Continue'}
    </Button>
  );
}
