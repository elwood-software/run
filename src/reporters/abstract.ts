import { Execution } from "../runtime/execution.ts";

export abstract class Reporter {
  abstract report(execution: Execution): Promise<void>;
}
