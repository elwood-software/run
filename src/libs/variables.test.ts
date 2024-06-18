import { assertEquals } from "../deps.ts";

import {
  parseVariableFile,
  replaceVariablePlaceholdersInVariables,
} from "./variables.ts";

Deno.test("replaceVariablePlaceholdersInVariables()", async function () {
  assertEquals(
    await replaceVariablePlaceholdersInVariables({
      ENV_1: "test",
      ENV_2: "test $ENV_1",
    }),
    {
      ENV_1: "test",
      ENV_2: "test test",
    },
  );

  assertEquals(
    await replaceVariablePlaceholdersInVariables({
      ENV_1: "test",
      ENV_2: "test $ENV_1 $ENV_1",
    }),
    {
      ENV_1: "test",
      ENV_2: "test test test",
    },
  );
});

Deno.test("parseVariableFile", async function () {
  assertEquals(
    await parseVariableFile("name=value"),
    { name: "value" },
  );

  assertEquals(
    await parseVariableFile("name<<EOF\nthis\nis\na\nmultiline\nvalue\nEOF"),
    { name: "this\nis\na\nmultiline\nvalue" },
  );

  assertEquals(
    await parseVariableFile(
      "start=here\nname<<EOF\nthis\nis\na\nmultiline\nvalue\nEOF\nname2=hello",
    ),
    { start: "here", name: "this\nis\na\nmultiline\nvalue", name2: "hello" },
  );

  assertEquals(
    await parseVariableFile(
      "start=this has a lot of spaces\n\n\nend=end of empty lines @",
    ),
    { start: "this has a lot of spaces", end: "end of empty lines @" },
  );

  assertEquals(
    await parseVariableFile(
      [
        "result<<EOF",
        `json+base64:${btoa(JSON.stringify({ value: "here" }))}`,
        "EOF",
      ].join("\n"),
    ),
    {
      result: {
        value: "here",
      },
    },
  );
});
