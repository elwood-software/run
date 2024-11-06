import Link from 'next/link';

import {Rocket} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {FFrLogo} from '@/components/ffr-logo';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex items-center justify-center flex-col px-6">
        <div className="bg-secondary p-4 rounded-2xl mb-6 border flex items-center justify-center flex-col">
          <Rocket className="size-12 md:size-16 fill-background stroke-none" />
          <h1 className="font-mono text-background text-sm mt-1 font-bold">
            elwood.run
          </h1>
        </div>
      </div>
      <div className="px-6">
        <Link
          href="/ffremote"
          className="mt-16 flex flex-col md:flex-row items-center rounded p-4 space-x-6 bg-primary/5 transition-all hover:scale-105">
          <span className="text-primary font-mono">/FFremote</span>
          <span className="text-primary/50">
            Run FFmpeg on dedicated GPU powered instances
          </span>
        </Link>
      </div>

      <div className="absolute right-3 top-3">
        <Button asChild variant="outline">
          <a
            className="text-muted-foreground"
            href="https://github.com/elwood-software/run">
            Github
          </a>
        </Button>
      </div>
    </div>
  );
}
