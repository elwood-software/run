'use client';

import {useActionState, useState, type MouseEvent} from 'react';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {FFrLogo} from '@/components/ffr-logo';
import {SubmitButton} from '@/components/submit-button';
import {Button} from '@/components/ui/button';
import {GoogleLogo} from '@/components/svg';

import {createClient, type OauthProvider} from '@/lib/supabase/client';

import {signup, type SignupActionState} from './actions';

export const metadata = {
  title: 'Sign Up',
};

export function SignUpForm() {
  const [client] = useState(createClient());
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [state, formAction] = useActionState<SignupActionState>(signup, {
    success: null,
  });

  async function onSocialLogin(e: MouseEvent, provider: OauthProvider) {
    e.preventDefault();
    setSocialLoading(provider);

    try {
      const _ = await client.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${location.origin}/signup/complete`,
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
            <CardTitle className="text-xl">Sign Up</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div>
                <Button
                  type="button"
                  variant="secondary"
                  loading={socialLoading === 'google'}
                  onClick={e => onSocialLogin(e, 'google')}
                  className="flex mb-6 w-full">
                  <GoogleLogo className="size-4 mr-2" />
                  Sign Up with Google
                </Button>

                <div className="flex items-center">
                  <hr className="grow" />
                  <div className="px-3 text-xs font-bold text-border">OR</div>
                  <hr className="grow" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input
                    id="first-name"
                    placeholder="Chip"
                    name="first_name"
                    required
                    defaultValue={state.first_name}
                    className="placeholder:text-muted-foreground/20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input
                    id="last-name"
                    placeholder="Whitley"
                    name="last_name"
                    defaultValue={state.last_name}
                    required
                    className="placeholder:text-muted-foreground/20"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="chip_whitley@example.com"
                  name="email"
                  defaultValue={state.email}
                  required
                  className="placeholder:text-muted-foreground/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="not-chip-whitley"
                  defaultValue={state.password}
                  className="placeholder:text-muted-foreground/20"
                />
              </div>
              <SubmitButton type="submit" className="w-full">
                Create an account
              </SubmitButton>
            </div>
          </CardContent>
          <CardFooter className="text-center flex items-center justify-center text-muted-foreground text-xs border-t w-full py-4">
            Already have an account?
            <Link href="/login" className="underline ml-1">
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
