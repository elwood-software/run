#!/usr/bin/env deno run --allow-read --allow-write 

import { join } from "node:path";
import { zodToJsonSchema } from "npm:zod-to-json-schema";

import { WorkflowSchema } from "../src/schema/workflow.ts";

Deno.writeTextFileSync(
  join(import.meta.dirname, "../schema.json"),
  JSON.stringify(zodToJsonSchema(WorkflowSchema, "workflow"), null, 2),
);
