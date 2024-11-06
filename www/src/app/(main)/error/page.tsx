import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';

export default function Error() {
  return (
    <div className="h-screen flex items-center justify-center">
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Your session has expired. Please log in again.
        </AlertDescription>
      </Alert>
    </div>
  );
}
