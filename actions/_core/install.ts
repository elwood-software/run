import {
  assert,
  basename,
  encodeHex,
  expandGlob,
  extname,
  join,
  relative,
} from "../deps.ts";

import * as fetch from "./fetch.ts";
import * as fs from "./fs.ts";
import * as command from "./command.ts";

export class Install {
  readonly #dir = Deno.makeTempDirSync({
    dir: Deno.cwd(),
  });

  join(...args: string[]) {
    return join(this.#dir, ...args);
  }

  async _inToolCache(src: string): Promise<boolean> {
    const toolCachePath = await this._toolCachePath(src);
    return fs.exists(toolCachePath);
  }

  async _toolCachePath(src: string): Promise<string> {
    const toolCache = Deno.env.get("ELWOOD_TOOL_CACHE") ?? "";

    const cacheName = encodeHex(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(src)),
    );

    return join(toolCache, cacheName);
  }

  async fetch(src: string): Promise<string> {
    const saveTo = this.join(basename(src));

    // see if this is in the tool cache
    if (await this._inToolCache(src)) {
      await fs.copy(await this._toolCachePath(src), saveTo);
    }

    await fetch.get(src, {
      saveTo,
    });

    // save it to the tool cache
    await fs.copy(saveTo, await this._toolCachePath(src));

    return saveTo;
  }

  async find(srcGlob: string): Promise<string> {
    const found = await expandGlob(this.join(srcGlob)).next();

    if (!found?.value?.isFile) {
      throw new Error(`Unable to find ${srcGlob} in ${this.#dir}`);
    }

    return relative(this.#dir, found.value.path);
  }

  async move(srcName: string, dest: string) {
    await fs.rename(this.join(srcName), dest);
  }

  async findAndMove(srcGlob: string, dest: string) {
    const found = await this.find(srcGlob);
    await this.move(found, dest);
  }

  async execute(bin: string, args: string[] = []) {
    return await command.execute(bin, {
      cwd: this.#dir,
      args,
    });
  }

  async extract(src: string) {
    await extract(src, {
      cwd: this.#dir,
    });
  }

  async cleanup() {
    await Deno.remove(this.#dir, { recursive: true });
  }
}

export type ExtractOptions = {
  cwd?: string;
};

export async function extract(
  src: string,
  options: ExtractOptions = {},
): Promise<void> {
  switch (extname(src)) {
    case ".zip":
      return await extractZip(src, options);
    default:
      return await extractTar(src, options);
  }
}

export async function extractTar(
  src: string,
  options: ExtractOptions = {},
): Promise<void> {
  const cwd = options.cwd ?? Deno.cwd();
  const cmd = new Deno.Command("tar", {
    cwd,
    args: ["-xf", src],
    env: {
      PATH: Deno.env.get("PATH") ?? "",
    },
    stdout: "inherit",
    stderr: "inherit",
  });

  assert((await cmd.output()).code === 0);
}

export async function extractZip(
  src: string,
  options: ExtractOptions = {},
): Promise<void> {
  const cwd = options.cwd ?? Deno.cwd();
  const cmd = new Deno.Command("unzip", { cwd, args: ["-q", src] });
  await cmd.output();
}
