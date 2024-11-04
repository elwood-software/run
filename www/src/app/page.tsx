import Link from 'next/link';

import {Button} from '@/components/ui/button';
import {FFrLogo} from '@/components/ffr-logo';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex items-center justify-center flex-col">
        <h1 className="font-mono text-6xl mb-6">elwood.run</h1>
        <div className="flex items-center space-x-2">
          <Button asChild variant="outline">
            <a
              className="text-muted-foreground"
              href="https://github.com/elwood-software/run">
              Github
            </a>
          </Button>
          <Button asChild variant="outline">
            <a
              className="text-muted-foreground"
              href="mailto:hello@elwood.company">
              hello@elwood.company
            </a>
          </Button>
        </div>
      </div>

      <Link
        href="/ffremote"
        className="mt-16 flex items-center border rounded p-6 space-x-6 bg-secondary/10 transition-all hover:scale-105">
        <FFrLogo size="text-lg" />
        <span>Run FFmpeg on dedicated GPU powered instances</span>
      </Link>
    </div>
  );
}
