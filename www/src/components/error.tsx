import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';

export type ErrorMessageProps = {
  message: Error | string;
};

export function ErrorMessage(props: ErrorMessageProps) {
  const message =
    typeof props.message === 'string' ? props.message : props.message.message;

  return (
    <div className="size-full flex items-center justify-center">
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
}
