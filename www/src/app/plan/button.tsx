'use client';

import {useMutation} from '@tanstack/react-query';

import {Button} from '@/components/ui/button';

export function ContinueButton() {
  const {isPending, mutate} = useMutation({
    async mutationFn() {
      const response = await fetch('/plan/api');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      window.location.href = data.redirect_url;
    },
  });

  return (
    <Button
      onClick={() => mutate()}
      size="lg"
      className="font-bold w-full"
      loading={isPending}>
      Continue
    </Button>
  );
}
