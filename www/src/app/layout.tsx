import type {Metadata} from 'next';
import localFont from 'next/font/local';
import {ThemeProvider} from 'next-themes';
import {Provider} from './provider';

import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Elwood Run',
  description:
    'Automate your file management. Elwood Run lets you automate your file management tasks by responding to files as they move through your system.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class">
          <Provider>{children}</Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
