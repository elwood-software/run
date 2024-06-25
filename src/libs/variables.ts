import { Json } from "../types.ts";

export async function replaceVariablePlaceholdersInVariables(
  vars: Record<string, string>,
) {
  return await Promise.resolve(
    Object.entries(vars).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: replaceVariablesInValue(value, vars),
      };
    }, {}),
  );
}

export function replaceVariablesInValue(
  value: Json,
  vars: Record<string, string> = {},
): Json {
  let value_ = value;

  if (!value_) {
    return value_;
  }

  if (Array.isArray(value_)) {
    return value.map((v: Json) => replaceVariablesInValue(v, vars));
  }

  if (!Array.isArray(value_) && typeof value_ === "object") {
    return Object.entries(value_).reduce((acc, [key, v]) => {
      return {
        ...acc,
        [key]: replaceVariablesInValue(v, vars),
      };
    }, {});
  }

  if (typeof value_ !== "string") {
    return value_;
  }

  for (const [varKey, varValue] of Object.entries(vars)) {
    // straight replace
    value_ = value_.replaceAll(
      new RegExp("\\$" + varKey, "g"),
      varValue,
    );

    // if this is an input variable, replace the
    // prefix so people can access it directly
    if (varKey.includes("INPUT_")) {
      value_ = value_.replaceAll(
        new RegExp("\\$" + varKey.replace("INPUT_", ""), "g"),
        varValue,
      );
    }
  }

  return value_;
}

export async function parseVariableFile(
  content: string,
): Promise<Record<string, Json>> {
  const vars: Record<string, string> = {};
  const lines = content.split("\n");
  let currentName = "";
  let currentValue = "";
  let eof: string | null = null;

  for (const line of lines) {
    if (eof && line.trim().includes(eof)) {
      const [end] = line.split(eof);
      vars[currentName] = decodeValue((currentValue + end).trim());
      eof = null;
      continue;
    }

    if (line.includes("<<")) {
      const [name_, eof_] = line.split("<<");
      currentName = name_!.trim();
      eof = eof_!.trim();
      currentValue = "";
      continue;
    }

    if (eof) {
      currentValue += line + "\n";
      continue;
    }

    if (!line.includes("=")) {
      continue;
    }

    const [name, value] = line.split("=");
    vars[name!.trim()] = decodeValue(value!.trim());
  }

  return await Promise.resolve(vars);
}

export function decodeValue(value: string): Json {
  if (value.startsWith("json+base64:")) {
    return JSON.parse(atob(value.substring(12)));
  }

  if (value.startsWith("json:")) {
    return JSON.parse(value.substring(5));
  }

  return value;
}
