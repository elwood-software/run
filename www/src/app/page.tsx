import Link from 'next/link';

import {Rocket} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {FFrLogo} from '@/components/ffr-logo';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen">
      <div className="flex items-center justify-center flex-col px-6">
        <div className="bg-secondary p-4 rounded-2xl mb-6 border">
          <Rocket className="size-12 md:size-16 fill-background stroke-none" />
        </div>
        <h1 className="font-mono text-4xl md:text-6xl mb-6">elwood.run</h1>
        <div className="flex items-center space-x-2">
          <Button asChild variant="ghost">
            <a
              className="text-muted-foreground"
              href="https://github.com/elwood-software/run">
              Github
            </a>
          </Button>
          <Button asChild variant="ghost">
            <a
              className="text-muted-foreground"
              href="mailto:hello@elwood.company">
              hello@elwood.company
            </a>
          </Button>
        </div>
      </div>
      <div className="px-6">
        <Link
          href="/ffremote"
          className="mt-16 flex flex-col md:flex-row items-center border rounded p-3 space-x-6 bg-secondary/10 transition-all hover:scale-105">
          <FFrLogo size="text-lg mb-3 md:mb-0" />
          <span>Run FFmpeg on dedicated GPU powered instances</span>
        </Link>
      </div>
    </div>
  );
}
