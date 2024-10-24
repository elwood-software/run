import { join } from "node:path";
import { zodToJsonSchema } from "npm:zod-to-json-schema";

import { WorkflowSchema } from "../src/schema/workflow.ts";
import { LaunchSchema } from "../src/schema/launch.ts";

const dir = import.meta.dirname ?? ".";

console.log("writing workflow.json...");

Deno.writeTextFileSync(
  join(dir, "../schema/workflow.json"),
  JSON.stringify(zodToJsonSchema(WorkflowSchema, "workflow"), null, 2),
);

console.log("writing launch.json...");

Deno.writeTextFileSync(
  join(dir, "../schema/launch.json"),
  JSON.stringify(zodToJsonSchema(LaunchSchema, "launch"), null, 2),
);

console.log("done");
