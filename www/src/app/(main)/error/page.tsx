import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {RunLogo} from '@/components/run-logo';
import Link from 'next/link';

export default function Error() {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Link href="/" className="mb-12">
        <RunLogo className="size-32" />
      </Link>

      <Alert variant="destructive" className="w-auto bg-destructive/5 p-8">
        <AlertTitle className="font-extrabold text-xl">Fatal Error</AlertTitle>
        <AlertDescription className="text-lg">
          There was a fatal error. Please try again.
        </AlertDescription>
      </Alert>
      <a className="mt-6 text-muted" href="mailto:support@elwood.company">
        support@elwood.company
      </a>
    </div>
  );
}
