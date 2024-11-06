import localFont from 'next/font/local';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-screen h-screen flex flex-col">
      <main className="grow overflow-auto flex w-full">{children}</main>
      <footer className="text-center text-xs text-muted-foreground opacity-20 py-2 hover:opacity-100 transition-opacity">
        &copy;{' '}
        <a className="hover:underline" href="https://elwood.company">
          Elwood Technology Company
        </a>{' '}
        --{' '}
        <a className="hover:underline" href="mailto:hello@elwood.company">
          hello@elwood.company
        </a>
      </footer>
    </div>
  );
}
