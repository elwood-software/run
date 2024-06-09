export async function replaceVariablePlaceholdersInVariables(
  vars: Record<string, string>,
) {
  return await Promise.resolve(
    Object.entries(vars).reduce((acc, [key, value]) => {
      let value_ = value;

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

      return {
        ...acc,
        [key]: value_,
      };
    }, {}),
  );
}

export async function parseVariableFile(
  content: string,
): Promise<Record<string, string>> {
  const vars: Record<string, string> = {};
  const lines = content.split("\n");
  let currentName = "";
  let currentValue = "";
  let eof: string | null = null;

  for (const line of lines) {
    if (eof && line.includes(eof)) {
      const [end] = line.split(eof);
      vars[currentName] = (currentValue + end).trim();
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
    }

    if (!line.includes("=")) {
      continue;
    }

    const [name, value] = line.split("=");
    vars[name!.trim()] = value!.trim();
  }

  return await Promise.resolve(vars);
}
