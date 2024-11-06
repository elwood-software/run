import {RocketIcon, ExitIcon} from '@radix-ui/react-icons';
import Link from 'next/link';

import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {FFrLogo} from '@/components/ffr-logo';
import {Button} from '@/components/ui/button';

export default async function Page() {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <Link
        prefetch={false}
        href="/logout"
        className="fixed top-3 right-6 text-xs flex items-center space-x-2 border rounded px-3 py-1.5 cursor-pointer">
        <ExitIcon className="size-3" />
        <span className="font-bold">Logout</span>
      </Link>

      <div className="mb-12">
        <Link href="/ffr">
          <FFrLogo />
        </Link>
      </div>

      <Alert className="max-w-lg py-6 px-12">
        <RocketIcon className="size-6 mt-4 ml-3" />
        <AlertTitle className="font-bold text-xl">Login Complete!</AlertTitle>
        <AlertDescription>
          <p>You have been authenticated.</p>
          <p>You can close this window and return to the cli.</p>
        </AlertDescription>
      </Alert>
      <div className="flex items-center space-x-3">
        <Button asChild className="mt-6" variant="secondary">
          <Link href="/account">Your Account</Link>
        </Button>
        <Button asChild className="mt-6" variant="secondary">
          <Link href="/docs/ffremote/start">Documentation</Link>
        </Button>
      </div>
    </div>
  );
}
