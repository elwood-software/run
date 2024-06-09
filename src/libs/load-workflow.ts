import { extname, parseYaml } from "../deps.ts";
import type { JsonObject, Workflow } from "../types.ts";
import { WorkflowSchema } from "../schema/workflow.ts";

export async function loadWorkflowFile(
  file: string,
): Promise<JsonObject> {
  switch (extname(file)) {
    case ".yml":
    case ".yaml": {
      return parseYaml(await Deno.readTextFile(file)) as JsonObject;
    }

    case ".json": {
      return JSON.parse(await Deno.readTextFile(file)) as JsonObject;
    }
    default: {
      throw new Error(`Unsupported file extension: ${extname(file)}`);
    }
  }
}

export async function verifyWorkflow(
  possibleWorkflow: JsonObject,
): Promise<Workflow.Configuration> {
  return await WorkflowSchema.parseAsync(possibleWorkflow);
}

export async function loadAndVerifyWorkflow(
  file: string,
): Promise<Workflow.Configuration> {
  return await verifyWorkflow(await loadWorkflowFile(file));
}
