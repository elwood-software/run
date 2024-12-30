import {Pre, RawCode, highlight} from 'codehike/code';

import {CopyButton} from './copy-button';

export async function Code({codeblock}: {codeblock: RawCode}) {
  const highlighted = await highlight(codeblock, 'github-dark-dimmed');
  return (
    <div className="relative not-prose mb-3">
      <CopyButton
        text={highlighted.code}
        className="absolute right-px top-px bg-black p-2 rounded-lg"
      />

      <Pre
        code={highlighted}
        handlers={[]}
        className="border pl-3 pr-12 py-2 rounded-lg overflow-auto bg-black text-sm no-scrollbar"
      />
    </div>
  );
}
