import { FilePathOrUrl, isRemote, normalize } from "./path.ts";
import * as fs from "./fs.ts";
import * as fetch from "./fetch.ts";

export async function copy(src: FilePathOrUrl, dest: FilePathOrUrl) {
  const src_ = await normalize(src, { allowRemote: true });
  const dest_ = await normalize(dest, { allowRemote: true });

  // if both src and dest are local, we can use fs.copy
  if (!isRemote(src_) && !isRemote(dest_)) {
    return await fs.copy(src_, dest_);
  }

  // if src is remote and dest it local, we can use fetch.get
  if (isRemote(src_) && !isRemote(dest_)) {
    return await fetch.get(src_, {
      saveTo: dest_,
    });
  }

  // if src is local and dest is remote, we can use fetch.post
  if (!isRemote(src_) && isRemote(dest_)) {
    return await fetch.post(dest_, {
      body: await Deno.readFile(src_),
    });
  }

  // otherwise both src and dest are remote, we need to download and upload
  // we'll make a template file to store the download

  const tmp = await Deno.makeTempFile();

  await fetch.get(src_, {
    saveTo: tmp,
  });

  await fetch.post(dest_, {
    body: await Deno.readFile(tmp),
  });
}
