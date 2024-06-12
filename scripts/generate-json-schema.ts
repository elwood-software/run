#!/usr/bin/env deno run --allow-read --allow-write 

import { join } from "node:path";
import { zodToJsonSchema } from "npm:zod-to-json-schema";

import { WorkflowSchema } from "../src/schema/workflow.ts";
import { BootstrapSchema } from "../src/schema/bootstrap.ts";

Deno.writeTextFileSync(
  join(import.meta.dirname, "../schema/workflow.json"),
  JSON.stringify(zodToJsonSchema(WorkflowSchema, "workflow"), null, 2),
);

Deno.writeTextFileSync(
  join(import.meta.dirname, "../schema/bootstrap.json"),
  JSON.stringify(zodToJsonSchema(BootstrapSchema, "bootstrap"), null, 2),
);
