import { type FilePathOrUrl, normalize } from "./path.ts";
import { base64 } from "../deps.ts";

export async function copy(src: FilePathOrUrl, dest: FilePathOrUrl) {
  await Deno.copyFile(
    await normalize(src, { allowRemote: false }),
    await normalize(dest, { allowRemote: false }),
  );
}

export async function mkdir(path: FilePathOrUrl, recursive = true) {
  await Deno.mkdir(
    await normalize(path),
    { recursive },
  );
}

export async function rename(from: FilePathOrUrl, to: FilePathOrUrl) {
  return await Deno.rename(
    await normalize(from),
    await normalize(to),
  );
}

export async function remove(path: FilePathOrUrl, recursive = false) {
  return await Deno.remove(
    await normalize(path),
    { recursive },
  );
}

export async function write(
  path: FilePathOrUrl,
  content: string,
  options: Deno.WriteFileOptions = {},
) {
  // if there's a data: prefix, decode it
  const { data } = parseContentString(content);

  return await Deno.writeTextFile(
    await normalize(path),
    data,
    options,
  );
}

export async function exists(path: FilePathOrUrl): boolean {
  try {
    await Deno.stat(await normalize(path, { allowRemote: false }));
    return true;
  } catch {
    return false;
  }
}

export async function read(path: FilePathOrUrl) {
  return await Deno.readTextFile(
    await normalize(path),
  );
}

type ContentString = {
  contentType: string | undefined;
  encodingType: string | undefined;
  params: Record<string, string>;
  data: string;
};

function parseContentString(content: string): ContentString {
  if (!content.startsWith("data:")) {
    return {
      contentType: undefined,
      encodingType: undefined,
      params: {},
      data: content,
    };
  }

  let content_: string = content;
  const [prefix, ...data] = content.substring(5).split(",");
  const data_ = data.join(",");
  const [contentType, ...params] = prefix.split(";");
  const encodingType = params.pop();

  if (encodingType === "base64") {
    content_ = new TextDecoder().decode(base64.decodeBase64(data_));
  }

  return {
    contentType: contentType,
    encodingType,
    params: Object.fromEntries(params.map((param) => param.split("="))),
    data: content_,
  };
}
