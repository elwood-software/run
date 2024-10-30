import {PropsWithChildren} from 'react';
import type {Metadata} from 'next';

import {DocsMenu} from './menu';

export const metadata: Metadata = {
  title: {default: 'Documentation', template: '%s | Elwood Run'},
};

export default function Layout(props: PropsWithChildren) {
  return (
    <div className="h-screen w-full grid grid-cols-[300px_5fr]">
      <div className="">
        <DocsMenu />
      </div>
      <div className="grow">
        <article className="prose dark:prose-invert lg:prose-base mx-auto max-w-6xl px-24 py-12">
          {props.children}
        </article>
      </div>
    </div>
  );
}
