'use client';

import {useState} from 'react';
import {ClipboardIcon, CheckIcon} from '@radix-ui/react-icons';
import {CopyToClipboard} from 'react-copy-to-clipboard';

import {Button} from '@/components/ui/button';






export default function Page() {
  const [isCopied, setIsCopied] = useState(false);

  function onCopied() {
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 1000 * 3);
  }

  return (
    <div className="h-full min-h-screen flex flex-col items-center justify-center">
      <div className="container flex flex-col md:grid md:grid-cols-[2fr_3fr] md:gap-24 items-center justify-center">
        <div className="flex flex-col justify-center md:items-start items-center py-12 px-6 md:p-0">
          <div className="mb-8 text-center md:text-left">
            <h1 className="font-mono text-2xl border border-green-500 rounded-lg py-2 px-4 text-green-500 bg-green-500/10 dark:bg-green-950/80 inline">
              /ffr
            </h1>
          </div>
          <h2 className="text-3xl font-mono tracking-tight font-bold uppercase mb-3">
            Remote FFmpeg
          </h2>
          <h2 className="text-xl max-w-2xl mb-1 font-bold">
            Run FFmpeg on dedicated GPU powered instances
          </h2>
          <h2 className="text-xl max-w-2xl text-foreground/75 mb-3 text-center md:text-left">
            Transform your videos faster than ever with our cloud-based FFmpeg
            service. Harness the power of GPUs for lightning-fast encoding,
            transcoding, and more.
          </h2>

          <p className="mb-6">
            $.01
            <span className="text-muted-foreground text-xs ml-1">
              /minute
            </span>{' '}
            + $0.09
            <span className="text-muted-foreground text-xs ml-1">
              /GB transfer
            </span>
          </p>

          <div className="mb-6 space-x-3">
            <Button variant="secondary" asChild className="font-bold">
              <a href="https://github.com/elwood-software/run/tree/main/docs/ffr/readme.md">
                Read the docs
              </a>
            </Button>

            <Button variant="outline" asChild className="font-bold">
              <a href="https://github.com/elwood-software/run">Github</a>
            </Button>
          </div>
        </div>
        <div className='hidden md:block'>
          <div className="bg-secondary dark:bg-black rounded-lg p-6 border border-border/50 font-mono flex flex-col shadow-lg">
            <span className="text-muted-foreground"># install ffr</span>

            <span className="mb-3 flex flex-row items-center space-x-6">
              <span>curl -fsSL https://elwood.run/ffr/install.sh | sh</span>
              <CopyToClipboard
                text="curl -fsSL https://elwood.run/ffr/install.sh | sh"
                onCopy={onCopied}>
                {isCopied ? (
                  <CheckIcon className="size-4" />
                ) : (
                  <ClipboardIcon className="size-4" />
                )}
              </CopyToClipboard>
            </span>
            <span className="text-muted-foreground">
              # replace ffmpeg with ffr
            </span>
            <span className="mb-6">
              {`ffr -i "test.mov" -vcode h264 -b:v 20971520 "test.mp4"`}
            </span>

            <span className="text-slate-500 flex flex-col text-sm mb-6">
              <span>&gt; Job Started</span>
              <span>
                &gt; Tracking ID: 6b5337db-3038-425f-acd8-26a16c564ff9
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
            <span className="text-slate-500 flex flex-col text-sm mb-6">
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
