import type { Workflow } from "../types.ts";

export function stepHasRun(def: Workflow.Step): def is Workflow.StepWithRun {
  return (def as Workflow.StepWithRun).run !== undefined;
}

export function stepHasAction(
  def: Workflow.Step,
): def is Workflow.StepSchemaWithAction {
  return (def as Workflow.StepSchemaWithAction).action !== undefined;
}
