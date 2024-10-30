import { z } from "../deps.ts";
import { JobSchema } from "./job.ts";
import {
  Description,
  Label,
  Name,
  Permissions,
  Variable,
  When,
} from "./scalar.ts";

/**
 * Workflow Schema
 *
 * @see https://elwood.run/docs/workflow-syntax
 * @see https://github.com/elwood-software/run
 */
export const WorkflowSchema = z.object({
  /**
   * Helper to allow users to identify the schema version of this document
   */
  "$schema": z.string()
    .default("https://x.elwood.run/schema@latest.json")
    .describe("The schema version of this document")
    .optional(),

  /**
   * Name of the workflow.
   * @see https://elwood.run/docs/workflow-syntax#name
   */
  name: Name.describe("Name of the workflow"),

  /**
   * Description of the workflow.
   * @see https://elwood.run/docs/workflow-syntax#description
   */
  description: Description.describe(
    "Description of the workflow. Not passed to report",
  ).optional(),

  /**
   * Label of the workflow.
   */
  label: Label.describe("Label of the workflow").optional(),

  /**
   * When to run the workflow.
   * @see https://elwood.run/docs/workflow-syntax#when
   */
  when: When.optional(),

  /**
   * Default values for jobs in the workflow
   * @see https://elwood.run/docs/workflow-syntax#defaults
   */
  defaults: z.object({
    /**
     * Default permissions for jobs in the workflow
     * @see https://elwood.run/docs/workflow-syntax#defaults.permissions
     */
    permissions: Permissions.optional(),
  }).optional(),

  /**
   * Jobs to run in the workflow.
   * @see https://elwood.run/docs/workflow-syntax#jobs
   */
  jobs: z.record(
    z.string().regex(/[a-zA-Z-]+/, {
      message: "Job name must be a valid slug",
    }),
    JobSchema,
  ),

  /**
   * Metadata for the workflow.
   * @see https://elwood.run/docs/workflow-syntax#metadata
   */
  metadata: z.record(z.string(), z.any()).optional(),

  /**
   * Variables for the workflow.
   * @see https://elwood.run/docs/workflow-syntax#variables
   */
  variables: z.record(z.string(), Variable).optional(),
});
