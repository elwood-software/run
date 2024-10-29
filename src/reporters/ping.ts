import { AbstractReporter } from "./abstract.ts";
import type { ReporterChangeData, Workflow } from "../types.ts";
import { assert } from "../deps.ts";

export interface PingReporterOptions {
  url: string;
  interval?: number;
}

export class PingReporter extends AbstractReporter<PingReporterOptions> {
  #lock = false;
  #pingInterval: number | null = null;

  override setOptions(options: PingReporterOptions) {
    super.setOptions(options);

    assert(options.url, "Ping URL is required for PingReporter");

    this._startPingInterval();
  }

  override async destroy() {
    await Promise.resolve(() => this._stopPingInterval());
  }

  _startPingInterval() {
    this._stopPingInterval();
    this.#pingInterval = setInterval(() => {
      this._ping();
    }, 1000 * (this.options.interval ?? 60));
  }

  _stopPingInterval() {
    this.#pingInterval && clearInterval(this.#pingInterval);
  }

  async execute() {
  }

  async report(
    _report: Workflow.Report,
    _configuration?: Workflow.Configuration,
  ): Promise<void> {
  }

  async change(_type: string, _data: ReporterChangeData): Promise<void> {
  }

  async _ping(): Promise<void> {
    if (this.#lock) {
      return;
    }

    try {
      await fetch(this.options.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(new Date().getTime().toString()),
      });
    } catch (error) {
      console.error("Error pinging", error);
    } finally {
      this.#lock = false;
    }
  }
}
