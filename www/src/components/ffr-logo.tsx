export type FFrLogoProps = {
  size?: string;
};

export function FFrLogo(props: FFrLogoProps) {
  return (
    <span
      className={`font-mono ${props.size ?? 'text-2xl'} border border-primary/20 rounded-lg py-2 px-4 text-primary bg-primary/10`}>
      /ffremote
    </span>
  );
}
