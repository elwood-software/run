// deno-lint-ignore-file require-await
import { RunnerResult, RunnerStatus, StateName } from "../constants.ts";
import type {
  ReporterChangeData,
  Result,
  RuntimeState,
  Status,
} from "../types.ts";
import { longId, shortId } from "../libs/short-id.ts";
import { EventEmitter } from "../libs/events.ts";

type Listener = (type: string, data: ReporterChangeData) => void;

export abstract class State implements RuntimeState {
  abstract id: string;
  abstract name: string;

  protected _status: Status = "pending";
  protected _result: Result = "none";
  protected _data: RuntimeState["state"] = {
    reason: null,
  };

  readonly #emitter = new EventEmitter();
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

  onChange(listener: Listener): void {
    this.#emitter.addListener("change", listener);
  }

  shortId(prefix: string = ""): string {
    return shortId(prefix).toUpperCase();
  }

  longId(prefix: string = ""): string {
    return longId(prefix).toLowerCase();
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
    this._status = RunnerStatus.Complete!;
    this._result = RunnerResult.Failure;
    this._data.reason = reason;

    this.#emitter.emit("change", "fail", {
      id: this.id,
      name: this.name,
      status: this._status,
      result: this._result,
      reason: this._data.reason,
    });
  }

  async succeed(reason: string = "") {
    this._status = RunnerStatus.Complete;
    this._result = RunnerResult.Success;
    this._data.reason = reason;

    this.#emitter.emit("change", "succeed", {
      id: this.id,
      name: this.name,
      status: this._status,
      result: this._result,
      reason: this._data.reason,
    });
  }

  async skip(reason: string = "") {
    this._status = RunnerStatus.Complete;
    this._result = RunnerResult.Skipped;
    this._data.reason = reason;

    this.#emitter.emit("change", "skip", {
      id: this.id,
      name: this.name,
      status: this._status,
      result: this._result,
      reason: this._data.reason,
    });
  }

  start() {
    this._status = RunnerStatus.Running;

    this.#startTime = performance.now();

    this.#emitter.emit("change", "start", {
      id: this.id,
      name: this.name,
      status: this._status,
      result: this._result,
      reason: this._data.reason,
    });
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

    this.#emitter.emit("change", "stop", {
      id: this.id,
      name: this.name,
      status: this._status,
      result: this._result,
      reason: this._data.reason,
    });
  }
}
