import {redirect} from 'next/navigation';
import Link from 'next/link';

import {Button} from '@/components/ui/button';
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
import {createClient} from '@/lib/supabase/server';

import {login} from './actions';

type Props = {
  searchParams: Promise<{
    error?: string | undefined;
  }>;
};

export default async function Page(props: Props) {
  const client = createClient();
  const {data} = await client.auth.getSession();

  if (data.session?.user && !(await props.searchParams).error) {
    redirect('/login/complete');
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <form>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" name="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <Button formAction={login} className="w-full">
              Sign in
            </Button>

            <div className="mt-4 text-center text-sm">
              Need an account?{' '}
              <Link href="/signup" className="text-center text-sm underline">
                Sign Up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
