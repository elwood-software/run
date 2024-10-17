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
import {redirect} from 'next/navigation';

export type Props = {
  searchParams: {
    error?: string | undefined;
  };
};

export default async function Page(props: Props) {
  const client = createClient();
  const {data} = await client.auth.getSession();

  if (data.session?.user && !props.searchParams.error) {
    return redirect('/login/complete');
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
          <CardFooter>
            <Button formAction={login} className="w-full">
              Sign in
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}