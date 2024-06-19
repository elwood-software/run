// deno-lint-ignore-file require-await
import { AbstractReporter } from "./abstract.ts";
import type { Json, ReporterChangeData, Workflow } from "../types.ts";
import { assert, supabase } from "../deps.ts";

export interface SupabaseReporterOptions {
  url: string;
  anon_key: string;
  service_key: string;
}

type Client = supabase.SupabaseClient<Json, "public">;

export class SupabaseReporter
  extends AbstractReporter<SupabaseReporterOptions> {
  #client: Client | null = null;

  #lock = false;
  #changeQueueInterval: number | null = null;
  #changeQueue: Array<{ type: string; data: ReporterChangeData }> = [];

  get client(): Client {
    assert(this.#client, "Client not initialized");

    return this.#client;
  }

  override setOptions(options: SupabaseReporterOptions) {
    super.setOptions(options);

    assert(options.url, "Supabase URL is required");
    assert(options.anon_key, "Supabase anon key is required");
    assert(options.service_key, "Supabase service key is required");

    this.#client = supabase.createClient(options.url, options.anon_key, {
      db: {
        schema: "public",
      },
      global: {
        headers: {
          apikey: options.anon_key,
          authorization: `Bearer ${options.service_key}`,
        },
      },
    });

    this.#changeQueueInterval = setInterval(() => {
      this._flush();
    }, 1000 * 60 * 1);
  }

  override async destroy() {
    await this._flush();
    this._stopChangeQueue();
  }

  _startChangeQueue() {
    this._stopChangeQueue();
    this.#changeQueueInterval = setInterval(() => {
      this._flush();
    }, 1000 * 60 * 1);
  }

  _stopChangeQueue() {
    this.#changeQueueInterval && clearInterval(this.#changeQueueInterval);
  }

  async report(report: Workflow.Report): Promise<void> {
    const result = await this.client.from("run").upsert([
      {
        status: report.status,
        result: report.result,
        tracking_id: report.tracking_id,
        report: report,
      },
    ], {
      onConflict: "tracking_id",
      ignoreDuplicates: false,
    }).eq("tracking_id", report.tracking_id);

    result.error &&
      console.log("Error reporting", result.error);
  }

  async change(type: string, data: ReporterChangeData): Promise<void> {
    this.#changeQueue.push({ type, data });
  }

  async _flush(): Promise<void> {
    if (this.#lock) {
      return;
    }

    try {
      const result = await this.client.from("run_event").insert(
        this.#changeQueue,
      );

      result.error &&
        console.log("Error reporting", result.error);

      this.#changeQueue = [];
    } catch (error) {
      console.error("Error flushing change queue", error);
    } finally {
      this.#lock = false;
    }
  }
}
