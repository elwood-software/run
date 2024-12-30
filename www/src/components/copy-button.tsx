'use client';

import {ComponentProps, useState} from 'react';

import {Copy, Check} from 'lucide-react';

export type CopyButtonProps = ComponentProps<'button'> & {
  text: string;
};

export function CopyButton(props: CopyButtonProps) {
  const {text, ...buttonProps} = props;
  const [copied, setCopied] = useState(false);

  return (
    <button
      {...buttonProps}
      aria-label="Copy to clipboard"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}>
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
}
