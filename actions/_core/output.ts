import * as fs from "./fs.ts";

export async function set(
  name: string,
  value: any,
  append = true,
): Promise<void> {
  let value_ = value;

  if (typeof value !== "string") {
    value_ = `json:${JSON.stringify(value)}`;
  }

  await fs.write("output://", `${name}=${value_}\n`, { append });
}
