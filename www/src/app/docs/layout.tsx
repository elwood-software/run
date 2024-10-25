import {PropsWithChildren} from 'react';
import type {Metadata} from 'next';

import {DocsMenu} from './menu';

export const metadata: Metadata = {
  title: 'Documentation | Elwood Run',
};

export default function Layout(props: PropsWithChildren) {
  return (
    <div className="h-screen w-full grid grid-cols-[300px_5fr]">
      <div className="">
        <DocsMenu />
      </div>
      <div className="grow">
        <div className="mx-auto max-w-6xl px-6 py-12">{props.children}</div>
      </div>
    </div>
  );
}
