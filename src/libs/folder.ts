import { isAbsolute, join } from "../deps.ts";

export class Folder {
  constructor(readonly path: string) {
    Deno.mkdirSync(path, { recursive: true });
  }

  async mkdir(...paths: string[]) {
    await Deno.mkdir(this.join(...paths), { recursive: true });
    return new Folder(this.join(...paths));
  }

  join(...paths: string[]) {
    return join(this.path, ...paths);
  }

  async remove() {
    await Deno.remove(this.path, { recursive: true });
  }

  async writeText(fileName: string, content: string): Promise<string> {
    const filePath = this.join(fileName);
    await Deno.writeTextFile(filePath, content);
    return filePath;
  }

  async readText(fileName: string): Promise<string> {
    return await Deno.readTextFile(
      isAbsolute(fileName) ? fileName : this.join(fileName),
    );
  }
}
