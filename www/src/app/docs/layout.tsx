import {PropsWithChildren} from 'react';
import type {Metadata} from 'next';
import Link from 'next/link';

import {FFrLogo} from '@/components/ffr-logo';
import {DocsMenu} from './menu';

export const metadata: Metadata = {
  title: {default: 'Documentation', template: '%s | Elwood Run'},
};

export default function Layout(props: PropsWithChildren) {
  return (
    <div className="h-screen w-screen grid grid-rows-[60px_auto] md:grid-cols-[300px_5fr]">
      <div className="border-b grid grid-cols-3 items-center justify-center">
        <div className="ml-6">
          <DocsMenu />
        </div>
        <div className="flex items-center justify-center font-bold font-mono">
          Documentation
        </div>
      </div>
      <div className="grow overflow-y-auto md:overflow-y-visible">
        <article className="prose dark:prose-invert lg:prose-base mx-auto w-screen md:max-w-6xl px-6 md:px-24 py-6 md:py-12">
          {props.children}
        </article>
      </div>
    </div>
  );
}
