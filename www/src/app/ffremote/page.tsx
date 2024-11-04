'use client';

import {useState} from 'react';
import {ClipboardIcon, CheckIcon, GitHubLogoIcon} from '@radix-ui/react-icons';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Link from 'next/link';

import {Button} from '@/components/ui/button';
import {FFrLogo} from '@/components/ffr-logo';

import {AccountButton} from './account';

export default function Page() {
  const [isCopied, setIsCopied] = useState('');

  function onCopied(name: string) {
    setIsCopied(name);

    setTimeout(() => {
      setIsCopied('');
    }, 1000 * 3);
  }

  return (
    <div className="h-full min-h-screen flex flex-col items-center justify-center">
      <div className="fixed top-3 right-3">
        <AccountButton />
      </div>

      <div className="container flex flex-col md:grid md:grid-cols-[2fr_3fr] md:gap-24 items-center justify-center">
        <div className="flex flex-col justify-center md:items-start items-center py-12 px-6 md:p-0">
          <div className="mb-8 text-center md:text-left">
            <h1 className="inline">
              <FFrLogo />
            </h1>
          </div>
          <h2 className="text-3xl font-mono tracking-tight font-bold uppercase mb-3">
            Remote FFmpeg
          </h2>
          <h2 className="text-xl max-w-2xl mb-1 font-bold">
            Run FFmpeg on dedicated GPU powered instances
          </h2>
          <h2 className="text-xl max-w-2xl text-foreground/75 mb-6 ">
            Transform your videos faster than ever with our cloud-based FFmpeg
            service. Harness the power of GPUs for lightning-fast encoding,
            transcoding, and more.
          </h2>

          <div className="md:hidden mb-6">
            <div className="bg-card rounded-lg p-3 border border-border font-mono flex flex-col shadow-lg text-xs">
              <span className="text-muted-foreground"># install ffremote</span>
              curl -fsSL https://elwood.run/ffr/install.sh | sh
            </div>
          </div>

          <div className="mb-6 space-x-2 flex flex-row items-center">
            <Button variant="secondary" asChild className="font-bold">
              <Link href="/docs/ffremote/start">Getting Started</Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/docs/ffremote">Docs</Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/docs/ffremote/pricing">Pricing</Link>
            </Button>

            <Button variant="outline" asChild>
              <a href="https://github.com/elwood-software/run" target="_blank">
                <GitHubLogoIcon className="size-4" />
              </a>
            </Button>
          </div>
        </div>
        <div className="hidden md:block">
          <div className="bg-card rounded-lg p-6 border border-border font-mono flex flex-col shadow-lg">
            <span className="text-muted-foreground"># install ffremote</span>

            <span className="mb-3 flex flex-row items-center justify-between space-x-6">
              <span>
                curl -fsSL https://elwood.run/ffremote/install.sh | sh
              </span>
              <span className="cursor-pointer">
                <CopyToClipboard
                  text="curl -fsSL https://elwood.run/ffremote/install.sh | sh"
                  onCopy={() => onCopied('i')}>
                  {isCopied === 'i' ? (
                    <CheckIcon className="size-4" />
                  ) : (
                    <ClipboardIcon className="size-4" />
                  )}
                </CopyToClipboard>
              </span>
            </span>
            <span className="text-muted-foreground">
              # replace ffmpeg with ffr
            </span>
            <span className="mb-3 flex flex-row items-center justify-between space-x-6">
              <span>
                {`ffremote -i "test.mov" -t 30 -c:v libx264 -c:a aac -strict experimental "test.mp4"`}
              </span>
              <span className="cursor-pointer">
                <CopyToClipboard
                  text={`ffremote -i "test.mov" -t 30 -c:v libx264 -c:a aac -strict experimental "test.mp4"`}
                  onCopy={() => onCopied('f')}>
                  {isCopied === 'f' ? (
                    <CheckIcon className="size-4" />
                  ) : (
                    <ClipboardIcon className="size-4" />
                  )}
                </CopyToClipboard>
              </span>
            </span>

            <span className="text-slate-500 flex flex-col text-sm mb-6">
              <span>{`> Uploading "test.mov"...`}</span>
              <span>
                &gt; Job Queued! Tracking ID:
                6b5337db-3038-425f-acd8-26a16c564ff9
              </span>

              <span>
                &gt; Watch the process: ffr watch
                6b5337db-3038-425f-acd8-26a16c564ff9
              </span>
              <span>
                &gt; Download the result: ffr get
                6b5337db-3038-425f-acd8-26a16c564ff9
              </span>
            </span>

            <span className="text-muted-foreground"># get the output</span>
            <span className="mb-3">
              ffr get 6b5337db-3038-425f-acd8-26a16c564ff9
            </span>
            <span className="text-slate-500 flex flex-col text-sm">
              <span>&gt; Downloading output...</span>
              <span>&gt; Job Output:</span>
              <span>&gt; ./test.mp4</span>
              <span>
                &gt; ./output-6b5337db-3038-425f-acd8-26a16c564ff9.txt
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
