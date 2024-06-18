import { input, output } from "../_core/mod.ts";
import { OpenAI } from "https://deno.land/x/openai@v4.51.0/mod.ts";
import { assert } from "../deps.ts";

const Commands = {
  CreateCompletions: "createCompletions",
  CreateAssistant: "createAssistants",
} as const;
type CommandName = typeof Commands[keyof typeof Commands];

if (import.meta.main) {
  main();
}

async function main() {
  const command = input.get("command") as CommandName;
  const model = input.getOptional("model", "text-davinci-003");
  const apiKey = input.getOptional<string>("api_key", undefined);
  const prompt = input.getOptionalJson<string[]>("prompt") as string[];

  assert(command, "Command is required");
  assert(apiKey, "API Key is required");

  const result = await openai({
    command,
    model,
    apiKey,
    prompt,
  });

  await output.set("result", result);

  Deno.exit(0);
}

export type OpenAIOptions = {
  command: CommandName;
  model?: string;
  apiKey: string;
  prompt?: string[];
};

export async function openai(options: OpenAIOptions) {
  const client = new OpenAI({
    apiKey: options.apiKey,
  });

  console.log(options.prompt);

  switch (options.command) {
    case Commands.CreateCompletions: {
      return await client.chat.completions.create({
        model: options.model ?? "gpt-3.5-turbo-instruct",
        messages:
          options.prompt?.map((content) => ({ role: "user", content })) ?? [],
      });
    }

    default: {
      throw new Error(
        `Unknown command: ${options.command}. Available commands ${
          Object.keys(Commands).join(", ")
        }`,
      );
    }
  }
}
