import * as fs from "./fs.ts";

export async function set(name: string, value: string) {
  await fs.write("output://", `${name}=${value}\n`, { append: true });
}
