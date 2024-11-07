import Link from 'next/link';
import {Rocket} from 'lucide-react';

import {RunLogo} from '@/components/run-logo';
import {Button} from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex items-center justify-center flex-col px-6">
        <h1 className="font-mono relative">
          <RunLogo className="size-52" />
          <span className="absolute w-full bottom-0 pb-[20%] text-center opacity-75 text-xs text-black">
            elwood.run
          </span>
        </h1>
      </div>
      <div className="px-6">
        <Link
          href="/ffremote"
          className="mt-16 flex flex-col md:flex-row items-center rounded p-4 space-x-6 bg-primary/5 transition-all hover:scale-105">
          <span className="text-primary font-mono">/ffremote</span>
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
