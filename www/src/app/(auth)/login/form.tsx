'use client';

import {useActionState} from 'react';

import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';

import {FFrLogo} from '@/components/ffr-logo';
import {SubmitButton} from '@/components/submit-button';
import {Alert} from '@/components/ui/alert';

import {login, type LoginActionState} from './actions';

export function LoginForm() {
  const [state, formAction] = useActionState<LoginActionState>(login, {
    success: null,
  });

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <Link href="/">
        <FFrLogo />
      </Link>
      <form className="mt-12" action={formAction}>
        <Card className="w-full max-w-sm">
          <CardHeader className="border-b mb-6">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 my-3">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                required
                defaultValue={state.email}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                required
                defaultValue={state.password}
              />
            </div>
            <SubmitButton className="w-full">Login</SubmitButton>

            {state.success === false && (
              <Alert variant="destructive">
                There was an error logging in. Please try again.
              </Alert>
            )}
          </CardContent>
          <CardFooter className="text-center flex items-center justify-center text-muted-foreground text-xs border-t w-full py-4">
            Need an account?
            <Link href="/signup" className="underline ml-1">
              Sign Up
            </Link>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
