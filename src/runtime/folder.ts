import { isAbsolute, join } from "../deps.ts";

export class Folder {
  constructor(readonly path: string) {
    Deno.mkdirSync(path, { recursive: true });
  }

  async mkdir(...paths: string[]) {
    await Deno.mkdir(this.join(...paths), { recursive: true, mode: 0o777 });
    return new Folder(this.join(...paths));
  }

  join(...paths: string[]) {
    return join(this.path, ...paths);
  }

  async remove() {
    await Deno.remove(this.path, { recursive: true });
  }

  async writeText(
    fileName: string,
    content: string,
    options: Deno.WriteFileOptions = {},
  ): Promise<string> {
    const filePath = this.join(fileName);

    // mode is permissive by default as these files are almost all
    // written into the runner working directory, which will need
    // to read from those files
    await Deno.writeTextFile(filePath, content, { mode: 0o777, ...options });
    return filePath;
  }

  async readText(fileName: string): Promise<string> {
    return await Deno.readTextFile(
      isAbsolute(fileName) ? fileName : this.join(fileName),
    );
  }
}
