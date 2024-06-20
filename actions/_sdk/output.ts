import { base64 } from "../_deps.ts";
import * as fs from "./fs.ts";

export async function set(
  name: string,
  // deno-lint-ignore no-explicit-any -- intentional
  value: any,
  append = true,
): Promise<void> {
  let value_ = value;

  if (typeof value !== "string") {
    value_ = `json+base64:${base64.encodeBase64(JSON.stringify(value))}`;
  }

  await fs.write("output://", `${name}<<EOF\n${value_}\nEOF\n`, { append });
}
