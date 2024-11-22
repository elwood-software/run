'use client';

import {useMutation} from '@tanstack/react-query';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {Button} from '@/components/ui/button';
import {useEffect, useState} from 'react';

export type ContinueButtonProps = {
  has: boolean;
};

export function ContinueButton(props: ContinueButtonProps) {
  const [showAlert, setShowAlert] = useState(false);

  const {isPending, mutate, error} = useMutation({
    async mutationFn() {
      const response = await fetch('/plan/api');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      window.location.href = data.redirect_url;
    },
  });

  useEffect(() => {
    if (error) {
      setShowAlert(true);
    }
  }, [error]);

  return (
    <>
      <Button
        onClick={() => mutate()}
        size="lg"
        className="font-bold w-full"
        loading={isPending}>
        {props.has ? 'Selected' : 'Continue'}
      </Button>
      {showAlert && (
        <AlertDialog open={true} onOpenChange={setShowAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>
                There was an error trying to initialize a subscription. Please
                try again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
