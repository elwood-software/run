'use client';

import {MouseEvent, useActionState, useState} from 'react';

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
import {Button} from '@/components/ui/button';
import {GoogleLogo} from '@/components/svg';

import {createClient, type OauthProvider} from '@/lib/supabase/client';

import {login, type LoginActionState} from './actions';

export function LoginForm() {
  const [client] = useState(createClient());
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [state, formAction] = useActionState<LoginActionState>(login, {
    success: null,
  });

  async function onSocialLogin(e: MouseEvent, provider: OauthProvider) {
    e.preventDefault();
    setSocialLoading(provider);

    try {
      const _ = await client.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${location.origin}/login/complete`,
        },
      });
    } catch (_) {
    } finally {
      setSocialLoading(null);
    }
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <Link href="/ffremote">
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
            <Button
              type="button"
              variant="secondary"
              loading={socialLoading === 'google'}
              onClick={e => onSocialLogin(e, 'google')}
              className="flex">
              <GoogleLogo className="size-4 mr-2" />
              Login with Google
            </Button>

            <div className="flex items-center">
              <hr className="flex-grow" />
              <div className="px-3 text-xs font-bold text-border">OR</div>
              <hr className="flex-grow" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="chip_whitley@example.com"
                required
                defaultValue={state.email}
                className="placeholder:text-muted-foreground/20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="super-secret"
                required
                defaultValue={state.password}
                className="placeholder:text-muted-foreground/20"
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
