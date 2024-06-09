// deno-lint-ignore-file require-await
import { RunnerResult, RunnerStatus } from "../constants.ts";
import type { RunnerDefinition } from "../types.ts";
import { shortId } from "./short-id.ts";
import { Logger } from "../deps.ts";

export abstract class State implements RunnerDefinition.State {
  abstract id: string;
  abstract name: string;

  protected _status: RunnerDefinition.Status = "pending";
  protected _result: RunnerDefinition.Result = "none";
  protected _data: RunnerDefinition.State["state"] = {
    reason: null,
  };

  #startTime: number | null = null;

  get status() {
    return this._status;
  }

  get result() {
    return this._result;
  }

  get state() {
    return {
      status: this.status,
      result: this.result,
      ...this._data,
    };
  }

  shortId(prefix: string = ""): string {
    return shortId(prefix);
  }

  setState<V = unknown>(name: string, value: V) {
    this._data[name] = value;
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

      this.setState("timing", {
        start: performance.timeOrigin + this.#startTime,
        end: performance.timeOrigin + end,
        elapsed: end - this.#startTime,
      });
    }
  }
}
