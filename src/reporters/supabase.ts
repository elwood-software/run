import { AbstractReporter } from "./abstract.ts";
import type {
  Json,
  JsonObject,
  ReporterChangeData,
  Status,
  Workflow,
} from "../types.ts";
import { assert, supabase } from "../deps.ts";
import { RunnerStatus } from "../constants.ts";

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
  #changeQueue: Array<
    {
      type: string;
      tracking_id: string;
      data: Omit<ReporterChangeData, "tracking_id">;
    }
  > = [];
  #lastStatus: Status = RunnerStatus.Pending;

  get client(): Client {
    assert(this.#client, "Client not initialized");
    return this.#client;
  }

  override setOptions(options: SupabaseReporterOptions) {
    super.setOptions(options);

    assert(options.url, "Supabase URL is required for SupabaseReporter");
    assert(
      options.anon_key,
      "Supabase anon key is required for SupabaseReporter",
    );
    assert(
      options.service_key,
      "Supabase service key is required for SupabaseReporter",
    );

    this.#client = supabase.createClient(options.url, options.anon_key, {
      db: {
        schema: "public",
      },
      global: {
        headers: {
          apikey: options.service_key,
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

  async execute() {
  }

  async report(
    report: Workflow.Report,
    configuration?: Workflow.Configuration,
  ): Promise<void> {
    const payload: JsonObject = {
      status: report.status,
      result: report.result,
      tracking_id: report.tracking_id,
      report: report,
    };

    if (configuration) {
      payload.configuration = configuration;
    }

    const result = await this.client.from("elwood_run").upsert([
      payload,
    ], {
      onConflict: "tracking_id",
      ignoreDuplicates: false,
    }).eq("tracking_id", report.tracking_id);

    result.error &&
      console.log("Error reporting", result.error);
  }

  async change(type: string, data: ReporterChangeData): Promise<void> {
    if (!data.tracking_id) {
      console.error("No tracking_id in change data", data);
      return;
    }

    // no need to double store the tracking_id
    const { tracking_id, ...eventData } = data;

    this.#changeQueue.push({ type, data: eventData, tracking_id });

    // always update status right away
    if (this.#lastStatus !== data.status) {
      await this.client.from("elwood_run").upsert([
        {
          status: data.status,
          tracking_id: data.tracking_id,
        },
      ], {
        onConflict: "tracking_id",
        ignoreDuplicates: false,
      }).eq("tracking_id", data.tracking_id);

      this.#lastStatus = data.status;
    }
  }

  async _flush(): Promise<void> {
    if (this.#lock) {
      return;
    }

    try {
      const result = await this.client.from("elwood_run_event").insert(
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
