import type {Metadata} from 'next';
import {PropsWithChildren} from 'react';

export const metadata: Metadata = {
  title: 'ffremote - Remote FFmpeg | powered by Elwood Run',
  description:
    'Run FFmpeg commands on-demand on dedicated GPU powered instances',
};

export default function Layout(props: PropsWithChildren) {
  return props.children;
}
