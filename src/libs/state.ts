// deno-lint-ignore-file require-await
import { RunnerResult, RunnerStatus, StateName } from "../constants.ts";
import type { Result, RuntimeState, Status } from "../types.ts";
import { shortId } from "./short-id.ts";

export abstract class State implements RuntimeState {
  abstract id: string;
  abstract name: string;

  protected _status: Status = "pending";
  protected _result: Result = "none";
  protected _data: RuntimeState["state"] = {
    reason: null,
  };

  #startTime: number | null = null;

  get status() {
    return this._status;
  }

  get result() {
    return this._result;
  }

  get state(): RuntimeState["state"] {
    const { reason, ...rest } = this._data;

    return {
      reason,
      ...rest,
    };
  }

  shortId(prefix: string = ""): string {
    return shortId(prefix);
  }

  setState<V = unknown>(name: string, value: V) {
    this._data[name] = value;
  }

  getState<V = unknown>(
    name: StateName,
    defaultValue: V | undefined = undefined,
  ): V {
    return this._data[name] ?? defaultValue;
  }

  getCombinedState() {
    return {
      id: this.id,
      name: this.name,
      ...this.state,
    };
  }

  async fail(reason: string = "") {
    this._status = RunnerStatus.Complete;
    this._result = RunnerResult.Failure;
    this._data.reason = reason;
  }

  async succeed(reason: string = "") {
    this._status = RunnerStatus.Complete;
    this._result = RunnerResult.Success;
    this._data.reason = reason;
  }

  async skip(reason: string = "") {
    this._status = RunnerStatus.Complete;
    this._result = RunnerResult.Skipped;
    this._data.reason = reason;
  }

  start() {
    this.#startTime = performance.now();
  }

  stop() {
    if (this.#startTime === null) {
      console.error("State.stop() called without State.start()");
    }

    if (this.#startTime !== null) {
      const end = performance.now();

      this.setState(StateName.Timing, {
        start: performance.timeOrigin + this.#startTime,
        end: performance.timeOrigin + end,
        elapsed: end - this.#startTime,
      });
    }
  }
}
