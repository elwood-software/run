import type {Metadata} from 'next';
import {PropsWithChildren} from 'react';

export const metadata: Metadata = {
  title: 'Login | Elwood Run',
};

export default function Layout(props: PropsWithChildren) {
  return props.children;
}
