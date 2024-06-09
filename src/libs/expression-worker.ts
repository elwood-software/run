import { Json } from "../types.ts";

// Worker API
// these functions are available in the worker's
// execution context
Object.assign(self, {
  toJson(value: Json) {
    return `json:${JSON.stringify(value)}`;
  },

  fromJson(value: string) {
    if (value.startsWith("json:")) {
      return JSON.parse(value.substring(5));
    }

    return JSON.parse(value);
  },
});

// instal api
// these functions are NOT available to the worker
// function and act only as a way to communicate
// with the parent
const __elwood_internal = {
  postMessage(data: unknown) {
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    self.postMessage(data);
  },
};

// listen for message events which will only
// be sent from the parent
self.addEventListener("message", (e) => {
  const event = e as MessageEvent;

  try {
    const result = (0, eval)(event.data.code);

    if (result && result.then) {
      result.then((value: unknown) => {
        __elwood_internal.postMessage({
          type: "evaluate",
          result: value,
        });
      })
        .cache((err: Error) => {
          __elwood_internal.postMessage({
            type: "error",
            error: err,
          });
        });
      return;
    }

    __elwood_internal.postMessage({
      type: result,
      result,
    });
  } catch (err) {
    __elwood_internal.postMessage({
      type: "error",
      error: err,
    });
  }
});
